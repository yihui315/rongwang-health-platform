/**
 * 荣旺营销 Pipeline v1 — Error Handler
 * 错误分类 + 策略映射
 *
 * 原则：
 * - evidence_write_failed = 整个job标记failed（critical）
 * - content_generation_failed = 最多重试2次，失败后block
 * - rankparser相关 = 永远不block pipeline
 * - wechatsync/cookie = 单平台failed，生成manual pack，不影响其他平台
 */

import type { PipelineStepResult } from './job-types';

// ─────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────

export type ErrorType =
  | 'schema_invalid'
  | 'content_generation_failed'
  | 'rankparser_timeout'
  | 'rankparser_empty'
  | 'wechatsync_unavailable'
  | 'cookie_expired'
  | 'platform_rate_limited'
  | 'evidence_write_failed'
  | 'unknown';

// ─────────────────────────────────────────────
// Error Strategy
// ─────────────────────────────────────────────

export interface ErrorStrategy {
  type: ErrorType;
  action: 'fail' | 'retry' | 'warning' | 'skipped';
  retryable: boolean;
  manualPack: boolean;
  blockPipeline: boolean;
  message: string;
  httpStatus?: number; // For API responses
}

// ─────────────────────────────────────────────
// Strategy Table
// ─────────────────────────────────────────────

export const ERROR_STRATEGIES: Record<ErrorType, ErrorStrategy> = {
  schema_invalid: {
    type: 'schema_invalid',
    action: 'fail',
    retryable: false,
    manualPack: false,
    blockPipeline: true,
    message: 'Job Schema 验证失败，输入数据不符合要求',
  },
  content_generation_failed: {
    type: 'content_generation_failed',
    action: 'fail',
    retryable: true,
    manualPack: false,
    blockPipeline: true,
    message: 'AI内容生成失败',
  },
  rankparser_timeout: {
    type: 'rankparser_timeout',
    action: 'warning',
    retryable: false,
    manualPack: false,
    blockPipeline: false,
    message: 'RankParser 请求超时，已降级到本地SEO检查',
  },
  rankparser_empty: {
    type: 'rankparser_empty',
    action: 'warning',
    retryable: false,
    manualPack: false,
    blockPipeline: false,
    message: 'RankParser 返回空结果，已降级到本地SEO检查',
  },
  wechatsync_unavailable: {
    type: 'wechatsync_unavailable',
    action: 'skipped',
    retryable: false,
    manualPack: true,
    blockPipeline: false,
    message: 'Wechatsync 服务不可用，已生成手动发布包',
  },
  cookie_expired: {
    type: 'cookie_expired',
    action: 'fail',
    retryable: false,
    manualPack: true,
    blockPipeline: false,
    message: '微信公众号 Cookie 已过期，请更新登录态',
  },
  platform_rate_limited: {
    type: 'platform_rate_limited',
    action: 'fail',
    retryable: false,
    manualPack: true,
    blockPipeline: false,
    message: '平台请求频率超限，已生成手动发布包',
  },
  evidence_write_failed: {
    type: 'evidence_write_failed',
    action: 'fail',
    retryable: false,
    manualPack: false,
    blockPipeline: true,
    message: 'Evidence日志写入失败（critical: 无evidence不允许标记成功）',
  },
  unknown: {
    type: 'unknown',
    action: 'fail',
    retryable: false,
    manualPack: true,
    blockPipeline: true,
    message: '未知错误',
  },
};

// ─────────────────────────────────────────────
// Error Type Detection
// ─────────────────────────────────────────────

const ERROR_TYPE_PATTERNS: Array<{ pattern: RegExp; type: ErrorType }> = [
  { pattern: /schema|validation|parse/i, type: 'schema_invalid' },
  { pattern: /content.*generat|AI.*fail|provider.*error|429|rate.*limit/i, type: 'content_generation_failed' },
  { pattern: /rankparser.*timeout|timeout.*rank/i, type: 'rankparser_timeout' },
  { pattern: /rankparser.*empty|no.*result/i, type: 'rankparser_empty' },
  { pattern: /wechatsync.*unavailable|docker.*not.*running|container.*not.*found/i, type: 'wechatsync_unavailable' },
  { pattern: /cookie.*expir|auth.*fail|login.*required|token.*invalid/i, type: 'cookie_expired' },
  { pattern: /rate.*limit|429|too.*many.*request/i, type: 'platform_rate_limited' },
  { pattern: /evidence.*write|write.*evidence|cannot.*write.*file/i, type: 'evidence_write_failed' },
];

/**
 * 从错误对象推断 ErrorType
 */
export function determineErrorType(error: unknown): ErrorType {
  if (!error) return 'unknown';

  const message = error instanceof Error ? error.message : String(error);

  for (const { pattern, type } of ERROR_TYPE_PATTERNS) {
    if (pattern.test(message)) {
      return type;
    }
  }

  // Check error code
  if (error instanceof Error) {
    const code = error.message;
    if (code.includes('E_JOB_SCHEMA_INVALID')) return 'schema_invalid';
    if (code.includes('E_CONTENT_EMPTY') || code.includes('E_CONTENT_PLACEHOLDER')) return 'content_generation_failed';
    if (code.includes('E_RANK_SOURCE_TIMEOUT')) return 'rankparser_timeout';
    if (code.includes('E_WECHATSYNC_AUTH')) return 'cookie_expired';
    if (code.includes('E_PLATFORM_RATE_LIMIT')) return 'platform_rate_limited';
    if (code.includes('E_EVIDENCE_WRITE_FAILED')) return 'evidence_write_failed';
  }

  return 'unknown';
}

/**
 * 获取错误策略
 */
export function getErrorStrategy(error: unknown): ErrorStrategy {
  const type = determineErrorType(error);
  return ERROR_STRATEGIES[type] ?? ERROR_STRATEGIES['unknown'];
}

/**
 * 从 PipelineStepResult 推断 ErrorType
 */
export function stepResultToErrorType(result: PipelineStepResult): ErrorType {
  if (!result.errorCode) return 'unknown';

  const code = result.errorCode;
  if (code.includes('INVALID') || code.includes('SCHEMA')) return 'schema_invalid';
  if (code.includes('CONTENT_EMPTY') || code.includes('CONTENT_PROVIDER')) return 'content_generation_failed';
  if (code.includes('RANK') && code.includes('TIMEOUT')) return 'rankparser_timeout';
  if (code.includes('WECHATSYNC_AUTH')) return 'cookie_expired';
  if (code.includes('RATE_LIMIT')) return 'platform_rate_limited';
  if (code.includes('EVIDENCE')) return 'evidence_write_failed';

  return 'unknown';
}

// ─────────────────────────────────────────────
// Retry Helper
// ─────────────────────────────────────────────

export interface RetryState {
  attempts: number;
  maxAttempts: number;
  lastError: unknown;
}

export function shouldRetry(state: RetryState, strategy: ErrorStrategy): boolean {
  if (!strategy.retryable) return false;
  return state.attempts < state.maxAttempts;
}

export function incRetry(state: RetryState): RetryState {
  return { ...state, attempts: state.attempts + 1 };
}

// ─────────────────────────────────────────────
// Error Formatting (for display)
// ─────────────────────────────────────────────

export function formatErrorForDisplay(error: unknown): string {
  if (!error) return 'Unknown error';

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}
