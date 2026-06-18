/**
 * 荣旺健康平台 AI 营销流水线 v1 类型定义
 * 对应 marketing-job.schema.json (JSON Schema Draft 2020-12)
 */

import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline Phase & Status
// ─────────────────────────────────────────────────────────────────────────────

export type PipelinePhase =
  | 'prepare'
  | 'generate_content'
  | 'seo_geo_gate'
  | 'publish_drafts'
  | 'baseline_snapshot'
  | 'finalize'
  | 'autonomous';

export type StepStatus = 'success' | 'degraded' | 'retrying' | 'failed' | 'skipped';

export type NextAction =
  | 'continue'
  | 'manual_review'
  | 'retry_later'
  | 'skip_optional'
  | 'abort';

export type ErrorCode =
  | 'E_JOB_SCHEMA_INVALID'
  | 'E_SOURCE_FETCH_TIMEOUT'
  | 'E_CONTENT_EMPTY'
  | 'E_CONTENT_PLACEHOLDER_REMAINING'
  | 'E_CONTENT_PROVIDER_429'
  | 'E_CONTENT_PROVIDER_5XX'
  | 'E_SEO_SCORE_BELOW_THRESHOLD'
  | 'E_SCHEMA_VISIBLE_CONTENT_MISMATCH'
  | 'E_RANK_SOURCE_TIMEOUT'
  | 'E_WECHATSYNC_AUTH_MISSING'
  | 'E_WECHATSYNC_AUTH_FAILED'
  | 'E_PLATFORM_RATE_LIMIT'
  | 'E_PUBLISH_PARTIAL_SUCCESS'
  | 'E_PUBLISH_ALL_FAILED'
  | 'E_EVIDENCE_WRITE_FAILED'
  | 'E_IDEMPOTENCY_KEY_COLLISION'
  | 'E_UNEXPECTED';

export type JobTrigger = 'cron' | 'manual' | 'api';

export type PublishMode = 'none' | 'draft' | 'publish' | 'manual_package';

export type ReviewerRole = 'medical_editor' | 'nutrition_editor' | 'ops_editor' | 'none';

export type SourceType = 'product_url' | 'topic' | 'campaign_brief';

export type Platform =
  | 'wechat'
  | 'zhihu'
  | 'juejin'
  | 'csdn'
  | 'toutiao'
  | 'xiaohongshu'
  | 'wordpress';

export type SchemaType = 'Article' | 'BlogPosting' | 'Organization' | 'FAQPage';

// ─────────────────────────────────────────────────────────────────────────────
// Evidence
// ─────────────────────────────────────────────────────────────────────────────

export type EvidenceKind = 'log' | 'json' | 'markdown' | 'metric' | 'screenshot' | 'url';

export interface EvidenceRef {
  kind: EvidenceKind;
  path: string;
  sha256?: string;
}

