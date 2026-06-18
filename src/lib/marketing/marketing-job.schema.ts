/**
 * 荣旺健康平台 — Marketing Job Schema v2
 * 简化版输入Schema，用于Pipeline v1外部触发（CLI / API / Cron）
 *
 * 设计原则：
 * - 与现有 job-types.ts 完全解耦（不修改原文件）
 * - Pipeline内部使用 job-types.ts，外部触发使用本文件
 * - Zod 验证 + 运行时类型检查
 * - 默认值优先，减少必填字段
 */

import { z } from 'zod';

// ─────────────────────────────────────────────
// Platform & PublishMode（兼容原 job-types.ts）
// ─────────────────────────────────────────────

export const PlatformV2 = z.enum(['website', 'wechat', 'xiaohongshu', 'zhihu']);
export type PlatformV2 = z.infer<typeof PlatformV2>;

export const PublishModeV2 = z.enum(['dry-run', 'draft', 'manual']);
export type PublishModeV2 = z.infer<typeof PublishModeV2>;

export const JobSourceV2 = z.enum(['manual', 'cron', 'api']);
export type JobSourceV2 = z.infer<typeof JobSourceV2>;

// ─────────────────────────────────────────────
// MarketingJobV2 — Pipeline v1 外部输入Schema
// ─────────────────────────────────────────────

export const MarketingJobV2Schema = z.object({
  jobId: z
    .string()
    .min(3, 'jobId must be at least 3 characters')
    .max(64, 'jobId must be at most 64 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'jobId must be alphanumeric with - or _'),

  /** 触发来源 */
  source: JobSourceV2.default('manual'),

  /** 产品/方案名称 */
  productName: z.string().min(2).max(100),

  /** 落地页URL（用于CTA和追踪） */
  landingPage: z.string().url().optional(),

  /** SEO目标关键词 */
  targetKeyword: z.string().min(2).max(200),

  /** 目标人群描述 */
  audience: z.string().min(2).max(200).optional(),

  /** 发布平台列表 */
  platforms: z.array(PlatformV2).min(1).default(['website']),

  /** CTA文字（引导用户行动） */
  cta: z.string().min(2).max(50).default('开始AI健康自测'),

  /** 发布模式：dry-run=只分析/draft=草稿/manual=完整手动包 */
  publishMode: PublishModeV2.default('dry-run'),

  /** 内容语言 */
  locale: z.enum(['zh-CN', 'en']).default('zh-CN'),

  /** 可选元数据 */
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type MarketingJobV2 = z.infer<typeof MarketingJobV2Schema>;

// ─────────────────────────────────────────────
// Validation utilities
// ─────────────────────────────────────────────

/**
 * 验证并规范化 Job 输入
 * @returns 规范化后的Job（带默认值）
 */
export function validateMarketingJob(input: unknown): MarketingJobV2 {
  return MarketingJobV2Schema.parse(input);
}

/**
 * 快速检查Job是否有效（返回布尔值，不抛错）
 */
export function isValidMarketingJob(input: unknown): input is MarketingJobV2 {
  try {
    MarketingJobV2Schema.parse(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * 将 MarketingJobV2 转换为 Pipeline 内部 NormalizedContext 兼容格式
 * （为 Phase 3 Pipeline Runner 适配做准备）
 */
export function jobV2ToPipelineContext(job: MarketingJobV2): {
  jobId: string;
  primaryKeyword: string;
  briefMarkdown: string;
  titleHint: string;
  publishMode: 'dry-run' | 'draft' | 'manual';
  channels: PlatformV2[];
  locale: string;
  humanReviewRequired: boolean;
  maxWords: number;
  runtime: {
    shadow_mode: boolean;
    timeout_seconds: number;
    max_retries: number;
  };
} {
  return {
    jobId: job.jobId,
    primaryKeyword: job.targetKeyword,
    briefMarkdown: job.audience
      ? `面向人群：${job.audience}，产品：${job.productName}`
      : `产品：${job.productName}`,
    titleHint: job.productName,
    publishMode: job.publishMode,
    channels: job.platforms,
    locale: job.locale,
    humanReviewRequired: job.publishMode === 'manual',
    maxWords: 1500,
    runtime: {
      shadow_mode: job.publishMode === 'dry-run',
      timeout_seconds: 600,
      max_retries: 2,
    },
  };
}