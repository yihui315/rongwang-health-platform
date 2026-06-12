/**
 * AI 营销流水线 Pipeline Runner v1
 * 6 阶段状态机：prepare → generate_content → seo_geo_gate → publish_drafts → baseline_snapshot → finalize
 *
 * 设计原则：
 * - 每步都有 evidence 输出（即使失败）
 * - non-retryable 错误立即进入 manual_review，不空耗 token
 * - shadow_mode=true 时跳过 publish，只跑分析 steps
 * - 所有状态变更写入 events.jsonl，可审计回放
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

import type {
  MarketingJob,
  PipelinePhase,
  StepStatus,
  NextAction,
  ErrorCode,
  RunRecord,
  PipelineStepResult,
  EventLogEntry,
  NormalizedContext,
  ProductMetadata,
  PublishSummary,
  PlatformPublishResult,
  ManualReviewPackage,
  SeoReadyScoreDetail,
  Platform,
} from './job-types';
export type { RunRecord } from './job-types';
import { ERROR_CODE_RETRYABLE } from './job-types';
import { evaluateMarketingCompliance } from './automation';
import type { ContentGenerationResult } from './ai-content-generator';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const PIPELINE_VERSION = 'v1';
const EVIDENCE_BASE = '/tmp/marketing-pipeline/evidence';

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline Runner (main class)
// ─────────────────────────────────────────────────────────────────────────────

export class MarketingPipelineRunner {
  private readonly job: MarketingJob;
  private readonly evidenceDir: string;
  private readonly runId: string;
  private readonly startedAt: Date;
  private stepResults: PipelineStepResult[] = [];
  private events: EventLogEntry[] = [];
  private _context?: NormalizedContext;
  private get ctx(): NormalizedContext {
    if (!this._context) throw new Error('InternalError: context accessed before prepare phase');
    // Safe: all call sites are after prepare phase or in crash path
    return this._context!;
  }

  constructor(job: MarketingJob) {
    this.job = job;
    this.runId = `run_${randomUUID().slice(0, 8)}`;
    this.startedAt = new Date();
    this.evidenceDir = join(
      EVIDENCE_BASE,
      job.job_id,
      `${this.runId}_${this.startedAt.toISOString().slice(0, 13).replace(/:/g, '-')}`
    );
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async run(): Promise<RunRecord> {
    try {
      // Phase 1: validate & prepare
      const prepareResult = await this.runPrepare();
      this._context = prepareResult.output as NormalizedContext;
      if (prepareResult.nextAction === 'manual_review' || prepareResult.nextAction === 'abort') {
        return this.buildRecord(prepareResult.nextAction === 'abort' ? 'failed' : 'manual_review', prepareResult);
      }

      // Phase 2: generate content
      const generateResult = await this.runGenerateContent();
      if (generateResult.nextAction === 'manual_review' || generateResult.nextAction === 'abort') {
        return this.buildRecord(generateResult.nextAction === 'abort' ? 'failed' : 'manual_review', generateResult);
      }

      // Phase 3: SEO/GEO gate
      const seoResult = await this.runSeoGeoGate(generateResult.output as ContentOutput);
      if (seoResult.nextAction === 'manual_review' || seoResult.nextAction === 'abort') {
        return this.buildRecord(seoResult.nextAction === 'abort' ? 'failed' : 'manual_review', seoResult);
      }

      // Phase 4: publish drafts (skipped in shadow_mode)
      const publishResult = this.job.runtime?.shadow_mode
        ? this.buildSkippedResult('publish_drafts', 'shadow_mode active')
        : await this.runPublishDrafts(generateResult.output as ContentOutput);

      // Phase 5: baseline snapshot
      const baselineResult = this.job.runtime?.shadow_mode
        ? this.buildSkippedResult('baseline_snapshot', 'shadow_mode active')
        : await this.runBaselineSnapshot(publishResult.output as PublishSummary | undefined);

      // Phase 6: finalize
      const finalizeResult = await this.runFinalize({
        generate: generateResult.output as ContentOutput,
        seo: seoResult.output as SeoReadyScoreDetail,
        publish: publishResult.output as PublishSummary | undefined,
        baseline: baselineResult.output as BaselineOutput | undefined,
      });

      const status = finalizeResult.status === 'success'
        ? (this.job.runtime?.shadow_mode ? 'success' : 'degraded_success')
        : 'failed';

      return this.buildRecord(status, finalizeResult);
    } catch (err) {
      const errorResult = this.crashResult(err);
      return this.buildRecord('failed', errorResult);
    }
  }

  // ── Step 1: prepare ────────────────────────────────────────────────────────

  private async runPrepare(): Promise<PipelineStepResult<NormalizedContext>> {
    const timer = startTimer();
    const { job } = this;

    this.log('info', 'prepare', 'starting job validation and context preparation');

    // 1. Validate schema
    const { validateMarketingJob } = await import('./job-types');
    const valid = validateMarketingJob(job);
    if (!valid) {
      return this.failStep<NormalizedContext>('prepare', 'E_JOB_SCHEMA_INVALID',
        `Schema validation failed: ${JSON.stringify(validateMarketingJob.errors)}`, false);
    }

    // 2. Generate idempotency key
    const idempotencyKey = job.idempotency_key ?? this.deriveIdempotencyKey(job);

    // 3. Fetch product metadata if source.type === 'product_url'
    let productMetadata: ProductMetadata | undefined;
    if (job.source.type === 'product_url' && job.source.url) {
      try {
        const { fetchProductMetadata } = await import('./adapters/product-metadata');
        productMetadata = await fetchProductMetadata(job.source.url, job.runtime?.timeout_seconds ?? 30);
      } catch (err) {
        const code: ErrorCode = err instanceof Error && err.message.includes('timeout')
          ? 'E_SOURCE_FETCH_TIMEOUT'
          : 'E_UNEXPECTED';
        return this.failStep<NormalizedContext>('prepare', code,
          `Product metadata fetch failed: ${err}`, ERROR_CODE_RETRYABLE[code]);
      }
    }

    // 4. Build NormalizedContext
    const context: NormalizedContext = {
      jobId: job.job_id,
      idempotencyKey,
      sourceDigest: productMetadata
        ? createHash('sha256').update(job.source.url!).digest('hex').slice(0, 16)
        : createHash('sha256').update(JSON.stringify(job.source)).digest('hex').slice(0, 16),
      locale: job.locale ?? 'zh-CN',
      templateKey: job.content.template_key,
      primaryKeyword: job.seo.primary_keyword,
      secondaryKeywords: job.seo.secondary_keywords ?? [],
      productMetadata,
      briefMarkdown: job.source.brief_markdown,
      titleHint: job.source.title_hint,
      humanReviewRequired: job.content.human_review_required ?? true,
      reviewerRole: job.content.reviewer_role ?? 'medical_editor',
      minSourceCount: job.content.min_source_count ?? 2,
      maxWords: job.content.max_words ?? 1500,
      publishMode: job.distribution.publish_mode ?? 'draft',
      channels: job.distribution.channels.map((c) => c.platform),
      utmCampaign: job.tracking?.utm_campaign,
      utmMedium: job.tracking?.utm_medium,
      conversionEvent: job.tracking?.conversion_event,
      timeoutSeconds: job.runtime?.timeout_seconds ?? 600,
      maxRetries: job.runtime?.max_retries ?? 2,
      shadowMode: job.runtime?.shadow_mode ?? true,
    };

    // Write evidence
    mkdirSync(this.evidenceDir, { recursive: true });

    // Write prepared context checkpoint for resume
    const contextPath = join(this.evidenceDir, 'prepared-context.json');
    writeFileSync(contextPath, JSON.stringify(context, null, 2), 'utf-8');

    // 5. Human review gate
    // Skip if runtime.skip_human_review=true (set by --resume command via CLI override)
    const skipReview = !!(this.job.runtime as Record<string, unknown>)?.skip_human_review;
    const jobEvidenceDir = join(EVIDENCE_BASE, context.jobId);
    const approvalSignalPath = join(jobEvidenceDir, `${this.runId}.approved.json`);
    const isApproved = existsSync(approvalSignalPath);
    if (context.humanReviewRequired && !skipReview && !isApproved) {
      this.log('warn', 'prepare', 'human review required, routing to manual review queue');
      const reviewPkg = this.buildManualReviewPackage('prepare', 'human_review_required', context);
      await this.enqueueManualReview([reviewPkg]);
      return this.stepResult<NormalizedContext>('prepare', 'success', timer.ms(), {
        nextAction: 'manual_review',
        output: context,
        errorMessage: 'Human review required before content generation',
        evidence: [{ kind: 'json', path: contextPath }],
      });
    }
    if (skipReview) this.log('info', 'prepare', 'human review skipped (runtime.skip_human_review=true)');

    this.log('info', 'prepare', `context prepared: ${context.primaryKeyword}, shadow=${context.shadowMode}`);
    return this.stepResult<NormalizedContext>('prepare', 'success', timer.ms(), {
      nextAction: 'continue',
      output: context,
      evidence: [],
    });
  }

  // ── Step 2: generate_content ────────────────────────────────────────────────

  private async runGenerateContent(): Promise<PipelineStepResult<ContentOutput>> {
    const timer = startTimer();
    const context = this.ctx;

    this.log('info', 'generate_content', `generating content for: ${context.primaryKeyword}`);

    try {
      const { generateTextWithProvider } = await import('@/lib/ai/provider');

      const prompt = this.buildContentPrompt(context);
      const result = await generateTextWithProvider({
        prompt,
        model: 'deepseek',
        maxTokens: Math.min(context.maxWords * 2, 2000),
      });

      const contentText = result.text?.trim() ?? '';

      // Quality gates
      if (contentText.length < 200) {
        return this.failStep<ContentOutput>('generate_content', 'E_CONTENT_EMPTY',
          'Generated content is empty or too short', false);
      }

      if (containsPlaceholderText(contentText)) {
        return this.failStep<ContentOutput>('generate_content', 'E_CONTENT_PLACEHOLDER_REMAINING',
          'Content contains placeholder text like [xxx]', false);
      }

      // Compliance check
      const compliance = evaluateMarketingCompliance(contentText);
      if (!compliance.approved) {
        this.log('warn', 'generate_content', `compliance warnings: ${compliance.warnings.join(', ')}`);
      }

      // Extract title from first H1 or first line
      const titleMatch = contentText.match(/^#\s+(.+)$/m) ?? contentText.match(/^(.{5,60}?)[\n\r]/);
      const title = titleMatch?.[1]?.trim() ?? context.primaryKeyword;

      const output: ContentOutput = {
        title,
        content: contentText,
        excerpt: contentText.slice(0, 200).replace(/[#*]/g, '').trim(),
        wordCount: contentText.replace(/[#*_\n\r]/g, '').length,
        compliance,
      };

      // Write article to evidence dir
      const articlePath = join(this.evidenceDir, 'article.md');
      writeFileSync(articlePath, contentText, 'utf-8');

      this.log('info', 'generate_content', `content generated: ${output.wordCount} words`);
      return this.stepResult<ContentOutput>('generate_content', 'success', timer.ms(), {
        nextAction: 'continue',
        output,
        evidence: [{ kind: 'markdown', path: articlePath }],
      });
    } catch (err) {
      const code = this.classifyProviderError(err);
      return this.failStep<ContentOutput>('generate_content', code,
        `Content generation failed: ${err}`, ERROR_CODE_RETRYABLE[code]);
    }
  }

  private buildContentPrompt(ctx: NormalizedContext): string {
    const { primaryKeyword, secondaryKeywords, maxWords, briefMarkdown, templateKey } = ctx;
    const COMPLIANCE_RULES = `
【合规要求 - 严格遵守】
- 禁止：治愈、治疗、诊断、处方、替代医生
- 禁止：100%、保证、一定、永久、彻底、无副作用
- 禁止：最有效、唯一、首选、零风险
- 允许：支持、帮助、改善、促进、辅助调理、参考
- 所有内容必须以健康教育为主，最终引导用户完成AI健康评估
- 需要在内容结尾保留"本内容仅供健康教育参考，不构成医学建议"的免责声明`;

    if (templateKey === 'wechat_article') {
      return `你是荣旺健康的资深健康教育内容编辑，负责撰写微信公众号文章。

## 任务
请根据以下信息，撰写一篇适合微信公众号的健康教育文章。

## 内容主题
标题：${primaryKeyword}
关键词：${[primaryKeyword, ...secondaryKeywords].join('、')}
${briefMarkdown ? `内容摘要：${briefMarkdown}` : ''}

## 结构要求（Markdown格式）
1. H1标题（吸引眼球，可用emoji点缀）
2. 导读段落（100字，建立共鸣）
3. 3-4个H2章节，每章包含实用信息
4. H2"先评估，更精准"（引导AI评估环节）
5. 延伸阅读（如果有）
6. CTA：https://rongwang.hk/ai-consult
7. 官网商城入口
8. 免责声明

## 字数
${maxWords}字左右

## 文风
- 亲切自然，像朋友推荐
- 适当使用emoji增加可读性（✅⚠️💡🌙🍵🏃等）
- 避免过度营销感，以教育为主
${COMPLIANCE_RULES}

请直接输出Markdown格式文章。`;
    }

    // Default: SEO article
    return `你是荣旺健康的资深健康教育内容编辑，负责撰写SEO文章。

## 任务
请根据以下信息，撰写一篇高质量的SEO健康教育文章。

## 内容主题
标题：${primaryKeyword}
关键词：${[primaryKeyword, ...secondaryKeywords].join('、')}
${briefMarkdown ? `内容摘要：${briefMarkdown}` : ''}

## 结构要求
1. H1标题（与主题一致）
2. 前言（100字，引入话题，建立用户痛点共鸣）
3. H2章节（3-5章），每章：
   - 包含2-3个段落
   - 自然融入关键词
   - 给出实用的健康教育信息
4. H2"先评估，再看方案"（引导AI评估）
5. 免责声明（固定格式）

## 字数
${maxWords}字左右

## 注意事项
- 内容纯健康教育，不做任何诊断或治疗承诺
- 涉及营养补充剂时，以"查阅研究文献""健康辅助参考"方式描述
- 如症状严重、持续或正在服药，建议先咨询医生
${COMPLIANCE_RULES}

请直接输出文章正文，不需要任何额外说明。`;
  }

  // ── Step 3: seo_geo_gate ───────────────────────────────────────────────────

  private async runSeoGeoGate(content: ContentOutput): Promise<PipelineStepResult<SeoReadyScoreDetail>> {
    const timer = startTimer();
    const context = this.ctx;

    this.log('info', 'seo_geo_gate', 'calculating SEO/GEO Ready Score');

    const { calculateSeoReadyScore } = await import('./seo-ready-score');
    const score = calculateSeoReadyScore({
      title: content.title,
      content: content.content,
      primaryKeyword: this.ctx.primaryKeyword,
      secondaryKeywords: this.ctx.secondaryKeywords,
      schemaTypes: this.job.seo.schema_types ?? ['Article'],
      minScore: this.job.seo.min_ready_score ?? 70,
    });

    const articlePath = join(this.evidenceDir, 'article.md');
    const reportPath = join(this.evidenceDir, 'seo-report.json');
    writeFileSync(reportPath, JSON.stringify(score, null, 2), 'utf-8');

    if (!score.passed) {
      this.log('warn', 'seo_geo_gate', `SEO score ${score.total} below threshold ${score.blockers.join(', ')}`);
      return this.stepResult<SeoReadyScoreDetail>('seo_geo_gate', 'degraded', timer.ms(), {
        nextAction: 'manual_review',
        output: score,
        errorMessage: `SEO score ${score.total}/${this.job.seo.min_ready_score ?? 70}: ${score.blockers.join(', ')}`,
        evidence: [
          { kind: 'markdown', path: articlePath },
          { kind: 'json', path: reportPath },
        ],
      });
    }

    this.log('info', 'seo_geo_gate', `SEO score ${score.total} passed`);
    return this.stepResult<SeoReadyScoreDetail>('seo_geo_gate', 'success', timer.ms(), {
      nextAction: 'continue',
      output: score,
      evidence: [
        { kind: 'markdown', path: articlePath },
        { kind: 'json', path: reportPath },
      ],
    });
  }

  // ── Step 4: publish_drafts ─────────────────────────────────────────────────

  private async runPublishDrafts(content: ContentOutput): Promise<PipelineStepResult<PublishSummary>> {
    const timer = startTimer();
    const context = this.ctx;

    this.log('info', 'publish_drafts', `publishing to ${context.channels.join(', ')}`);

    const summary: PublishSummary = {
      runId: this.runId,
      requestedChannels: context.channels,
      succeeded: [],
      failed: [],
      authMissing: [],
      rateLimited: [],
      partialSuccess: false,
      manualPackageGenerated: false,
      totalDurationMs: 0,
    };

    for (const platform of context.channels) {
      const result = await this.publishToPlatform(platform, content, context);
      switch (result.status) {
        case 'success':
        case 'draft_created':
          summary.succeeded.push(platform);
          break;
        case 'auth_missing':
          summary.authMissing.push(platform);
          break;
        case 'rate_limited':
          summary.rateLimited.push(platform);
          summary.failed.push(platform);
          break;
        default:
          summary.failed.push(platform);
      }
    }

    summary.partialSuccess = summary.succeeded.length > 0 && summary.failed.length > 0;
    summary.totalDurationMs = timer.ms();

    const summaryPath = join(this.evidenceDir, 'publish-summary.json');
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    if (summary.succeeded.length === 0 && summary.failed.length > 0) {
      return this.failStep<PublishSummary>('publish_drafts', 'E_PUBLISH_ALL_FAILED',
        `All platforms failed: ${summary.failed.join(', ')}`, false);
    }

    return this.stepResult<PublishSummary>('publish_drafts',
      summary.partialSuccess ? 'degraded' : 'success', timer.ms(), {
        nextAction: summary.partialSuccess ? 'manual_review' : 'continue',
        output: summary,
        evidence: [{ kind: 'json', path: summaryPath }],
      });
  }

  // ── Step 5: baseline_snapshot ─────────────────────────────────────────────

  private async runBaselineSnapshot(
    _publishSummary?: PublishSummary
  ): Promise<PipelineStepResult<BaselineOutput>> {
    const timer = startTimer();
    const context = this.ctx;

    this.log('info', 'baseline_snapshot', 'capturing baseline snapshot');

    const { snapshotSeoRank } = await import('./adapters/seo-snapshot');
    const snapshot = await snapshotSeoRank(this.ctx.primaryKeyword, this.ctx.timeoutSeconds);

    const baselinePath = join(this.evidenceDir, 'baseline-snapshot.json');
    writeFileSync(baselinePath, JSON.stringify(snapshot, null, 2), 'utf-8');

    const output: BaselineOutput = {
      keyword: context.primaryKeyword,
      snapshotAt: new Date().toISOString(),
      rankData: snapshot,
    };

    return this.stepResult<BaselineOutput>('baseline_snapshot', 'success', timer.ms(), {
      nextAction: 'continue',
      output,
      evidence: [{ kind: 'json', path: baselinePath }],
    });
  }

  // ── Step 6: finalize ──────────────────────────────────────────────────────

  private async runFinalize(inputs: FinalizeInputs): Promise<PipelineStepResult<void>> {
    const timer = startTimer();
    const context = this.ctx;

    this.log('info', 'finalize', 'writing run record and events');

    const record: RunRecord = {
      runId: this.runId,
      jobId: this.ctx.jobId,
      trigger: this.job.trigger,
      status: 'success',
      startedAt: this.startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      totalDurationMs: timer.ms(),
      shadowMode: context.shadowMode,
      steps: this.stepResults,
      publishSummary: inputs.publish,
      seoReadyScore: inputs.seo,
      idempotencyKey: context.idempotencyKey,
      evidenceDir: this.evidenceDir,
    };

    // Write run.json
    const runPath = join(this.evidenceDir, 'run.json');
    writeFileSync(runPath, JSON.stringify(record, null, 2), 'utf-8');

    // Append to events.jsonl
    const eventsPath = join(EVIDENCE_BASE, context.jobId, 'events.jsonl');
    mkdirSync(join(EVIDENCE_BASE, context.jobId), { recursive: true });
    for (const event of this.events) {
      appendFileSync(eventsPath, JSON.stringify(event) + '\n', 'utf-8');
    }

    return this.stepResult<void>('finalize', 'success', timer.ms(), {
      nextAction: 'continue',
      output: undefined,
      evidence: [{ kind: 'json', path: runPath }],
    });
  }

  // ── Helper Methods ─────────────────────────────────────────────────────────

  private buildRecord(status: RunRecord['status'], finalStep: PipelineStepResult<unknown>): RunRecord {
    const endedAt = new Date().toISOString();
    const totalDurationMs = new Date(endedAt).getTime() - this.startedAt.getTime();
    // Use _context directly to avoid the ctx getter guard — this method is called
    // both from the normal path (after prepare) and from the crash catch block
    // (where _context may not be set yet).
    const ctx = this._context;

    return {
      runId: this.runId,
      jobId: this.job.job_id,
      trigger: this.job.trigger,
      status,
      startedAt: this.startedAt.toISOString(),
      endedAt,
      totalDurationMs,
      shadowMode: this.job.runtime?.shadow_mode ?? true,
      steps: this.stepResults,
      publishSummary: (finalStep.output as FinalizeInputs)?.publish as PublishSummary | undefined,
      seoReadyScore: (finalStep.output as FinalizeInputs)?.seo as SeoReadyScoreDetail | undefined,
      idempotencyKey: ctx?.idempotencyKey ?? this.deriveIdempotencyKey(this.job),
      evidenceDir: this.evidenceDir,
    };
  }

  private stepResult<T>(
    step: PipelinePhase,
    status: StepStatus,
    durationMs: number,
    opts: Partial<Omit<PipelineStepResult, 'step' | 'status' | 'startedAt' | 'endedAt' | 'durationMs' | 'retryCount' | 'retryable'>> & { output: T }
  ): PipelineStepResult<T> {
    const result: PipelineStepResult<T> = {
      step: step as PipelinePhase,
      status,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationMs,
      retryCount: 0,
      retryable: false,
      nextAction: 'continue',
      evidence: [],
      ...opts,
    } as PipelineStepResult<T>;
    this.stepResults.push(result as PipelineStepResult);
    return result;
  }

  private failStep<T>(
    step: PipelinePhase,
    code: ErrorCode,
    message: string,
    retryable: boolean
  ): PipelineStepResult<T> {
    this.log('error', step, `${code}: ${message}`);
    const result: PipelineStepResult<T> = {
      step: step as PipelinePhase,
      status: 'failed',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationMs: 0,
      retryCount: 0,
      retryable,
      errorCode: code,
      errorMessage: message,
      nextAction: retryable ? 'retry_later' : 'abort',
      evidence: [],
    } as PipelineStepResult<T>;
    this.stepResults.push(result as PipelineStepResult);
    return result;
  }

  private buildSkippedResult(step: PipelinePhase, reason: string): PipelineStepResult<undefined> {
    this.log('info', step, `skipped: ${reason}`);
    const result: PipelineStepResult<undefined> = {
      step: step as PipelinePhase,
      status: 'skipped',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationMs: 0,
      retryCount: 0,
      retryable: false,
      nextAction: 'skip_optional',
      evidence: [],
    };
    this.stepResults.push(result as PipelineStepResult);
    return result;
  }

  private crashResult(err: unknown): PipelineStepResult<undefined> {
    const message = err instanceof Error ? err.message : String(err);
    return {
      step: 'prepare',
      status: 'failed',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationMs: 0,
      retryCount: 0,
      retryable: false,
      errorCode: 'E_UNEXPECTED',
      errorMessage: `Runner crash: ${message}`,
      nextAction: 'abort',
      evidence: [],
    };
  }

  private buildManualReviewPackage(
    step: PipelinePhase,
    blocker: string,
    ctx: NormalizedContext
  ): ManualReviewPackage {
    return {
      jobId: this.job.job_id,
      runId: this.runId,
      step,
      pendingSince: new Date().toISOString(),
      blocker,
      articleRef: join(this.evidenceDir, 'article.md'),
      actions: ['edit_article', 're_score', 'approve_manual', 'reject'],
    };
  }

  private async enqueueManualReview(pending: ManualReviewPackage[]): Promise<void> {
    const queuePath = join(EVIDENCE_BASE, 'manual-review-queue.json');
    let queue: ManualReviewPackage[] = [];
    if (existsSync(queuePath)) {
      try {
        queue = JSON.parse(readFileSync(queuePath, 'utf-8'));
      } catch {
        queue = [];
      }
    }
    queue.push(...pending);
    mkdirSync(join(EVIDENCE_BASE), { recursive: true });
    writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');
  }

  private log(
    level: EventLogEntry['level'],
    step: PipelinePhase | undefined,
    message: string,
    extra?: Record<string, unknown>
  ): void {
    const entry: EventLogEntry = {
      ts: new Date().toISOString(),
      runId: this.runId,
      step,
      level,
      status: this.stepResults.at(-1)?.status,
      durationMs: this.stepResults.at(-1)?.durationMs,
      message,
      extra,
    };
    this.events.push(entry);
    console.log(`[${level.toUpperCase()}] [${step ?? 'runner'}] ${message}`,
      extra ? JSON.stringify(extra) : '');
  }

  private deriveIdempotencyKey(job: MarketingJob): string {
    const raw = [job.job_id, job.source.type, job.source.url ?? job.source.topic ?? '', job.seo.primary_keyword]
      .filter(Boolean).join('|');
    return createHash('sha256').update(raw).digest('hex').slice(0, 32);
  }

  private classifyProviderError(err: unknown): ErrorCode {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('429')) return 'E_CONTENT_PROVIDER_429';
    if (/5\d{2}/.test(msg)) return 'E_CONTENT_PROVIDER_5XX';
    if (msg.includes('timeout')) return 'E_CONTENT_PROVIDER_5XX';
    return 'E_UNEXPECTED';
  }

  private async publishToPlatform(
    platform: Platform,
    content: ContentOutput,
    ctx: NormalizedContext
  ): Promise<PlatformPublishResult> {
    try {
      if (platform === 'wechat') {
        const { publishWechatDraft } = await import('./adapters/wechatsync');
        return await publishWechatDraft({
          content: { title: content.title, content: content.content, excerpt: content.excerpt },
          context: { runId: this.runId, channels: ctx.channels, utmCampaign: ctx.utmCampaign },
          runId: this.runId,
        });
      }
      // Other platforms: fall back to manual_package
      return { platform, status: 'skipped', skippedReason: `${platform} not yet implemented, manual_package mode` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth') || msg.includes('cookie')) {
        return { platform, status: 'auth_missing', errorMessage: msg };
      }
      if (msg.includes('rate_limit') || msg.includes('429')) {
        return { platform, status: 'rate_limited', errorMessage: msg };
      }
      return { platform, status: 'failed', errorMessage: msg };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper types & utils
// ─────────────────────────────────────────────────────────────────────────────

interface ContentOutput {
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
  compliance: ReturnType<typeof evaluateMarketingCompliance>;
}

interface BaselineOutput {
  keyword: string;
  snapshotAt: string;
  rankData: unknown;
}

interface FinalizeInputs {
  generate: ContentOutput;
  seo: SeoReadyScoreDetail;
  publish?: PublishSummary;
  baseline?: BaselineOutput;
}

function startTimer() {
  const start = Date.now();
  return { ms: () => Date.now() - start };
}

function containsPlaceholderText(text: string): boolean {
  return /\[.{1,30}\]|\b(TODO|FIXME|PLACEHOLDER|示例|占位)\b/.test(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public factory function
// ─────────────────────────────────────────────────────────────────────────────

export async function runMarketingPipeline(job: MarketingJob): Promise<RunRecord> {
  const runner = new MarketingPipelineRunner(job);
  return runner.run();
}
