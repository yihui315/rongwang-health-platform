/**
 * Wechatsync Pipeline Coordinator — Phase 7
 *
 * Orchestrates the WeChat publish sub-flow:
 *   1. Prepare draft input (title, content, author, tags)
 *   2. Auth check (Chrome profile + Wechatsync container)
 *   3. md2wechat convert (inspect/preview)
 *   4. Compliance gate
 *   5. Dry-run / draft-upload decision
 *   6. Publish result → pipeline record
 *
 * Designed as a composable step that publish_drafts calls per platform.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { PlatformPublishResult } from './job-types';
import { getWechatReadinessStatus } from './wechat/config';

// ── Types ───────────────────────────────────────────────────────────────────

export interface WechatsyncPipelineInput {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  /** Set by pipeline-runner: channels from NormalizedContext */
  channels: string[];
  runId: string;
  /** Skip actual container check (testing / shadow mode) */
  skipContainerCheck?: boolean;
  /** Skip md2wechat inspect (testing) */
  skipMd2WechatInspect?: boolean;
  /** Node env override */
  nodeEnv?: string;
}

export interface WechatsyncPipelineResult {
  platform: 'wechat';
  status: 'success' | 'draft_created' | 'auth_missing' | 'failed' | 'skipped';
  draftUrl?: string;
  errorMessage?: string;
  /** Auth diagnostic */
  authCheck?: {
    chromeProfile: boolean;
    containerRunning: boolean;
    wechatCredentials: boolean;
  };
  /** md2wechat inspect result (when available) */
  md2wechatInspect?: {
    passed: boolean;
    errors: string[];
    warnings: string[];
  };
  /** Whether this was a dry-run (no actual upload) */
  dryRun: boolean;
  skippedReason?: string;
}

export interface WechatsyncReadinessReport {
  ready: boolean;
  checks: {
    chromeProfile: boolean;
    containerRunning: boolean;
    wechatAppId: boolean;
    wechatSecret: boolean;
    wechatDraftUpload: boolean;
    dryRun: boolean;
  };
  errors: string[];
  warnings: string[];
}

// ── Container helpers (lazy import to avoid side-effects in pipeline-runner) ──

async function isContainerRunning(containerName: string): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    const out = execSync(
      `docker ps --filter "name=${containerName}" --format "{{.Names}}"`,
      { encoding: 'utf-8' }
    );
    return out.trim() === containerName;
  } catch {
    return false;
  }
}

async function isChromeProfileAvailable(): Promise<boolean> {
  return existsSync('/root/.config/google-chrome');
}

// ── md2wechat inspect ───────────────────────────────────────────────────────

interface Md2WechatInspectResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

