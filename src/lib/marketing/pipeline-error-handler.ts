/**
 * Pipeline Error Handler — Phase 10
 *
 * Centralised error classification, recovery recommendations, and observability
 * for the marketing pipeline.
 *
 * Design:
 * - Classify: maps thrown errors → canonical ErrorCode + retryable flag
 * - Recover:  returns NextAction + recoveryHint for each error type
 * - Observe: emits structured error events to the pipeline event log
 *
 * Used by: pipeline-runner.ts (on every step error + crash handler)
 */

import type { ErrorCode, PipelinePhase } from './job-types';
import { ERROR_CODE_RETRYABLE } from './job-types';

// ── Error classification ────────────────────────────────────────────────────

export interface ClassifiedError {
  code: ErrorCode;
  message: string;
  retryable: boolean;
  /** Suggested recovery hint for operators / cron jobs */
  recoveryHint: string;
  /** Whether this error should page someone immediately */
  escalate: boolean;
  /** Human-readable summary */
  summary: string;
}

/**
 * Classify a raw thrown error into a canonical ClassifiedError.
 * Called in every pipeline-runner catch block and the top-level crash handler.
 */
export function classifyPipelineError(
  err: unknown,
  context?: { phase?: PipelinePhase; jobId?: string }
): ClassifiedError {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const rawCode = err instanceof Error ? err.name : 'Error';

  // ── Network / timeout errors ──────────────────────────────────────────
  if (/fetch|network|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|SocketTimeout/i.test(rawMessage)) {
    return {
      code: 'E_UNEXPECTED',
      message: rawMessage,
      retryable: true,
      recoveryHint: 'Network error — retry after 60s. Check API endpoint availability.',
      escalate: false,
      summary: `Network error in phase ${context?.phase ?? 'unknown'}: ${rawMessage.slice(0, 80)}`,
    };
  }

  // ── 429 Rate limit ─────────────────────────────────────────────────────
  if (/429|rate.?limit|too.?many/i.test(rawMessage)) {
    return {
      code: 'E_CONTENT_PROVIDER_429',
      message: rawMessage,
      retryable: true,
      recoveryHint: 'Rate limited — retry after 5 minutes. Consider adding provider back-off.',
      escalate: false,
      summary: `Rate limit hit (429) in phase ${context?.phase ?? 'unknown'}`,
    };
  }

  // ── 5XX provider errors ───────────────────────────────────────────────
  if (/5\d{2}|internal.?server|bad.?gateway|service.?unavailable|gateway.?timeout/i.test(rawMessage)) {
    return {
      code: 'E_CONTENT_PROVIDER_5XX',
      message: rawMessage,
      retryable: true,
      recoveryHint: 'Provider side error (5xx) — retry after 2 minutes.',
      escalate: false,
      summary: `Provider 5xx error in phase ${context?.phase ?? 'unknown'}: ${rawMessage.slice(0, 80)}`,
    };
  }

  // ── Auth errors ────────────────────────────────────────────────────────
  if (/auth|credential|unauthorized|401|403|cookie|login/i.test(rawMessage)) {
    // Distinguish WeChat-specific auth
    if (/wechat|wechatsync/i.test(rawMessage)) {
      return {
        code: 'E_WECHATSYNC_AUTH_FAILED',
        message: rawMessage,
        retryable: false,
        recoveryHint: 'WeChat auth failed — re-login at https://mp.weixin.qq.com and update Chrome profile cookie.',
        escalate: true,
        summary: `WeChat auth failure for job ${context?.jobId ?? 'unknown'}`,
      };
    }
    return {
      code: 'E_WECHATSYNC_AUTH_MISSING',
      message: rawMessage,
      retryable: false,
      recoveryHint: 'Auth credentials missing or expired — check environment variables and re-configure.',
      escalate: true,
      summary: `Auth error in phase ${context?.phase ?? 'unknown'}: ${rawMessage.slice(0, 80)}`,
    };
  }

  // ── Schema validation errors ───────────────────────────────────────────
  if (/schema|ajv|validate|validation/i.test(rawMessage)) {
    return {
      code: 'E_JOB_SCHEMA_INVALID',
      message: rawMessage,
      retryable: false,
      recoveryHint: 'Job schema validation failed — fix the marketing job JSON and resubmit.',
      escalate: false,
      summary: `Schema validation failed for job ${context?.jobId ?? 'unknown'}: ${rawMessage.slice(0, 80)}`,
    };
  }

  // ── Timeout errors ─────────────────────────────────────────────────────
  if (/timeout|timed?out/i.test(rawMessage)) {
    // Distinguish source fetch vs rank source
    if (/product|metadata|source.*fetch/i.test(rawMessage)) {
      return {
        code: 'E_SOURCE_FETCH_TIMEOUT',
        message: rawMessage,
        retryable: true,
        recoveryHint: 'Source URL fetch timed out — retry with a longer timeout_seconds value.',
        escalate: false,
        summary: `Source fetch timeout for job ${context?.jobId ?? 'unknown'}`,
      };
    }
    if (/rank|seo.*snapshot/i.test(rawMessage)) {
      return {
        code: 'E_RANK_SOURCE_TIMEOUT',
        message: rawMessage,
        retryable: true,
        recoveryHint: 'Rank snapshot API timed out — retry with longer timeout or check API key.',
        escalate: false,
        summary: `Rank snapshot timeout for job ${context?.jobId ?? 'unknown'}`,
      };
    }
    return {
      code: 'E_CONTENT_PROVIDER_5XX',
      message: rawMessage,
      retryable: true,
      recoveryHint: 'Operation timed out — retry after 60 seconds.',
      escalate: false,
      summary: `Timeout in phase ${context?.phase ?? 'unknown'}: ${rawMessage.slice(0, 80)}`,
    };
  }

  // ── Content quality errors ─────────────────────────────────────────────
  if (/empty|placeholder|\[.*\]|todo|fixme/i.test(rawMessage)) {
    if (/empty|null.*content|content.*empty/i.test(rawMessage)) {
      return {
        code: 'E_CONTENT_EMPTY',
        message: rawMessage,
        retryable: false,
        recoveryHint: 'Content generation returned empty — check prompt and re-run with shadow_mode=false.',
        escalate: false,
        summary: `Empty content generated for job ${context?.jobId ?? 'unknown'}`,
      };
    }
    return {
      code: 'E_CONTENT_PLACEHOLDER_REMAINING',
      message: rawMessage,
      retryable: false,
      recoveryHint: 'Generated content contains placeholders — fix prompt and regenerate.',
      escalate: false,
      summary: `Placeholder text in generated content for job ${context?.jobId ?? 'unknown'}`,
    };
  }

  // ── SEO score errors ───────────────────────────────────────────────────
  if (/seo.*score|ready.*score|below.*threshold|blocker/i.test(rawMessage)) {
    return {
      code: 'E_SEO_SCORE_BELOW_THRESHOLD',
      message: rawMessage,
      retryable: false,
      recoveryHint: 'SEO score below threshold — edit article content and re-run seo_geo_gate step, or approve manually.',
      escalate: false,
      summary: `SEO score below threshold for job ${context?.jobId ?? 'unknown'}`,
    };
  }

  // ── Idempotency collision ──────────────────────────────────────────────
  if (/idempoten|duplicate.*job|same.*job/i.test(rawMessage)) {
    return {
      code: 'E_IDEMPOTENCY_KEY_COLLISION',
      message: rawMessage,
      retryable: false,
      recoveryHint: 'Duplicate job detected by idempotency key — this job was already submitted. Check the job queue.',
      escalate: false,
      summary: `Idempotency key collision for job ${context?.jobId ?? 'unknown'}`,
    };
  }

  // ── Evidence write errors ───────────────────────────────────────────────
  if (/evidence|write.*file|permission|EACCES|ENOENT.*evidence/i.test(rawMessage)) {
    return {
      code: 'E_EVIDENCE_WRITE_FAILED',
      message: rawMessage,
      retryable: true,
      recoveryHint: 'Evidence write failed — check disk space and /tmp permissions, then retry.',
      escalate: true,
      summary: `Evidence write failed for job ${context?.jobId ?? 'unknown'}: ${rawMessage.slice(0, 80)}`,
    };
  }

  // ── Default: unexpected ────────────────────────────────────────────────
  return {
    code: 'E_UNEXPECTED',
    message: rawMessage,
    retryable: ERROR_CODE_RETRYABLE['E_UNEXPECTED'],
    recoveryHint: 'Unexpected error — check pipeline logs. If recurring, escalate to engineering.',
    escalate: true,
    summary: `Unexpected error in phase ${context?.phase ?? 'unknown'} for job ${context?.jobId ?? 'unknown'}: ${rawMessage.slice(0, 100)}`,
  };
}

