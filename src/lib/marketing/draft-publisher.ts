/**
 * 荣旺营销 Pipeline v1 — Draft Publisher
 *
 * 核心原则：
 * - 永远不自动正式发布
 * - 默认 = dry-run（不实际操作）
 * - xiaohongshu / zhihu → 只生成手动发布包，不实际操作
 * - Wechatsync → 使用已有 adapters/wechatsync.ts
 * - website → 生成 CMS 草稿（不直接操作CMS）
 */

import { isWechatsyncRunning, publishWechatDraft, isChromeProfileAvailable } from './adapters/wechatsync';
import { generateManualPack } from './manual-pack-generator';
import { getMarketingFlags } from './marketing-flags';
import type { ManualPack } from './manual-pack-generator';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type PublishPlatform = 'wechat' | 'xiaohongshu' | 'zhihu' | 'website';

export type PublishStatus =
  | 'success'
  | 'draft_created'
  | 'auth_missing'
  | 'rate_limited'
  | 'failed'
  | 'skipped'
  | 'manual_pack_generated';

export interface DraftPublishResult {
  platform: PublishPlatform;
  status: PublishStatus;
  draftUrl?: string;
  errorMessage?: string;
  skippedReason?: string;
  manualPackPath?: string;
}

export interface DraftPublishInput {
  platform: PublishPlatform;
  title: string;
  content: string; // Markdown body
  cta?: string;
  tags?: string[];
  metaDescription?: string;
  landingPageUrl?: string;
  jobId: string;
}

// ─────────────────────────────────────────────
// WeChat Publisher (uses existing wechatsync.ts)
// ─────────────────────────────────────────────

async function publishToWechat(input: DraftPublishInput): Promise<DraftPublishResult> {
  const flags = getMarketingFlags();

  // 1. Check feature flags
  if (flags.publishMode === 'dry-run') {
    return {
      platform: 'wechat',
      status: 'skipped',
      skippedReason: 'publishMode=dry-run (no actual publish)',
    };
  }

  // 2. Check if Wechatsync is enabled
  if (process.env.FEATURE_WECHATSYNC_ENABLED !== 'true') {
    console.log(`[DraftPublisher] Wechatsync not enabled, generating manual pack`);
    const pack = generateManualPack({
      jobId: input.jobId,
      platform: 'wechat',
      title: input.title,
      body: input.content,
      cta: input.cta,
      tags: input.tags,
      failureReason: 'Wechatsync not enabled (FEATURE_WECHATSYNC_ENABLED=false)',
      metaDescription: input.metaDescription,
      landingPageUrl: input.landingPageUrl,
    });
    return {
      platform: 'wechat',
      status: 'manual_pack_generated',
      manualPackPath: pack.outputPath,
    };
  }

  // 3. Check if Chrome profile (cookie) is available
  if (!isChromeProfileAvailable()) {
    console.warn(`[DraftPublisher] Chrome profile not found, generating manual pack`);
    const pack = generateManualPack({
      jobId: input.jobId,
      platform: 'wechat',
      title: input.title,
      body: input.content,
      cta: input.cta,
      tags: input.tags,
      failureReason: 'Chrome profile not found — Cookie不可用，需要手动更新登录态',
      metaDescription: input.metaDescription,
      landingPageUrl: input.landingPageUrl,
    });
    return {
      platform: 'wechat',
      status: 'auth_missing',
      manualPackPath: pack.outputPath,
      errorMessage: 'Chrome profile not found at /root/.config/google-chrome',
    };
  }

  // 4. Check if Wechatsync is running
  const running = await isWechatsyncRunning();
  if (!running) {
    console.warn(`[DraftPublisher] Wechatsync not running, generating manual pack`);
    const pack = generateManualPack({
      jobId: input.jobId,
      platform: 'wechat',
      title: input.title,
      body: input.content,
      cta: input.cta,
      tags: input.tags,
      failureReason: 'Wechatsync Docker container not running',
      metaDescription: input.metaDescription,
      landingPageUrl: input.landingPageUrl,
    });
    return {
      platform: 'wechat',
      status: 'skipped',
      manualPackPath: pack.outputPath,
      skippedReason: 'Wechatsync not running',
    };
  }

  // 5. Attempt to publish draft
  try {
    const result = await publishWechatDraft({
      content: { title: input.title, content: input.content },
      context: {
        runId: `draft_${input.jobId}`,
        channels: ['wechat'],
        utmCampaign: input.jobId,
      },
      runId: `draft_${input.jobId}`,
    });

    return {
      platform: 'wechat',
      status: result.status === 'draft_created' ? 'draft_created' : result.status === 'success' ? 'success' : 'failed',
      draftUrl: result.draftUrl,
      errorMessage: result.errorMessage,
    };
  } catch (err) {
    console.error(`[DraftPublisher] Wechatsync error: ${err}`);
    const pack = generateManualPack({
      jobId: input.jobId,
      platform: 'wechat',
      title: input.title,
      body: input.content,
      cta: input.cta,
      tags: input.tags,
      failureReason: `Wechatsync error: ${err}`,
      metaDescription: input.metaDescription,
      landingPageUrl: input.landingPageUrl,
    });
    return {
      platform: 'wechat',
      status: 'failed',
      manualPackPath: pack.outputPath,
      errorMessage: String(err),
    };
  }
}