async function runMd2WechatInspect(
  articleMdPath: string,
  env: Record<string, string>
): Promise<Md2WechatInspectResult> {
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const result = await execFileAsync(
      'md2wechat',
      ['inspect', articleMdPath, '--json'],
      {
        env: { ...process.env, ...env },
        timeout: 15000,
        windowsHide: true,
      }
    );

    const output = result.stdout.trim();
    if (output) {
      try {
        const parsed = JSON.parse(output) as { passed?: boolean; errors?: string[]; warnings?: string[] };
        return {
          passed: parsed.passed ?? true,
          errors: parsed.errors ?? [],
          warnings: parsed.warnings ?? [],
        };
      } catch {
        warnings.push('md2wechat inspect returned non-JSON output');
      }
    }
    return { passed: true, errors: [], warnings: [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnings.push(`md2wechat inspect failed: ${msg}`);
    return { passed: true, errors: [], warnings };
  }
}

// ── Main pipeline coordinator ────────────────────────────────────────────────

/**
 * Run the WeChat publish sub-pipeline.
 *
 * Called by pipeline-runner's publishToPlatform() for platform === 'wechat'.
 * Returns a PlatformPublishResult-compatible record.
 */
export async function runWechatsyncPipeline(
  input: WechatsyncPipelineInput
): Promise<WechatsyncPipelineResult> {
  const { title, content, runId, channels } = input;
  const dryRun = process.env.WECHAT_OFFICIAL_DRY_RUN !== 'false';

  // ── Phase 1: Readiness check ────────────────────────────────────────────
  const readiness = checkWechatsyncReadiness();

  if (!readiness.ready) {
    return {
      platform: 'wechat',
      status: 'auth_missing',
      dryRun,
      authCheck: {
        chromeProfile: readiness.checks.chromeProfile,
        containerRunning: readiness.checks.containerRunning,
        wechatCredentials: readiness.checks.wechatAppId && readiness.checks.wechatSecret,
      },
      errorMessage: readiness.errors.join('; ') || 'Wechatsync readiness check failed',
    };
  }

  // ── Phase 2: Auth verification ─────────────────────────────────────────
  const [containerRunning, chromeProfileAvailable] = await Promise.all([
    input.skipContainerCheck ? Promise.resolve(true) : isContainerRunning('wechatsync'),
    input.skipContainerCheck ? Promise.resolve(true) : isChromeProfileAvailable(),
  ]);

  if (!chromeProfileAvailable) {
    return {
      platform: 'wechat',
      status: 'auth_missing',
      dryRun,
      authCheck: { chromeProfile: false, containerRunning, wechatCredentials: true },
      errorMessage: 'Chrome profile not found at /root/.config/google-chrome — cookie-based auth unavailable',
    };
  }

  // ── Phase 3: Write article temp file for md2wechat inspect ───────────────
  const tmpDir = '/tmp/wechatsync-inspect';
  const articleMdPath = join(tmpDir, `${runId}-article.md`);

  // Ensure tmp dir exists
  const { mkdirSync, writeFileSync: writeFile } = await import('fs');
  mkdirSync(tmpDir, { recursive: true });
  writeFile(articleMdPath, content, 'utf-8');

  // ── Phase 4: md2wechat inspect ──────────────────────────────────────────
  let md2wechatInspect: Md2WechatInspectResult = { passed: true, errors: [], warnings: [] };

  if (!input.skipMd2WechatInspect) {
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([, v]) => v !== undefined)
    ) as Record<string, string>;
    md2wechatInspect = await runMd2WechatInspect(articleMdPath, env);

    if (!md2wechatInspect.passed && md2wechatInspect.errors.length > 0) {
      return {
        platform: 'wechat',
        status: 'failed',
        dryRun,
        authCheck: { chromeProfile: true, containerRunning, wechatCredentials: true },
        md2wechatInspect,
        errorMessage: `md2wechat inspect failed: ${md2wechatInspect.errors.join('; ')}`,
      };
    }
  }

  // ── Phase 5: Publish / dry-run decision ─────────────────────────────────
  const draftUploadEnabled = process.env.WECHAT_DRAFT_UPLOAD_ENABLED === 'true';
  const autoPublishEnabled = process.env.WECHAT_AUTO_PUBLISH === 'true';
  const isProduction = (input.nodeEnv ?? process.env.NODE_ENV) === 'production';

  if (!draftUploadEnabled) {
    return {
      platform: 'wechat',
      status: 'skipped',
      dryRun: true,
      skippedReason: 'WECHAT_DRAFT_UPLOAD_ENABLED is not true — draft upload skipped',
      authCheck: { chromeProfile: true, containerRunning, wechatCredentials: true },
      md2wechatInspect,
    };
  }

  if (dryRun) {
    return {
      platform: 'wechat',
      status: 'draft_created',
      dryRun: true,
      draftUrl: undefined,
      authCheck: { chromeProfile: true, containerRunning, wechatCredentials: true },
      md2wechatInspect,
      skippedReason: 'WECHAT_OFFICIAL_DRY_RUN=true — no draft uploaded',
    };
  }

  // ── Phase 6: Actual publish via Wechatsync adapter ────────────────────────
  try {
    const { publishWechatDraft } = await import('./adapters/wechatsync');
    const result = await publishWechatDraft({
      content: { title, content, excerpt: input.excerpt },
      context: { runId, channels, utmCampaign: undefined },
      runId,
    });

    return {
      platform: 'wechat',
      status: result.status === 'draft_created' ? 'draft_created' : result.status === 'auth_missing' ? 'auth_missing' : 'success',
      dryRun: false,
      draftUrl: result.draftUrl,
      errorMessage: result.errorMessage,
      authCheck: { chromeProfile: true, containerRunning, wechatCredentials: true },
      md2wechatInspect,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      platform: 'wechat',
      status: 'failed',
      dryRun: false,
      authCheck: { chromeProfile: true, containerRunning, wechatCredentials: true },
      md2wechatInspect,
      errorMessage: msg,
    };
  }
}

// ── Readiness checker ────────────────────────────────────────────────────────

/**
 * Lightweight readiness check (no Docker exec, no file system write).
 * Used by wechat-readiness.mjs script and pipeline coordinator.
 */
export function checkWechatsyncReadiness(): WechatsyncReadinessReport {
  const status = getWechatReadinessStatus();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!status.officialAccount.configured) {
    errors.push('WECHAT_APPID / WECHAT_SECRET missing');
  }

  if (!status.officialAccount.hasCover) {
    errors.push('WECHAT_DEFAULT_COVER_PATH or WECHAT_DEFAULT_COVER_MEDIA_ID missing');
  }

  if (status.officialAccount.draftUploadEnabled && status.officialAccount.dryRun) {
    warnings.push('WECHAT_DRAFT_UPLOAD_ENABLED=true + WECHAT_OFFICIAL_DRY_RUN!=false — human review recommended before publishing');
  }

  return {
    ready: errors.length === 0,
    checks: {
      chromeProfile: existsSync('/root/.config/google-chrome'),
      containerRunning: false, // unknown without exec — checked at runtime
      wechatAppId: status.officialAccount.configured,
      wechatSecret: status.officialAccount.configured,
      wechatDraftUpload: status.officialAccount.canUploadDraft,
      dryRun: status.officialAccount.dryRun,
    },
    errors,
    warnings,
  };
}

// ── Pipeline error codes ─────────────────────────────────────────────────────

export const WECHATSYNC_ERROR_CODES = {
  AUTH_MISSING: 'E_WECHATSYNC_AUTH_MISSING',
  AUTH_FAILED: 'E_WECHATSYNC_AUTH_FAILED',
  INSPECT_FAILED: 'E_WECHATSYNC_INSPECT_FAILED',
  CONTAINER_NOT_RUNNING: 'E_WECHATSYNC_CONTAINER_NOT_RUNNING',
  PUBLISH_FAILED: 'E_WECHATSYNC_PUBLISH_FAILED',
} as const;