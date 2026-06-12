#!/usr/bin/env node
/**
 * AI 营销流水线 CLI 入口
 *
 * 用法：
 *   npx ts-node scripts/marketing/pipeline-cli.ts --job ./jobs/health-education-001.json
 *   npx ts-node scripts/marketing/pipeline-cli.ts --trigger cron --job-id mj_health_edu_001
 *   npx ts-node scripts/marketing/pipeline-cli.ts --list-pending
 *   npx ts-node scripts/marketing/pipeline-cli.ts --approve mj_xxx run_xxx --reviewer alice
 *   npx ts-node scripts/marketing/pipeline-cli.ts --reject mj_xxx run_xxx --reason "内容不符合品牌调性"
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { parseArgs } from 'util';
import { runMarketingPipeline } from '../../lib/marketing/pipeline-runner';
import { type MarketingJob, type Platform, type RunRecord } from '../../lib/marketing/job-types';
import {
  getPendingReviews,
  processReviewAction,
  type ReviewAction,
} from '../../lib/marketing/manual-review';
import { readEventsLog, readRunRecord } from '../../lib/marketing/adapters/evidence-writer';

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      job: { type: 'string', short: 'j' },
      'job-id': { type: 'string' },
      trigger: { type: 'string', short: 't', default: 'manual' },
      list: { type: 'boolean', short: 'l' },
      'list-pending': { type: 'boolean' },
      approve: { type: 'boolean' },
      reject: { type: 'boolean' },
      resume: { type: 'string' },
      reviewer: { type: 'string', short: 'r' },
      reason: { type: 'string', short: 'R' },
      dry: { type: 'boolean' },
      verbose: { type: 'boolean', short: 'v' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  // List pending reviews
  if (values['list-pending'] || values.list) {
    const pending = getPendingReviews();
    if (pending.length === 0) {
      console.log('✅ 没有待审核的人工复核任务');
      process.exit(0);
    }
    console.log(`\n📋 待审核任务 (${pending.length}):\n`);
    for (const p of pending) {
      const age = Math.round((Date.now() - new Date(p.pendingSince).getTime()) / 60000);
      const priority = (p as unknown as Record<string, unknown>).priority as string | undefined ?? 'normal';
      console.log(`  [${priority.toUpperCase()}] ${p.jobId}`);
      console.log(`    Run: ${p.runId} | 步骤: ${p.step} | 阻塞: ${p.blocker}`);
      console.log(`    待审: ${age}分钟前 | SEO: ${p.readyScore ?? 'N/A'}/${p.threshold ?? 70}`);
      console.log(`    文章: ${p.articleRef}`);
      console.log('');
    }
    process.exit(0);
  }

  // Approve a job
  if (values.approve) {
    const [jobId, runId] = positionals;
    if (!jobId || !runId) {
      console.error('❌ 需要提供 jobId 和 runId');
      printUsage();
      process.exit(1);
    }
    const action: ReviewAction = {
      jobId,
      runId,
      action: 'approve_manual',
      reviewer: values.reviewer,
      reason: values.reason,
      reviewedAt: new Date().toISOString(),
    };
    const result = await processReviewAction(action);
    if (result.success) {
      console.log(`✅ Job ${jobId}/${runId} 已审核通过，流水线将恢复执行`);
    } else {
      console.error(`❌ 审核失败: ${result.error}`);
      process.exit(1);
    }
    process.exit(0);
  }

  // Reject a job
  if (values.reject) {
    const [jobId, runId] = positionals;
    if (!jobId || !runId) {
      console.error('❌ 需要提供 jobId 和 runId');
      process.exit(1);
    }
    const action: ReviewAction = {
      jobId,
      runId,
      action: 'reject',
      reviewer: values.reviewer,
      reason: values.reason,
      reviewedAt: new Date().toISOString(),
    };
    const result = await processReviewAction(action);
    if (result.success) {
      console.log(`❌ Job ${jobId}/${runId} 已驳回`);
    } else {
      console.error(`❌ 操作失败: ${result.error}`);
      process.exit(1);
    }
    process.exit(0);
  }

  // Resume an approved job
  if (values.resume) {
    const [jobId] = positionals.length >= 1 ? positionals : [values.resume];
    if (!jobId) {
      console.error('❌ 需要提供 jobId'); printUsage(); process.exit(1);
    }
    // Try to load the original job file first
    const jobFile = join(process.cwd(), 'jobs', `${jobId}.json`);
    let job: MarketingJob;
    if (existsSync(jobFile)) {
      const raw = JSON.parse(readFileSync(jobFile, 'utf-8'));
      job = raw as MarketingJob;
    } else {
      // Fall back to building a minimal job from the prepared context
      const { ensureJobEvidenceDir } = await import('../../lib/marketing/adapters/evidence-writer');
      const jobEvidenceDir = ensureJobEvidenceDir(jobId);
      const contextPath = join(jobEvidenceDir, 'prepared-context.json');
      if (!existsSync(contextPath)) {
        console.error(`❌ 未找到 job 文件(${jobFile}) 也未找到 checkpoint(${contextPath})`);
        process.exit(1);
      }
      const ctx = JSON.parse(readFileSync(contextPath, 'utf-8'));
      job = {
        job_id: jobId,
        trigger: 'manual',
        locale: ctx.locale ?? 'zh-CN',
        source: { type: 'topic', topic: ctx.primaryKeyword, brief_markdown: ctx.briefMarkdown },
        content: { template_key: ctx.templateKey, max_words: ctx.maxWords, human_review_required: false },
        seo: { primary_keyword: ctx.primaryKeyword, secondary_keywords: ctx.secondaryKeywords ?? [] },
        distribution: { channels: (ctx.channels ?? []).map((p: string) => ({ platform: p as Platform, required: false })) },
        runtime: { shadow_mode: false, skip_human_review: true },
      } as unknown as MarketingJob;
    }
    // Override runtime for resume
    job.runtime = { ...(job.runtime ?? {}), shadow_mode: false, skip_human_review: true };
    console.log(`⏳ 从 checkpoint 恢复 Pipeline: ${jobId}`);
    console.log('');
    const start = Date.now();
    try {
      const record = await runMarketingPipeline(job);
      const elapsed = Date.now() - start;
      console.log(`\n${record.status === 'success' || record.status === 'degraded_success' ? '✅' : '❌'} Pipeline 完成 (${(elapsed / 1000).toFixed(1)}s)`);
      console.log(`   状态: ${record.status} | Run: ${record.runId}`);
      if (record.publishSummary) {
        const ps = record.publishSummary;
        console.log(`   发布: 成功${ps.succeeded.length}个 / 失败${ps.failed.length}个`);
      }
      process.exit(record.status === 'failed' ? 1 : 0);
    } catch (err) {
      console.error(`❌ Pipeline 执行异常: ${err}`);
      process.exit(1);
    }
  }

  // Run a job
  const jobId = values['job-id'] ?? (values.job ? extractJobId(values.job) : null);
  if (!jobId) {
    console.error('❌ 需要提供 --job-id 或 --job <file>');
    printUsage();
    process.exit(1);
  }

  let job: MarketingJob;

  if (values.job && existsSync(resolve(values.job))) {
    // Load from file
    const content = readFileSync(resolve(values.job), 'utf-8');
    try {
      job = JSON.parse(content) as MarketingJob;
    } catch {
      console.error(`❌ Job 文件格式错误: ${values.job}`);
      process.exit(1);
    }
  } else {
    // Build a default job from job-id
    job = buildDefaultJob(jobId, values.trigger as 'cron' | 'manual' | 'api');
  }

  if (values.verbose) {
    console.log(`\n🚀 启动 Pipeline v1`);
    console.log(`   Job: ${job.job_id}`);
    console.log(`   Trigger: ${job.trigger}`);
    console.log(`   shadow_mode: ${job.runtime?.shadow_mode ?? true}`);
    console.log('');
  }

  if (values.dry) {
    console.log('🧪 Dry run - 仅验证，不执行');
    process.exit(0);
  }

  console.log(`⏳ Pipeline 运行中...`);
  const start = Date.now();

  try {
    const record = await runMarketingPipeline(job);
    const elapsed = Date.now() - start;

    console.log(`\n${record.status === 'success' || record.status === 'degraded_success' ? '✅' : record.status === 'manual_review' ? '⏸' : '❌'} Pipeline 完成`);
    console.log(`   状态: ${record.status}`);
    console.log(`   耗时: ${(elapsed / 1000).toFixed(1)}s`);
    console.log(`   Run ID: ${record.runId}`);
    console.log(`   Evidence: ${record.evidenceDir}`);

    if (record.publishSummary) {
      const ps = record.publishSummary;
      console.log(`   发布: 成功${ps.succeeded.length}个 / 失败${ps.failed.length}个 / 需认证${ps.authMissing.length}个`);
    }

    if (record.status === 'manual_review') {
      console.log(`\n⚠️  人工审核阻塞，请运行以下命令审核:`);
      console.log(`   npx ts-node scripts/marketing/pipeline-cli.ts --approve ${job.job_id} ${record.runId}`);
      process.exit(2);
    }

    process.exit(record.status === 'failed' ? 1 : 0);
  } catch (err) {
    console.error(`\n❌ Pipeline 执行异常: ${err}`);
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
AI 营销流水线 CLI v1

用法:
  运营命令:
    pipeline-cli.ts --list-pending              查看待审核队列
    pipeline-cli.ts --approve <jobId> <runId>   审核通过一个 Job
    pipeline-cli.ts --reject <jobId> <runId>    驳回一个 Job

  执行命令:
    pipeline-cli.ts --job ./jobs/xxx.json       从文件加载并执行 Job
    pipeline-cli.ts --job-id mj_health_001      用 job-id 执行默认 Job
    pipeline-cli.ts --dry                        Dry run 模式
    pipeline-cli.ts --verbose                   详细输出

选项:
  -j, --job <file>       Job 定义文件路径
  -i, --job-id <id>      Job ID (自动构建默认 Job)
  -t, --trigger         触发方式: cron|manual|api (默认: manual)
  -r, --reviewer <name>  审核人名称
  -R, --reason <text>   驳回原因
  -l, --list            列出待审核任务
  --list-pending        同 --list
  --dry                 Dry run，不执行
  -v, --verbose         详细日志
  -h, --help            显示帮助
`);
}

function extractJobId(filePath: string): string {
  const base = filePath.split('/').pop() ?? filePath;
  return base.replace(/\.json$/, '');
}

function buildDefaultJob(jobId: string, trigger: 'cron' | 'manual' | 'api'): MarketingJob {
  // Parse jobId for metadata (e.g., mj_health_education_001)
  const parts = jobId.split('_');
  const keyword = parts.slice(1).join(' ') || '健康教育';

  return {
    job_id: jobId,
    trigger,
    source: {
      type: 'topic',
      topic: keyword,
      brief_markdown: `关于${keyword}的健康教育内容，面向需要健康指导的用户群体。`,
    },
    content: {
      template_key: 'seo_article',
      max_words: 1500,
      human_review_required: true,
      reviewer_role: 'medical_editor',
      min_source_count: 2,
    },
    seo: {
      primary_keyword: keyword,
      secondary_keywords: [],
      schema_types: ['Article'],
      min_ready_score: 70,
    },
    distribution: {
      publish_mode: 'draft',
      channels: [{ platform: 'wechat', required: true }],
    },
    tracking: {
      utm_campaign: jobId,
      utm_medium: trigger,
    },
    runtime: {
      timeout_seconds: 600,
      max_retries: 2,
      shadow_mode: true,
    },
  };
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});