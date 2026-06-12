/**
 * Wechatsync Docker Adapter
 * 将文章草稿发布到微信公众号（通过本地 Wechatsync Docker 容器）
 *
 * 设计：
 * - draft-only 模式：创建草稿，不自动发布
 * - Cookie 持久化：挂载本地 Chrome 配置到容器
 * - Auth 检测：检查 cookie 是否有效
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface WechatsyncDraftInput {
  title: string;
  content: string;
  author?: string;
  tags?: string[];
}

export interface WechatsyncContext {
  runId: string;
  cookiePath: string;
  chromeProfilePath: string;
}

export interface WechatsyncPublishResult {
  status: 'success' | 'draft_created' | 'auth_missing' | 'failed';
  draftUrl?: string;
  errorMessage?: string;
}

const WECHATSYNC_CONTAINER_NAME = 'wechatsync';
const WECHATSYNC_IMAGE = 'jkshop/wechatsync:latest';
const COOKIE_MOUNT_PATH = '/root/.config/google-chrome';

/**
 * 检查 Wechatsync Docker 容器是否在运行
 */
export async function isWechatsyncRunning(): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    const out = execSync(`docker ps --filter "name=${WECHATSYNC_CONTAINER_NAME}" --format "{{.Names}}"`, {
      encoding: 'utf-8',
    });
    return out.trim() === WECHATSYNC_CONTAINER_NAME;
  } catch {
    return false;
  }
}

/**
 * 启动 Wechatsync 容器（如果未运行）
 * 挂载本地 Chrome profile 以保留登录态
 */
export async function ensureWechatsyncRunning(): Promise<void> {
  if (await isWechatsyncRunning()) return;

  const { execSync } = await import('child_process');
  try {
    execSync(
      `docker run -d --name ${WECHATSYNC_CONTAINER_NAME} ` +
      `-p 3456:3456 ` +
      `-v ${COOKIE_MOUNT_PATH}:/root/.config/google-chrome:ro ` +
      `-v /tmp/wechatsync-output:/output ` +
      `--restart unless-stopped ` +
      `${WECHATSYNC_IMAGE}`,
      { encoding: 'utf-8' }
    );
    console.log('[Wechatsync] Container started with Chrome profile mounted');
  } catch (err) {
    throw new Error(`Failed to start Wechatsync container: ${err}`);
  }
}

/**
 * 检查 Chrome profile 是否存在（cookie 持久化的前提）
 */
export function isChromeProfileAvailable(): boolean {
  return existsSync(COOKIE_MOUNT_PATH);
}

/**
 * 发布微信文章草稿
 * 通过 Wechatsync API 或 CLI
 */
export async function publishWechatDraft(input: {
  content: { title: string; content: string; excerpt?: string };
  context: { runId: string; channels: string[]; utmCampaign?: string };
  runId: string;
}): Promise<{ platform: 'wechat'; status: 'success' | 'draft_created' | 'auth_missing' | 'failed'; draftUrl?: string; errorMessage?: string }> {
  const { content, context: ctx, runId: _runId } = input;

  // Check if wechatsync is configured
  const featureEnabled = process.env.FEATURE_WECHATSYNC_ENABLED === 'true';
  if (!featureEnabled) {
    return { platform: 'wechat', status: 'failed', errorMessage: 'Wechatsync not enabled (FEATURE_WECHATSYNC_ENABLED=false)' };
  }

  if (!isChromeProfileAvailable()) {
    return {
      platform: 'wechat',
      status: 'auth_missing',
      errorMessage: `Chrome profile not found at ${COOKIE_MOUNT_PATH}. Run: wechatsync-setup to configure.`,
    };
  }

  try {
    await ensureWechatsyncRunning();

    // Build Wechatsync task payload
    const payload = {
      action: 'createDraft',
      platform: 'wechat',
      title: content.title,
      content: content.content,
      author: process.env.WECHATSYNC_AUTHOR ?? '荣旺健康AI',
      tags: ['AI健康', '健康教育'],
      draft: true,
    };

    // Call Wechatsync local API
    const response = await fetch('http://localhost:3456/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) {
        return { platform: 'wechat', status: 'auth_missing', errorMessage: 'Wechatsync auth failed - re-login required' };
      }
      throw new Error(`Wechatsync API error ${response.status}: ${body}`);
    }

    const result = await response.json() as { url?: string; draftUrl?: string; success: boolean };

    return {
      platform: 'wechat',
      status: result.url || result.draftUrl ? 'draft_created' : 'success',
      draftUrl: result.url ?? result.draftUrl,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth') || msg.includes('cookie') || msg.includes('login')) {
      return { platform: 'wechat', status: 'auth_missing', errorMessage: msg };
    }
    return { platform: 'wechat', status: 'failed', errorMessage: msg };
  }
}

/**
 * Docker Compose 配置片段（供 docker-compose.yml 参考）
 */
export const WECHATSYNC_DOCKER_COMPOSE = `
  wechatsync:
    image: jkshop/wechatsync:latest
    container_name: wechatsync
    ports:
      - "3456:3456"
    volumes:
      - /root/.config/google-chrome:/root/.config/google-chrome:ro   # Cookie 持久化
      - /tmp/wechatsync-output:/output
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3456/health"]
      interval: 30s
      timeout: 10s
      retries: 3
`;