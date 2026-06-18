/**
 * 荣旺营销 Pipeline v1 — RankParser Adapter
 *
 * 原则：RankParser永远不是阻塞项
 * - 成功 → 写入增强审计
 * - 超时(5s) → fallbackUsed=true, warning, 继续
 * - 空结果 → warning, 继续
 * - 报错 → warning, 继续
 * - 未配置 → skipped
 */

import { checkRateLimit } from '@/lib/health/rate-limit';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface RankParserResult {
  keyword: string;
  rank?: number;
  competitor?: string;
  serpFeatures?: string[];
  urlChecked?: string;
  found?: boolean;
  checkedAt: string;
  source: 'rankparser' | 'fallback' | 'skipped';
}

export interface RankParserConfig {
  apiUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface RankParserAdapter {
  check(keyword: string, url?: string): Promise<RankParserResult>;
}

// ─────────────────────────────────────────────
// Default implementation
// ─────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 5000;

export class RankParserAdapterImpl implements RankParserAdapter {
  private readonly apiUrl: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly timeoutMs: number;

  constructor(config?: RankParserConfig) {
    this.apiUrl = config?.apiUrl ?? process.env.RANKPARSER_API_URL;
    this.apiKey = config?.apiKey ?? process.env.RANKPARSER_API_KEY;
    this.timeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async check(keyword: string, url?: string): Promise<RankParserResult> {
    const startedAt = Date.now();

    // Check if configured
    if (!this.apiUrl) {
      console.log(`[RankParser] Not configured (RANKPARSER_API_URL not set), skipping`);
      return {
        keyword,
        checkedAt: new Date().toISOString(),
        source: 'skipped',
      };
    }

    // Rate limit check
    const rate = await checkRateLimit('rankparser:check', 30, 60000);
    if (!rate.allowed) {
      console.warn(`[RankParser] Rate limited, skipping`);
      return {
        keyword,
        checkedAt: new Date().toISOString(),
        source: 'skipped',
      };
    }

    // Build request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ keyword, url }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`[RankParser] HTTP ${response.status} for keyword "${keyword}"`);
        return {
          keyword,
          urlChecked: url,
          checkedAt: new Date().toISOString(),
          source: 'fallback',
        };
      }

      const data = (await response.json()) as Record<string, unknown>;

      // Parse response
      const rank = typeof data.rank === 'number' ? data.rank : undefined;
      const competitor = typeof data.competitor === 'string' ? data.competitor : undefined;
      const serpFeatures = Array.isArray(data.serpFeatures) ? data.serpFeatures as string[] : undefined;

      const elapsed = Date.now() - startedAt;
      console.log(`[RankParser] Checked "${keyword}": rank=${rank ?? 'N/A'} (${elapsed}ms)`);

      return {
        keyword,
        rank,
        competitor,
        serpFeatures,
        urlChecked: url,
        found: rank !== undefined && rank > 0,
        checkedAt: new Date().toISOString(),
        source: 'rankparser',
      };
    } catch (err) {
      clearTimeout(timeout);

      if (err instanceof Error && err.name === 'AbortError') {
        console.warn(`[RankParser] Timeout after ${this.timeoutMs}ms for keyword "${keyword}", falling back to local SEO`);
        return {
          keyword,
          urlChecked: url,
          checkedAt: new Date().toISOString(),
          source: 'fallback',
        };
      }

      console.warn(`[RankParser] Error checking "${keyword}": ${err}, falling back to local SEO`);
      return {
        keyword,
        urlChecked: url,
        checkedAt: new Date().toISOString(),
        source: 'fallback',
      };
    }
  }
}

// ─────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────

let _adapterInstance: RankParserAdapter | null = null;

export function getRankParserAdapter(): RankParserAdapter {
  if (!_adapterInstance) {
    _adapterInstance = new RankParserAdapterImpl();
  }
  return _adapterInstance;
}
