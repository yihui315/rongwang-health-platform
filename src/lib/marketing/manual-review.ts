/**
 * Manual Review 交付机制
 * 功能：
 * 1. 通知（飞书 / 邮件 / Slack）
 * 2. 审核队列（read + approve/reject 恢复 pipeline）
 * 3. 超时升级规则
 *
 * 设计：运营人员收到通知 → 登录审核台 → 点 approve/reject → pipeline 恢复
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ReviewNotification {
  jobId: string;
  runId: string;
  step: string;
  blocker: string;
  readyScore?: number;
  threshold?: number;
  articleRef: string;
  seoReportRef?: string;
  pendingSince: string;
  priority: 'low' | 'medium' | 'high';
  estimatedResolveTime?: string;
  notifiedAt?: string;
}

export interface ReviewAction {
  jobId: string;
  runId: string;
  action: 'approve_manual' | 'reject' | 'edit_article' | 're_score';
  reviewer?: string;
  reason?: string;
  reviewedAt: string;
  evidenceRef?: string;
}

// ── Notification Adapters ──────────────────────────────────────────────────────

export interface NotificationAdapter {
  sendReviewNotification(notification: ReviewNotification): Promise<void>;
}

export class FeishuNotificationAdapter implements NotificationAdapter {
  constructor(private webhookUrl?: string) {}

  async sendReviewNotification(notification: ReviewNotification): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('[manual-review] Feishu webhook not configured, skipping notification');
      return;
    }

    const priorityEmoji = { low: '🟡', medium: '🟠', high: '🔴' };
    const emoji = priorityEmoji[notification.priority];

    const payload = {
      msg_type: 'interactive',
      card: {
        header: {
          title: { tag: 'plain_text', content: `${emoji} 人工审核待办 | ${notification.jobId}` },
          template: notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'orange' : 'yellow',
        },
        elements: [
          { tag: 'div', text: { tag: 'lark_md', content: `**步骤**: ${notification.step}\n**阻塞原因**: ${notification.blocker}` } },
          { tag: 'div', text: { tag: 'lark_md', content: notification.readyScore !== undefined
            ? `**SEO Ready Score**: ${notification.readyScore} / ${notification.threshold ?? 70}`
            : '' } },
          { tag: 'div', text: { tag: 'lark_md', content: `**待审时间**: ${new Date(notification.pendingSince).toLocaleString('zh-CN')}\n**文章路径**: \`${notification.articleRef}\`` } },
          { tag: 'action', actions: [
            { tag: 'button', text: { tag: 'plain_text', content: '✅ 审核通过' }, type: 'primary', value: { action: 'approve_manual', jobId: notification.jobId, runId: notification.runId } },
            { tag: 'button', text: { tag: 'plain_text', content: '❌ 驳回' }, type: 'danger', value: { action: 'reject', jobId: notification.jobId, runId: notification.runId } },
          ]},
        ],
      },
    };

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Feishu notification failed: ${response.status}`);
    }
  }
}

export class EmailNotificationAdapter implements NotificationAdapter {
  constructor(private options?: { smtpHost?: string; from?: string; to?: string }) {}

  async sendReviewNotification(notification: ReviewNotification): Promise<void> {
    // Email adapter: real implementation would use nodemailer
    console.log(`[manual-review] Email notification (mock): Job ${notification.jobId} needs review`);
    // TODO: Integrate with nodemailer/SendGrid for actual email sending
  }
}

export class ConsoleNotificationAdapter implements NotificationAdapter {
  async sendReviewNotification(notification: ReviewNotification): Promise<void> {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  人工审核待办                                                  ║
╠══════════════════════════════════════════════════════════════╣
║  Job ID:    ${notification.jobId}
║  Run ID:    ${notification.runId}
║  步骤:      ${notification.step}
║  阻塞原因:  ${notification.blocker}
║  SEO Score: ${notification.readyScore ?? 'N/A'} / ${notification.threshold ?? 70}
║  待审时间:  ${new Date(notification.pendingSince).toLocaleString('zh-CN')}
║  文章路径:  ${notification.articleRef}
╚══════════════════════════════════════════════════════════════╝
    `);
  }
}

// ── Notification Dispatcher ──────────────────────────────────────────────────

export class ReviewNotifier {
  private adapters: NotificationAdapter[] = [];

  constructor() {
    // Auto-configure from environment
    if (process.env.FEISHU_WEBHOOK_URL) {
      this.adapters.push(new FeishuNotificationAdapter(process.env.FEISHU_WEBHOOK_URL));
    }
    if (process.env.SMTP_HOST) {
      this.adapters.push(new EmailNotificationAdapter({
        smtpHost: process.env.SMTP_HOST,
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_REVIEW_TO,
      }));
    }
    // Always log to console
    this.adapters.push(new ConsoleNotificationAdapter());
  }

  async notify(notification: ReviewNotification): Promise<void> {
    for (const adapter of this.adapters) {
      try {
        await adapter.sendReviewNotification(notification);
      } catch (err) {
        console.error(`[manual-review] Notification adapter ${adapter.constructor.name} failed: ${err}`);
      }
    }
  }
}

// ── Review Queue Management ──────────────────────────────────────────────────

const REVIEW_QUEUE_PATH = '/tmp/marketing-pipeline/evidence/manual-review-queue.json';

export function enqueueReview(notification: ReviewNotification): void {
  const queue = readReviewQueue();
  // Avoid duplicates
  if (!queue.find(n => n.jobId === notification.jobId && n.runId === notification.runId)) {
    queue.push(notification);
    writeReviewQueue(queue);
  }
}

export function readReviewQueue(): ReviewNotification[] {
  if (!existsSync(REVIEW_QUEUE_PATH)) return [];
  try {
    return JSON.parse(readFileSync(REVIEW_QUEUE_PATH, 'utf-8')) as ReviewNotification[];
  } catch {
    return [];
  }
}

export function writeReviewQueue(queue: ReviewNotification[]): void {
  const dir = join('/tmp/marketing-pipeline/evidence');
  if (!existsSync(dir)) {
    require('fs').mkdirSync(dir, { recursive: true });
  }
  writeFileSync(REVIEW_QUEUE_PATH, JSON.stringify(queue, null, 2), 'utf-8');
}

export function dequeueReview(jobId: string, runId: string): ReviewNotification | null {
  const queue = readReviewQueue();
  const index = queue.findIndex(n => n.jobId === jobId && n.runId === runId);
  if (index === -1) return null;
  const [item] = queue.splice(index, 1);
  writeReviewQueue(queue);
  return item;
}

export function getPendingReviews(): ReviewNotification[] {
  return readReviewQueue();
}

export function getOldestPendingAgeMs(): number | null {
  const queue = readReviewQueue();
  if (queue.length === 0) return null;
  const oldest = queue.reduce((min, n) => {
    const t = new Date(n.pendingSince).getTime();
    return t < min ? t : min;
  }, Infinity);
  return Date.now() - oldest;
}

// ── Review Action Processing ─────────────────────────────────────────────────

export interface ReviewActionResult {
  success: boolean;
  action: ReviewAction;
  resumedJob?: { jobId: string; runId: string };
  error?: string;
}

export async function processReviewAction(action: ReviewAction): Promise<ReviewActionResult> {
  const { jobId, runId, action: actionType } = action;

  if (actionType === 'reject') {
    dequeueReview(jobId, runId);
    return { success: true, action, error: 'Job rejected and removed from queue' };
  }

  if (actionType === 'approve_manual') {
    // Remove from queue
    const notification = dequeueReview(jobId, runId);
    if (!notification) {
      return { success: false, action, error: 'Review not found in queue' };
    }

    // Resume pipeline: signal to cron job or API that this job can continue
    // The cron job will pick up the approved job on next run.
    // Write approval flag to the same evidenceDir used by pipeline-runner:
    //   /tmp/marketing-pipeline/evidence/{jobId}/{runId}_YYYY-MM-DDTHH/.approved
    // The runId in queue is the short form (run_8e7dda2c); we look for any
    // matching approved dir under the jobId folder.
    const { ensureJobEvidenceDir } = await import('./adapters/evidence-writer');
    const jobEvidenceDir = ensureJobEvidenceDir(jobId);
    const approvalSignal = {
      jobId,
      runId,
      approvedAt: action.reviewedAt,
      approvedBy: action.reviewer ?? 'unknown',
      reason: action.reason,
    };
    const signalPath = join(jobEvidenceDir, `${runId}.approved.json`);
    writeFileSync(signalPath, JSON.stringify(approvalSignal, null, 2), 'utf-8');

    return {
      success: true,
      action,
      resumedJob: { jobId, runId },
    };
  }

  return { success: false, action, error: `Unknown action: ${actionType}` };
}

// ── Convenience exports ─────────────────────────────────────────────────────

export const reviewNotifier = new ReviewNotifier();

export async function notifyAndEnqueue(notification: ReviewNotification): Promise<void> {
  notification.notifiedAt = new Date().toISOString();
  enqueueReview(notification);
  await reviewNotifier.notify(notification);
}