// ── Recovery action map ──────────────────────────────────────────────────────

export type RecoveryAction =
  | 'retry_immediately'
  | 'retry_after_60s'
  | 'retry_after_5min'
  | 'manual_review'
  | 'abort'
  | 'escalate';

/**
 * Given a classified error, return the recommended NextAction for the pipeline.
 */
export function getRecoveryAction(code: ErrorCode): RecoveryAction {
  switch (code) {
    case 'E_SOURCE_FETCH_TIMEOUT':
    case 'E_RANK_SOURCE_TIMEOUT':
    case 'E_EVIDENCE_WRITE_FAILED':
      return 'retry_after_60s';

    case 'E_CONTENT_PROVIDER_429':
      return 'retry_after_5min';

    case 'E_CONTENT_PROVIDER_5XX':
      return 'retry_after_60s';

    case 'E_JOB_SCHEMA_INVALID':
    case 'E_CONTENT_EMPTY':
    case 'E_CONTENT_PLACEHOLDER_REMAINING':
    case 'E_SEO_SCORE_BELOW_THRESHOLD':
    case 'E_SCHEMA_VISIBLE_CONTENT_MISMATCH':
    case 'E_WECHATSYNC_AUTH_MISSING':
    case 'E_WECHATSYNC_AUTH_FAILED':
    case 'E_IDEMPOTENCY_KEY_COLLISION':
    case 'E_PUBLISH_PARTIAL_SUCCESS':
    case 'E_PUBLISH_ALL_FAILED':
      return 'manual_review';

    case 'E_PLATFORM_RATE_LIMIT':
      return 'retry_after_5min';

    default:
      return 'abort';
  }
}

