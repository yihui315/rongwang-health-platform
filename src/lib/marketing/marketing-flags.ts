/**
 * 荣旺营销 Pipeline v1 — Feature Flags
 * 营销系统功能开关（从环境变量读取，默认值安全）
 *
 * 核心原则：
 * - pipelineEnabled 默认为 false（关闭）
 * - publishMode 默认为 'dry-run'（不自动发布）
 * - 所有开关都是防御性默认值
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface MarketingFlags {
  pipelineEnabled: boolean;       // Master switch: 是否启用营销Pipeline
  publishMode: 'dry-run' | 'draft' | 'manual';  // 发布模式
  rankParserRequired: boolean;   // RankParser是否为阻塞项
  agentReachEnabled: boolean;    // 是否启用Agent-Reach研究层
  xhsAutomationEnabled: boolean;  // 是否启用小红书自动化（本轮永远false）
  auditStrictMode: boolean;      // 严格模式：低于阈值是否阻止发布
  /** 允许自动发布到公众号（需要Cookie有效） */
  wechatAutoPublish: boolean;
  /** SEO分数阈值：低于此值阻止发布 */
  seoScoreThreshold: number;
}

// ─────────────────────────────────────────────
// Env reading helpers
// ─────────────────────────────────────────────

function readBool(key: string, defaultVal: boolean): boolean {
  const val = process.env[key];
  if (val === undefined) return defaultVal;
  return val === 'true' || val === '1' || val === 'yes';
}

function readString<Key extends keyof MarketingFlags>(
  key: string,
  defaultVal: MarketingFlags[Key]
): MarketingFlags[Key] {
  const val = process.env[key];
  if (val === undefined) return defaultVal;
  return val as MarketingFlags[Key];
}

function readNumber(key: string, defaultVal: number): number {
  const val = process.env[key];
  if (val === undefined) return defaultVal;
  const parsed = Number.parseFloat(val);
  return Number.isFinite(parsed) ? parsed : defaultVal;
}

// ─────────────────────────────────────────────
// Cache (avoid repeated env reads)
// ─────────────────────────────────────────────

let _cachedFlags: MarketingFlags | null = null;

export function getMarketingFlags(): MarketingFlags {
  if (_cachedFlags) return _cachedFlags;

  _cachedFlags = {
    pipelineEnabled: readBool('FEATURE_MARKETING_PIPELINE', false),
    publishMode: readString('FEATURE_MARKETING_PUBLISH_MODE', 'dry-run') as 'dry-run' | 'draft' | 'manual',
    rankParserRequired: readBool('FEATURE_RANKPARSER_REQUIRED', false),
    agentReachEnabled: readBool('FEATURE_AGENT_REACH_ENABLED', false),
    xhsAutomationEnabled: readBool('FEATURE_XHS_AUTOMATION_ENABLED', false),
    auditStrictMode: readBool('FEATURE_AUDIT_STRICT_MODE', true),
    wechatAutoPublish: readBool('FEATURE_WECHAT_AUTO_PUBLISH', false),
    seoScoreThreshold: readNumber('FEATURE_SEO_SCORE_THRESHOLD', 60),
  };

  return _cachedFlags;
}

/**
 * 检查 Pipeline 总开关是否启用
 */
export function isMarketingPipelineEnabled(): boolean {
  return getMarketingFlags().pipelineEnabled;
}

/**
 * 检查是否允许自动发布
 * 规则：publishMode 必须为 'draft' 或 'manual'，且对应平台开关打开
 */
export function isAutoPublishAllowed(platform?: 'wechat' | 'website'): boolean {
  const flags = getMarketingFlags();
  if (flags.publishMode === 'dry-run') return false;
  if (flags.publishMode === 'manual') return true; // manual = generate pack only
  if (platform === 'wechat') return flags.wechatAutoPublish;
  if (platform === 'website') return true; // website is always draft-safe
  return false;
}

/**
 * 检查是否应该跳过 SEO score 门控
 */
export function shouldBlockOnSeoScore(score: number): boolean {
  const flags = getMarketingFlags();
  if (!flags.auditStrictMode) return false;
  return score < flags.seoScoreThreshold;
}

/**
 * 清除缓存（用于测试或运行时刷新）
 */
export function clearMarketingFlagsCache(): void {
  _cachedFlags = null;
}
