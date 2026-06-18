/**
 * 荣旺营销 Pipeline v1 — Evidence Logger
 * 持久化 Evidence 日志（解决 /tmp 路径数据丢失问题）
 *
 * 输出目录: ./data/marketing-runs/ (持久化)
 * Fallback: /tmp/marketing-pipeline/evidence/ (仅在持久化路径不可写时使用)
 *
 * 输出文件:
 *   {timestamp}-{jobId}.json    — 结构化RunRecord
 *   {timestamp}-{jobId}.md      — 人类可读摘要
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface EvidenceLogResult {
  persisted: boolean; // true = data/ 路径, false = /tmp/ 路径
  path: string;
  jsonPath: string;
  mdPath: string;
  sha256: string;
}

export type RunRecord = {
  runId: string;
  jobId: string;
  status: 'success' | 'degraded_success' | 'failed' | 'manual_review';
  startedAt: string;
  endedAt: string;
  totalDurationMs: number;
  shadowMode: boolean;
  steps: Array<Record<string, unknown>>;
  seoReadyScore?: { total: number; passed: boolean; blockers: string[] };
  publishSummary?: {
    succeeded: string[];
    failed: string[];
    authMissing: string[];
    manualPackageGenerated: boolean;
  };
  evidenceDir: string;
  idempotencyKey: string;
};

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PRIMARY_EVIDENCE_DIR = process.env.MARKETING_EVIDENCE_DIR
  || join(process.cwd(), 'data', 'marketing-runs');
const FALLBACK_EVIDENCE_DIR = '/tmp/marketing-pipeline/evidence';

// ─────────────────────────────────────────────
// Evidence Logger
// ─────────────────────────────────────────────

export class EvidenceLogger {
  private readonly jobId: string;
  private readonly timestamp: string;
  private readonly runId: string;
  private readonly evidenceDir: string;
  private readonly persisted: boolean;

  constructor(jobId: string, runId?: string) {
    this.jobId = jobId;
    this.runId = runId ?? `run_${Date.now()}`;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // Try primary (persistent) path first
    const primaryDir = join(PRIMARY_EVIDENCE_DIR, jobId);
    if (this._isWritable(primaryDir)) {
      this.evidenceDir = primaryDir;
      this.persisted = true;
    } else {
      this.evidenceDir = join(FALLBACK_EVIDENCE_DIR, jobId);
      this.persisted = false;
    }

    mkdirSync(this.evidenceDir, { recursive: true });
  }

  private _isWritable(dirPath: string): boolean {
    try {
      mkdirSync(dirPath, { recursive: true });
      const testFile = join(dirPath, `.write_test_${Date.now()}`);
      writeFileSync(testFile, 'test', 'utf-8');
      import('fs').then(({ unlinkSync }) => {
        try { unlinkSync(testFile); } catch { /* ignore */ }
      });
      return true;
    } catch {
      return false;
    }
  }

  private _safeDir(dirPath: string): string {
    try {
      mkdirSync(dirPath, { recursive: true });
      return dirPath;
    } catch {
      return FALLBACK_EVIDENCE_DIR;
    }
  }

  private jsonPath(): string {
    return join(this.evidenceDir, `${this.timestamp}-${this.jobId}.json`);
  }

  private mdPath(): string {
    return join(this.evidenceDir, `${this.timestamp}-${this.jobId}.md`);
  }

  /**
   * Log a complete RunRecord
   */
  logRun(record: RunRecord): EvidenceLogResult {
    const jsonPath = this.jsonPath();
    const mdPath = this.mdPath();

    // Ensure directory
    this._safeDir(dirname(jsonPath));
    this._safeDir(dirname(mdPath));

    // Write JSON
    let jsonContent: string;
    try {
      jsonContent = JSON.stringify(record, null, 2);
      writeFileSync(jsonPath, jsonContent, 'utf-8');
    } catch (err) {
      console.error(`[EvidenceLogger] Failed to write JSON to ${jsonPath}: ${err}`);
      throw err;
    }

    // Write Markdown summary
    try {
      const md = this._buildMarkdown(record);
      writeFileSync(mdPath, md, 'utf-8');
    } catch (err) {
      console.warn(`[EvidenceLogger] Failed to write Markdown to ${mdPath}: ${err}`);
    }

    // Compute SHA256 of JSON content
    const sha256 = createHash('sha256').update(jsonContent).digest('hex');

    console.log(`[EvidenceLogger] Logged run ${record.runId} to ${this.evidenceDir} (persisted=${this.persisted})`);

    return {
      persisted: this.persisted,
      path: this.evidenceDir,
      jsonPath,
      mdPath,
      sha256,
    };
  }

  private _buildMarkdown(record: RunRecord): string {
    const stepLines = record.steps.map((s) => {
      const step = (s as Record<string, unknown>).step as string;
      const status = (s as Record<string, unknown>).status as string;
      const durationMs = (s as Record<string, unknown>).durationMs as number;
      const icon = status === 'success' ? '✅' : status === 'failed' ? '❌' : '⚠️';
      return `| ${icon} | ${step} | ${status} | ${durationMs}ms |`;
    }).join('\n');

    const seoScore = record.seoReadyScore
      ? `**${record.seoReadyScore.total}**/100 ${record.seoReadyScore.passed ? '✅' : '❌'}`
      : 'N/A';

    const publishSucceeded = record.publishSummary?.succeeded?.join(', ') ?? 'none';
    const publishFailed = record.publishSummary?.failed?.join(', ') ?? 'none';

    const finalVerdict = record.status === 'success' || record.status === 'degraded_success'
      ? `✅ **PASS** — Pipeline completed with status: ${record.status}`
      : record.status === 'manual_review'
      ? `⚠️ **REVIEW** — Pipeline requires manual review`
      : `❌ **FAIL** — Pipeline failed with status: ${record.status}`;

    return `# 荣旺营销 Pipeline Run — ${record.jobId}

## Run Summary

| Field | Value |
|-------|-------|
| Run ID | \`${record.runId}\` |
| Job ID | \`${record.jobId}\` |
| Status | ${record.status.toUpperCase()} |
| Started | ${record.startedAt} |
| Duration | ${(record.totalDurationMs / 1000).toFixed(1)}s |
| Shadow Mode | ${record.shadowMode ? 'Yes' : 'No'} |
| Persisted | ${this.persisted ? 'Yes (data/marketing-runs)' : 'No (/tmp — will be lost on restart)'} |

## Job Input

- Job ID: \`${record.jobId}\`
- Idempotency Key: \`${record.idempotencyKey}\`

## Content Summary

*(Content generated during run — see JSON for full details)*

## SEO/GEO Scorecard

| Metric | Value |
|--------|-------|
| SEO Score | ${seoScore} |

${record.seoReadyScore?.blockers && record.seoReadyScore.blockers.length > 0
  ? `**Blockers:** ${record.seoReadyScore.blockers.join(', ')}`
  : '*No blockers*'}

## Platform Results

| Outcome | Platforms |
|---------|-----------|
| Succeeded | ${publishSucceeded} |
| Failed | ${publishFailed} |
| Manual Pack | ${record.publishSummary?.manualPackageGenerated ? 'Yes' : 'No'} |

## Steps

| Status | Step | Result | Duration |
|--------|------|--------|----------|
${stepLines}

## Errors & Retry

${record.steps.filter((s) => (s as Record<string, unknown>).status === 'failed').length > 0
  ? record.steps
      .filter((s) => (s as Record<string, unknown>).status === 'failed')
      .map((s) => `- **${(s as Record<string, unknown>).step}**: ${(s as Record<string, unknown>).errorMessage ?? 'Unknown error'}`)
      .join('\n')
  : '*No errors*'}

## Manual Pack Paths

${record.publishSummary?.manualPackageGenerated
  ? 'See JSON for manual pack output paths.'
  : '*No manual packs generated*'}

## Next Actions

${record.status === 'success'
  ? '- Review generated content\n- Approve or edit in CMS\n- Schedule publish'
  : record.status === 'degraded_success'
  ? '- Review warnings in SEO scorecard\n- Address blockers before publish\n- Generate manual packs for failed platforms'
  : record.status === 'manual_review'
  ? '- Complete human review for blocked steps\n- Re-run pipeline after approval'
  : '- Review errors\n- Fix blockers\n- Re-run pipeline'}

## Final Verdict

${finalVerdict}

---

*Generated by 荣旺营销 Pipeline v1 | Evidence ID: ${record.runId}*
`;
  }
}

// ─────────────────────────────────────────────
// Convenience functions
// ─────────────────────────────────────────────

/**
 * Log any object as evidence (JSON only)
 */
export function logEvidence(jobId: string, data: Record<string, unknown>): string {
  const logger = new EvidenceLogger(jobId);
  // Cast to RunRecord for logging (minimal fields)
  const record: RunRecord = {
    runId: `ev_${Date.now()}`,
    jobId,
    status: 'success',
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    totalDurationMs: 0,
    shadowMode: true,
    steps: [],
    evidenceDir: logger['evidenceDir'],
    idempotencyKey: jobId,
  } as unknown as RunRecord;
  // Use a simpler direct write for arbitrary evidence
  const path = join(logger['evidenceDir'] as string, `${new Date().toISOString().slice(0, 10)}-evidence-${jobId}.json`);
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
    return path;
  } catch (err) {
    console.error(`[EvidenceLogger] Failed to write evidence: ${err}`);
    return '';
  }
}