/**
 * Convert RecoveryAction to the pipeline's NextAction type.
 */
export function toPipelineNextAction(recovery: RecoveryAction): 'retry_later' | 'manual_review' | 'abort' {
  switch (recovery) {
    case 'retry_immediately':
    case 'retry_after_60s':
    case 'retry_after_5min':
      return 'retry_later';
    case 'manual_review':
      return 'manual_review';
    default:
      return 'abort';
  }
}

// ── Error event emitter ──────────────────────────────────────────────────────

export interface PipelineErrorEvent {
  jobId: string;
  runId: string;
  phase: PipelinePhase;
  code: ErrorCode;
  message: string;
  retryable: boolean;
  recoveryHint: string;
  escalate: boolean;
  timestamp: string;
}

/**
 * Emit a structured error event.
 * Integrates with pipeline-runner's event log (events.jsonl).
 */
export function emitPipelineErrorEvent(
  classified: ClassifiedError,
  context: { jobId: string; runId: string; phase: PipelinePhase }
): PipelineErrorEvent {
  const event: PipelineErrorEvent = {
    jobId: context.jobId,
    runId: context.runId,
    phase: context.phase,
    code: classified.code,
    message: classified.message,
    retryable: classified.retryable,
    recoveryHint: classified.recoveryHint,
    escalate: classified.escalate,
    timestamp: new Date().toISOString(),
  };

  // Always log to console
  const level = classified.escalate ? 'error' : 'warn';
  console[level](
    `[PIPELINE-ERROR] [${context.phase}] [${classified.code}] ${classified.summary}`,
    classified.recoveryHint
  );

  return event;
}

// ── Panic mode: max retries exceeded ─────────────────────────────────────────

/**
 * Determines whether to abort the pipeline after exhausting retries.
 * Called by the cron job or API wrapper after max_retries have been attempted.
 */
export interface RetryBudget {
  remaining: number;
  maxRetries: number;
  backoffMs: number;
  totalAttempts: number;
}

export function shouldAbortAfterRetry(
  classified: ClassifiedError,
  budget: RetryBudget
): boolean {
  if (!classified.retryable) return true;
  if (budget.remaining <= 0) return true;
  return false;
}

export function computeBackoffMs(budget: RetryBudget, code: ErrorCode): number {
  switch (code) {
    case 'E_CONTENT_PROVIDER_429':
    case 'E_PLATFORM_RATE_LIMIT':
      return Math.min(budget.backoffMs * 3, 300_000); // max 5 min
    case 'E_CONTENT_PROVIDER_5XX':
      return Math.min(budget.backoffMs * 2, 120_000); // max 2 min
    default:
      return budget.backoffMs;
  }
}

// ── WeChat-specific error helpers ────────────────────────────────────────────

/**
 * Classify a WeChat-specific error and return a wechat-specific recovery hint.
 */
export function classifyWechatError(err: unknown): ClassifiedError {
  return classifyPipelineError(err, { phase: 'publish_drafts' });
}

/**
 * Check if a WeChat error is resolvable by re-uploading vs needs human intervention.
 */
export function isWechatAuthError(code: ErrorCode): boolean {
  return code === 'E_WECHATSYNC_AUTH_MISSING' || code === 'E_WECHATSYNC_AUTH_FAILED';
}