export interface PipelineStepResult<TOutput = unknown> {
  step: PipelinePhase;
  status: StepStatus;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  retryCount: number;
  retryable: boolean;
  inputRef?: string;
  output?: TOutput;
  metrics?: Record<string, number>;
  errorCode?: ErrorCode;
  errorMessage?: string;
  nextAction: NextAction;
  evidence: EvidenceRef[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO Ready Score
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoReadyScoreDetail {
  title_h1: number;        // 20%
  author_reviewer_sources: number; // 20%
  content_uniqueness: number; // 15%
  article_jsonld: number;   // 15%
  meta_canonical_date: number; // 10%
  internal_links_cta: number; // 10%
  image_alt_visibility: number; // 10%
  total: number;            // 0-100
  passed: boolean;
  blockers: string[];      // 哪些检查项未通过
}

// ─────────────────────────────────────────────────────────────────────────────
// Publish Summary
// ─────────────────────────────────────────────────────────────────────────────

export interface PlatformPublishResult {
  platform: Platform;
  status: 'success' | 'draft_created' | 'auth_missing' | 'rate_limited' | 'failed' | 'skipped';
  draftUrl?: string;
  errorMessage?: string;
  skippedReason?: string;
}

export interface PublishSummary {
  runId: string;
  requestedChannels: Platform[];
  succeeded: Platform[];
  failed: Platform[];
  authMissing: Platform[];
  rateLimited: Platform[];
  partialSuccess: boolean;
  manualPackageGenerated: boolean;
  totalDurationMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Manual Review
// ─────────────────────────────────────────────────────────────────────────────

export interface ManualReviewPackage {
  jobId: string;
  runId: string;
  step: PipelinePhase;
  pendingSince: string;
  blocker: string;
  readyScore?: number;
  threshold?: number;
  articleRef: string;
  seoReportRef?: string;
  actions: ManualReviewAction[];
}

export type ManualReviewAction = 'edit_article' | 're_score' | 'approve_manual' | 'reject';

export interface ManualReviewQueue {
  pending: ManualReviewPackage[];
  total: number;
  oldestPendingMs?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context (prepare step output)
// ─────────────────────────────────────────────────────────────────────────────

export interface NormalizedContext {
  jobId: string;
  idempotencyKey: string;
  sourceDigest: string;
  locale: string;
  templateKey: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  productMetadata?: ProductMetadata;
  briefMarkdown?: string;
  titleHint?: string;
  humanReviewRequired: boolean;
  reviewerRole: ReviewerRole;
  minSourceCount: number;
  maxWords: number;
  publishMode: PublishMode;
  channels: Platform[];
  utmCampaign?: string;
  utmMedium?: string;
  conversionEvent?: string;
  timeoutSeconds: number;
  maxRetries: number;
  shadowMode: boolean;
}

export interface ProductMetadata {
  name: string;
  category?: string;
  description?: string;
  price?: string;
  images?: string[];
  sourceUrl: string;
  fetchedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Run Record (finalize step output)
// ─────────────────────────────────────────────────────────────────────────────

export interface RunRecord {
  runId: string;
  jobId: string;
  trigger: JobTrigger;
  status: 'success' | 'degraded_success' | 'failed' | 'manual_review';
  startedAt: string;
  endedAt: string;
  totalDurationMs: number;
  shadowMode: boolean;
  steps: PipelineStepResult[];
  manualReview?: ManualReviewPackage;
  publishSummary?: PublishSummary;
  seoReadyScore?: SeoReadyScoreDetail;
  idempotencyKey: string;
  evidenceDir: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Log Entry (events.jsonl)
// ─────────────────────────────────────────────────────────────────────────────

export interface EventLogEntry {
  ts: string;
  runId: string;
  step?: PipelinePhase;
  level: 'info' | 'warn' | 'error' | 'debug';
  status?: StepStatus;
  durationMs?: number;
  retryCount?: number;
  code?: ErrorCode;
  message: string;
  traceId?: string;
  extra?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Marketing Job (input contract)
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketingJob {
  job_id: string;
  idempotency_key?: string;
  trigger: JobTrigger;
  locale?: string;
  source: MarketingJobSource;
  content: MarketingJobContent;
  seo: MarketingJobSeo;
  distribution: MarketingJobDistribution;
  tracking?: MarketingJobTracking;
  runtime?: MarketingJobRuntime;
}

export interface MarketingJobSource {
  type: SourceType;
  url?: string;
  topic?: string;
  brief_markdown?: string;
  title_hint?: string;
  product_id?: string;
}

export interface MarketingJobContent {
  template_key: string;
  max_words?: number;
  human_review_required?: boolean;
  reviewer_role?: ReviewerRole;
  min_source_count?: number;
}

export interface MarketingJobSeo {
  primary_keyword: string;
  secondary_keywords?: string[];
  schema_types?: SchemaType[];
  min_ready_score?: number;
}

export interface MarketingJobDistribution {
  publish_mode?: PublishMode;
  channels: MarketingJobChannel[];
}

export interface MarketingJobChannel {
  platform: Platform;
  required?: boolean;
}

export interface MarketingJobTracking {
  utm_campaign?: string;
  utm_medium?: string;
  conversion_event?: string;
}

export interface MarketingJobRuntime {
  timeout_seconds?: number;
  max_retries?: number;
  shadow_mode?: boolean;
  /** Resume from an approved manual review checkpoint */
  skip_human_review?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Validation
// ─────────────────────────────────────────────────────────────────────────────

export const marketingJobSchema = {
  $schema: 'http://json-schema.org/draft-07/schema',
  $id: 'urn:rongwang:marketing-job:v1',
  title: 'Marketing Job',
  type: 'object',
  additionalProperties: false,
  required: ['job_id', 'trigger', 'source', 'content', 'seo', 'distribution', 'runtime'],
  properties: {
    job_id: {
      type: 'string',
      pattern: '^mj_[a-z0-9_-]{8,64}$',
    },
    idempotency_key: {
      type: 'string',
      minLength: 16,
      maxLength: 128,
    },
    trigger: {
      type: 'string',
      enum: ['cron', 'manual', 'api'],
    },
    locale: {
      type: 'string',
      default: 'zh-CN',
    },
    source: {
      type: 'object',
      additionalProperties: false,
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: ['product_url', 'topic', 'campaign_brief'],
        },
        url: { type: 'string', format: 'uri' },
        topic: { type: 'string', minLength: 4 },
        brief_markdown: { type: 'string', minLength: 20 },
        title_hint: { type: 'string' },
        product_id: { type: 'string' },
      },
    },
    content: {
      type: 'object',
      additionalProperties: false,
      required: ['template_key', 'max_words', 'human_review_required'],
      properties: {
        template_key: { type: 'string' },
        max_words: { type: 'integer', minimum: 300, maximum: 4000 },
        human_review_required: { type: 'boolean', default: true },
        reviewer_role: {
          type: 'string',
          enum: ['medical_editor', 'nutrition_editor', 'ops_editor', 'none'],
          default: 'medical_editor',
        },
        min_source_count: { type: 'integer', minimum: 0, maximum: 10, default: 2 },
      },
    },
    seo: {
      type: 'object',
      additionalProperties: false,
      required: ['primary_keyword', 'schema_types', 'min_ready_score'],
      properties: {
        primary_keyword: { type: 'string', minLength: 2 },
        secondary_keywords: { type: 'array', items: { type: 'string' }, maxItems: 10 },
        schema_types: {
          type: 'array',
          items: { type: 'string', enum: ['Article', 'BlogPosting', 'Organization', 'FAQPage'] },
          minItems: 1,
        },
        min_ready_score: { type: 'integer', minimum: 0, maximum: 100, default: 70 },
      },
    },
    distribution: {
      type: 'object',
      additionalProperties: false,
      required: ['publish_mode', 'channels'],
      properties: {
        publish_mode: {
          type: 'string',
          enum: ['none', 'draft', 'publish', 'manual_package'],
          default: 'draft',
        },
        channels: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['platform'],
            properties: {
              platform: {
                type: 'string',
                enum: ['wechat', 'zhihu', 'juejin', 'csdn', 'toutiao', 'xiaohongshu', 'wordpress'],
              },
              required: { type: 'boolean', default: false },
            },
          },
        },
      },
    },
    tracking: {
      type: 'object',
      additionalProperties: false,
      properties: {
        utm_campaign: { type: 'string' },
        utm_medium: { type: 'string' },
        conversion_event: { type: 'string' },
      },
    },
    runtime: {
      type: 'object',
      additionalProperties: false,
      required: ['timeout_seconds', 'max_retries', 'shadow_mode'],
      properties: {
        timeout_seconds: { type: 'integer', minimum: 30, maximum: 3600, default: 600 },
        max_retries: { type: 'integer', minimum: 0, maximum: 5, default: 2 },
        shadow_mode: { type: 'boolean', default: true },
        skip_human_review: { type: 'boolean', default: false },
      },
    },
  },
} as const;

// Singleton AJV instance with format validation
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

export const validateMarketingJob: ValidateFunction = ajv.compile(marketingJobSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: ValidateFunction['errors'];
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Code Utilities
// ─────────────────────────────────────────────────────────────────────────────

export const ERROR_CODE_RETRYABLE: Record<ErrorCode, boolean> = {
  E_JOB_SCHEMA_INVALID: false,
  E_SOURCE_FETCH_TIMEOUT: true,
  E_CONTENT_EMPTY: false,
  E_CONTENT_PLACEHOLDER_REMAINING: false,
  E_CONTENT_PROVIDER_429: true,
  E_CONTENT_PROVIDER_5XX: true,
  E_SEO_SCORE_BELOW_THRESHOLD: false,
  E_SCHEMA_VISIBLE_CONTENT_MISMATCH: false,
  E_RANK_SOURCE_TIMEOUT: true,
  E_WECHATSYNC_AUTH_MISSING: false,
  E_WECHATSYNC_AUTH_FAILED: false,
  E_PLATFORM_RATE_LIMIT: true,
  E_PUBLISH_PARTIAL_SUCCESS: false,
  E_PUBLISH_ALL_FAILED: false,
  E_EVIDENCE_WRITE_FAILED: true,
  E_IDEMPOTENCY_KEY_COLLISION: false,
  E_UNEXPECTED: false,
};

export const STEP_PHASES: PipelinePhase[] = [
  'prepare',
  'generate_content',
  'seo_geo_gate',
  'publish_drafts',
  'baseline_snapshot',
  'finalize',
];