// ─────────────────────────────────────────────
// Platform-specific publishers
// ─────────────────────────────────────────────

async function publishToXiaohongshu(input: DraftPublishInput): Promise<DraftPublishResult> {
  // 本轮不做无人值守发布，强制生成手动包
  console.log(`[DraftPublisher] Xiaohongshu: 本轮不做自动发布，生成手动包`);

  const pack = generateManualPack({
    jobId: input.jobId,
    platform: 'xiaohongshu',
    title: input.title,
    body: input.content,
    cta: input.cta,
    tags: input.tags,
    failureReason: '本轮Pipeline v1不做小红书无人值守发布，仅生成手动发布包',
    metaDescription: input.metaDescription,
    landingPageUrl: input.landingPageUrl,
  });

  return {
    platform: 'xiaohongshu',
    status: 'manual_pack_generated',
    manualPackPath: pack.outputPath,
    skippedReason: 'Xiaohongshu automation disabled in Pipeline v1',
  };
}

async function publishToZhihu(input: DraftPublishInput): Promise<DraftPublishResult> {
  // 本轮不做无人值守发布，强制生成手动包
  console.log(`[DraftPublisher] Zhihu: 本轮不做自动发布，生成手动包`);

  const pack = generateManualPack({
    jobId: input.jobId,
    platform: 'zhihu',
    title: input.title,
    body: input.content,
    cta: input.cta,
    tags: input.tags,
    failureReason: '本轮Pipeline v1不做知乎无人值守发布，仅生成手动发布包',
    metaDescription: input.metaDescription,
    landingPageUrl: input.landingPageUrl,
  });

  return {
    platform: 'zhihu',
    status: 'manual_pack_generated',
    manualPackPath: pack.outputPath,
    skippedReason: 'Zhihu automation disabled in Pipeline v1',
  };
}

async function publishToWebsite(input: DraftPublishInput): Promise<DraftPublishResult> {
  // website: 生成 CMS 草稿（未来可接入CMS API）
  console.log(`[DraftPublisher] Website: CMS draft generation (not implemented — generating manual pack)`);

  const pack = generateManualPack({
    jobId: input.jobId,
    platform: 'website',
    title: input.title,
    body: input.content,
    cta: input.cta,
    tags: input.tags,
    failureReason: 'CMS API integration not yet implemented',
    metaDescription: input.metaDescription,
    landingPageUrl: input.landingPageUrl,
  });

  return {
    platform: 'website',
    status: 'manual_pack_generated',
    manualPackPath: pack.outputPath,
    skippedReason: 'CMS API integration pending (Phase 2)',
  };
}

// ─────────────────────────────────────────────
// Main dispatcher
// ─────────────────────────────────────────────

const PUBLISHERS: Record<PublishPlatform, (input: DraftPublishInput) => Promise<DraftPublishResult>> = {
  wechat: publishToWechat,
  xiaohongshu: publishToXiaohongshu,
  zhihu: publishToZhihu,
  website: publishToWebsite,
};

export async function publishDraft(input: DraftPublishInput): Promise<DraftPublishResult> {
  const publisher = PUBLISHERS[input.platform];
  if (!publisher) {
    return {
      platform: input.platform,
      status: 'failed',
      errorMessage: `Unknown platform: ${input.platform}`,
    };
  }

  return publisher(input);
}

export async function publishAllDrafts(
  inputs: DraftPublishInput[]
): Promise<DraftPublishResult[]> {
  const results: DraftPublishResult[] = [];

  for (const input of inputs) {
    const result = await publishDraft(input);
    results.push(result);

    // Single platform failure does NOT stop other platforms
    if (result.status === 'failed' || result.status === 'manual_pack_generated') {
      console.log(`[DraftPublisher] ${input.platform}: ${result.status}${result.manualPackPath ? ` (pack: ${result.manualPackPath})` : ''}`);
    }
  }

  return results;
}
