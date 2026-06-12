/**
 * SEO Rank 快照 Adapter
 * 定期抓取关键词排名快照，用于衡量内容分发效果
 *
 * 数据源优先级：
 * 1. Google Search Console API (如有 GSC 权限)
 * 2. 百度站长平台 API (如有权限)
 * 3. 第三方 Rank API (SEMrush / Ahrefs / 站长工具)
 * 4. 模拟快照（无数据源时，返回占位数据 + warn）
 */

export interface RankSnapshot {
  keyword: string;
  capturedAt: string;
  source: 'gsc' | 'baidu' | 'semrush' | 'ahrefs' | 'placeholder';
  positions: RankPosition[];
  totalImpressions?: number;
  totalClicks?: number;
  avgPosition?: number;
}

export interface RankPosition {
  url: string;
  keyword: string;
  position: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
}

export interface SnapshotSeoRankResult {
  keyword: string;
  snapshotAt: string;
  rankData: RankSnapshot;
}

/**
 * 抓取关键词排名快照
 * @param keyword 目标关键词
 * @param timeoutSeconds API 超时时间
 */
export async function snapshotSeoRank(
  keyword: string,
  timeoutSeconds = 60
): Promise<RankSnapshot> {
  const capturedAt = new Date().toISOString();

  // Try GSC first
  if (process.env.GOOGLE_SEARCH_CONSOLE_API_KEY) {
    try {
      return await snapshotFromGsc(keyword, capturedAt, timeoutSeconds);
    } catch (err) {
      console.warn(`[seo-snapshot] GSC failed, falling back: ${err}`);
    }
  }

  // Try Baidu
  if (process.env.BAIDU_SITE_API_TOKEN) {
    try {
      return await snapshotFromBaidu(keyword, capturedAt, timeoutSeconds);
    } catch (err) {
      console.warn(`[seo-snapshot] Baidu failed, falling back: ${err}`);
    }
  }

  // Try SEMrush
  if (process.env.SEMRUSH_API_KEY) {
    try {
      return await snapshotFromSemrush(keyword, capturedAt);
    } catch (err) {
      console.warn(`[seo-snapshot] SEMrush failed: ${err}`);
    }
  }

  // Fallback: placeholder snapshot
  return placeholderSnapshot(keyword, capturedAt);
}

async function snapshotFromGsc(
  keyword: string,
  capturedAt: string,
  timeoutSeconds: number
): Promise<RankSnapshot> {
  const siteUrl = process.env.GSC_SITE_URL ?? 'https://rongwang.hk';
  const apiKey = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY!;

  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate: getDateNDaysAgo(30),
      endDate: getDateNDaysAgo(1),
      dimensions: ['query'],
      dimensionFilterGroups: [{
        filters: [{
          dimension: 'query',
          operator: 'contains',
          expression: keyword,
        }],
      }],
      rowLimit: 10,
    }),
  });

  if (!response.ok) {
    throw new Error(`GSC API ${response.status}`);
  }

  const data = await response.json() as {
    rows?: Array<{
      keys: string[];
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  };

  const positions: RankPosition[] = (data.rows ?? []).map((row) => ({
    keyword: row.keys[0],
    position: Math.round(row.position),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 10000) / 100,
    url: siteUrl, // GSC doesn't return URL per row without page dimension
  }));

  const totalClicks = positions.reduce((s, p) => s + (p.clicks ?? 0), 0);
  const totalImpressions = positions.reduce((s, p) => s + (p.impressions ?? 0), 0);
  const avgPosition = positions.length > 0
    ? Math.round(positions.reduce((s, p) => s + p.position, 0) / positions.length)
    : undefined;

  return {
    keyword,
    capturedAt,
    source: 'gsc',
    positions,
    totalClicks,
    totalImpressions,
    avgPosition,
  };
}

async function snapshotFromBaidu(
  keyword: string,
  capturedAt: string,
  timeoutSeconds: number
): Promise<RankSnapshot> {
  // Placeholder: 百度站长平台 API 集成需要 token 和站点验证
  // Real implementation would call https://ziyuan.baidu.com/api
  console.warn('[seo-snapshot] Baidu API integration pending');
  return placeholderSnapshot(keyword, capturedAt);
}

async function snapshotFromSemrush(
  keyword: string,
  capturedAt: string
): Promise<RankSnapshot> {
  const apiKey = process.env.SEMRUSH_API_KEY!;
  const domain = process.env.SEMRUSH_DOMAIN ?? 'rongwang.hk';

  const url = `https://api.semrush.com/?type=phrase_organic&key=${apiKey}&phrase=${encodeURIComponent(keyword)}&database=cn&export_columns=Ph,Po,Nu,Pp,Pd,Tr,Tc&domain=${domain}&display_limit=10`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`SEMrush API ${response.status}`);

  const text = await response.text();
  const lines = text.trim().split('\n');

  if (lines.length < 2) return placeholderSnapshot(keyword, capturedAt);

  const positions: RankPosition[] = lines.slice(1).map((line) => {
    const [phrase, pos, _, url] = line.split(';');
    return {
      keyword: phrase,
      position: parseInt(pos, 10) || 999,
      url: url ?? '',
    };
  });

  return {
    keyword,
    capturedAt,
    source: 'semrush',
    positions,
  };
}

function placeholderSnapshot(keyword: string, capturedAt: string): RankSnapshot {
  console.warn(`[seo-snapshot] No SEO data source configured for "${keyword}" - using placeholder`);
  return {
    keyword,
    capturedAt,
    source: 'placeholder',
    positions: [],
  };
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}