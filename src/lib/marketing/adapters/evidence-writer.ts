/**
 * Evidence Writer
 * 将 Pipeline 运行证据写入磁盘（run.json + events.jsonl + per-step outputs）
 *
 * 证据目录结构：
 * /tmp/marketing-pipeline/evidence/
 *   <job_id>/
 *     events.jsonl          ← 所有 run 共享的事件日志
 *     <run_id>/
 *       run.json            ← RunRecord（流水线执行记录）
 *       article.md          ← 生成的文章内容
 *       seo-report.json     ← SEO/GEO Ready Score 报告
 *       publish-summary.json← 发布摘要
 *       baseline-snapshot.json ← 排名快照
 */

import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from 'fs';
import { join } from 'path';
import type { RunRecord, EventLogEntry, ManualReviewPackage } from '../job-types';

const EVIDENCE_BASE = '/tmp/marketing-pipeline/evidence';

export function ensureEvidenceDir(jobId: string, runId: string): string {
  const dir = join(EVIDENCE_BASE, jobId, runId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function ensureJobEvidenceDir(jobId: string): string {
  const dir = join(EVIDENCE_BASE, jobId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function writeRunRecord(record: RunRecord): string {
  const dir = ensureEvidenceDir(record.jobId, record.runId);
  const path = join(dir, 'run.json');
  writeFileSync(path, JSON.stringify(record, null, 2), 'utf-8');
  return path;
}

export function appendEventLog(runId: string, jobId: string, event: EventLogEntry): string {
  const dir = ensureJobEvidenceDir(jobId);
  const path = join(dir, 'events.jsonl');
  appendFileSync(path, JSON.stringify(event) + '\n', 'utf-8');
  return path;
}

export function readRunRecord(jobId: string, runId: string): RunRecord | null {
  const path = join(EVIDENCE_BASE, jobId, runId, 'run.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as RunRecord;
  } catch {
    return null;
  }
}

export function readEventsLog(jobId: string, limit = 100): EventLogEntry[] {
  const path = join(EVIDENCE_BASE, jobId, 'events.jsonl');
  if (!existsSync(path)) return [];
  try {
    const lines = readFileSync(path, 'utf-8').trim().split('\n').slice(-limit);
    return lines.map((line) => JSON.parse(line) as EventLogEntry);
  } catch {
    return [];
  }
}

export function readManualReviewQueue(): ManualReviewPackage[] {
  const path = join(EVIDENCE_BASE, 'manual-review-queue.json');
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as ManualReviewPackage[];
  } catch {
    return [];
  }
}

export function removeFromReviewQueue(jobId: string, runId: string): void {
  const queue = readManualReviewQueue();
  const filtered = queue.filter((item) => !(item.jobId === jobId && item.runId === runId));
  const path = join(EVIDENCE_BASE, 'manual-review-queue.json');
  writeFileSync(path, JSON.stringify(filtered, null, 2), 'utf-8');
}

export function getEvidenceDir(jobId: string, runId: string): string {
  return join(EVIDENCE_BASE, jobId, runId);
}

export { EVIDENCE_BASE };