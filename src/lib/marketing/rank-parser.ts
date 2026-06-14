/**
 * RankParser — Phase 6
 * Parse and normalize SEO rank data from heterogeneous data sources.
 *
 * Supported sources:
 * - GSC:    Google Search Console searchAnalytics/query
 * - SEMrush: phrase_organic CSV export
 * - Baidu:  placeholder (ziyuan.baidu.com API pending)
 * - Ahrefs: phrase_organic CSV export
 * - Raw:    { keyword, position, url, impressions?, clicks?, ctr? }
 *
 * Output: RankSnapshot (normalised, source-agnostic)
 */

import type { RankSnapshot, RankPosition } from './adapters/seo-snapshot';

// ── Source identifier ────────────────────────────────────────────────────────

export type RankSource = RankSnapshot['source'];

/** Raw input union — adapters decode their native format first */
export type RawRankData = GscRankData | SemrushRankData | BaiduRankData | AhrefsRankData | RawPosition[] | null;

export interface GscRankData {
  source: 'gsc';
  siteUrl: string;
  rows: GscRow[];
}

export interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SemrushRankData {
  source: 'semrush';
  domain: string;
  csvText: string;
}

export interface BaiduRankData {
  source: 'baidu';
  keyword: string;
  rankings: BaiduRow[];
}

export interface BaiduRow {
  rank: number;
  url: string;
  title: string;
  impressions?: number;
}

export interface AhrefsRankData {
  source: 'ahrefs';
  domain: string;
  csvText: string;
}

/** Plain positions array — for test fixtures and synthetic data */
export interface RawPosition {
  keyword: string;
  position: number;
  url: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
}

// ── Parser registry ─────────────────────────────────────────────────────────

type RankParserFn = (raw: RawRankData, capturedAt: string) => RankSnapshot;

const parsers: Partial<Record<RankSource, RankParserFn>> = {
  gsc: parseGsc,
  semrush: parseSemrush,
  baidu: parseBaidu,
  ahrefs: parseAhrefs,
  placeholder: parsePlaceholder,
};

/**
 * Main entry point.
 * Pass the decoded raw data + source tag from the adapter layer.
 * Returns a fully normalised RankSnapshot.
 */
export function parseRankData(
  raw: RawRankData,
  capturedAt: string
): RankSnapshot {
  if (!raw) return placeholderSnapshot('[unknown]', capturedAt);

  const source = getSource(raw);
  const parser = parsers[source];
  if (!parser) {
    console.warn(`[rank-parser] No parser for source "${source}", falling back to placeholder`);
    return placeholderSnapshot('[unknown]', capturedAt);
  }

  try {
    return parser(raw, capturedAt);
  } catch (err) {
    console.error(`[rank-parser] ${source} parse error: ${err}`);
    return placeholderSnapshot('[parse-error]', capturedAt);
  }
}

// ── Source detection ─────────────────────────────────────────────────────────

function getSource(raw: RawRankData): RankSource {
  if (!raw || typeof raw !== 'object') return 'placeholder';
  const obj = raw as unknown as Record<string, unknown>;
  if ('source' in obj && typeof obj.source === 'string') {
    return obj.source as RankSource;
  }
  return 'placeholder';
}

// ── GSC parser ───────────────────────────────────────────────────────────────

/**
 * Parse Google Search Console searchAnalytics/query response rows.
 * Input: { source:'gsc', siteUrl, rows: GscRow[] }
 */
export function parseGsc(raw: RawRankData, capturedAt: string): RankSnapshot {
  const data = raw as GscRankData;
  const siteUrl = data.siteUrl ?? 'https://rongwang.hk';

  const positions: RankPosition[] = (data.rows ?? []).map((row) => ({
    keyword: row.keys[0] ?? '',
    position: Math.round(row.position),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 10000) / 100,
    url: siteUrl,
  }));

  const totalClicks = sum(positions.map((p) => p.clicks ?? 0));
  const totalImpressions = sum(positions.map((p) => p.impressions ?? 0));
  const avgPosition =
    positions.length > 0
      ? Math.round(positions.reduce((s, p) => s + p.position, 0) / positions.length)
      : undefined;

  return {
    keyword: positions[0]?.keyword ?? '',
    capturedAt,
    source: 'gsc',
    positions,
    totalClicks,
    totalImpressions,
    avgPosition,
  };
}

// ── SEMrush parser ────────────────────────────────────────────────────────────

/**
 * Parse SEMrush phrase_organic CSV export.
 * Header row: Ph;Po;Nu;Pp;Pd;Tr;Tc (Phrase;Position;Number of results;SERP Features;Traffic %;Traffic)
 * Data rows start after header.
 *
 * Input: { source:'semrush', domain, csvText }
 */
export function parseSemrush(raw: RawRankData, capturedAt: string): RankSnapshot {
  const data = raw as SemrushRankData;
  const lines = (data.csvText ?? '').trim().split('\n');

  if (lines.length < 2) {
    return placeholderSnapshot('[no semrush data]', capturedAt);
  }

  // Skip header line
  const dataLines = lines.slice(1);
  const positions: RankPosition[] = dataLines
    .filter((line) => line.trim())
    .map((line) => {
      const cols = line.split(';');
      const [phrase, posStr, , url] = cols;
      return {
        keyword: phrase ?? '',
        position: parseInt(posStr ?? '999', 10) || 999,
        url: url ?? '',
      };
    });

  return {
    keyword: positions[0]?.keyword ?? '',
    capturedAt,
    source: 'semrush',
    positions,
  };
}

// ── Baidu parser ─────────────────────────────────────────────────────────────

/**
 * Parse Baidu rankings (placeholder pending real API).
 * Input: { source:'baidu', keyword, rankings: BaiduRow[] }
 */
export function parseBaidu(raw: RawRankData, capturedAt: string): RankSnapshot {
  const data = raw as BaiduRankData;

  const positions: RankPosition[] = (data.rankings ?? []).map((row) => ({
    keyword: data.keyword,
    position: row.rank,
    url: row.url,
    impressions: row.impressions,
  }));

  return {
    keyword: data.keyword,
    capturedAt,
    source: 'baidu',
    positions,
  };
}

// ── Ahrefs parser ────────────────────────────────────────────────────────────

/**
 * Parse Ahrefs phrase_organic CSV (similar to SEMrush).
 * Input: { source:'ahrefs', domain, csvText }
 */
export function parseAhrefs(raw: RawRankData, capturedAt: string): RankSnapshot {
  const data = raw as AhrefsRankData;
  const lines = (data.csvText ?? '').trim().split('\n');

  if (lines.length < 2) {
    return placeholderSnapshot('[no ahrefs data]', capturedAt);
  }

  // Ahrefs header: Keyword;Position;URL;Volume;CPC;Traffic;Traffic %
  const dataLines = lines.slice(1);
  const positions: RankPosition[] = dataLines
    .filter((line) => line.trim())
    .map((line) => {
      const cols = line.split(';');
      const [keyword, posStr, url, volumeStr] = cols;
      return {
        keyword: keyword ?? '',
        position: parseInt(posStr ?? '999', 10) || 999,
        url: url ?? '',
        impressions: parseInt(volumeStr ?? '0', 10) || 0,
      };
    });

  return {
    keyword: positions[0]?.keyword ?? '',
    capturedAt,
    source: 'ahrefs',
    positions,
  };
}

// ── Placeholder parser ───────────────────────────────────────────────────────

/**
 * Build a placeholder snapshot when no data source is available.
 */
export function parsePlaceholder(raw: RawRankData, capturedAt: string): RankSnapshot {
  // If raw is a plain positions array, try to normalise it
  if (Array.isArray(raw)) {
    return {
      keyword: (raw as RawPosition[])[0]?.keyword ?? '[unknown]',
      capturedAt,
      source: 'placeholder',
      positions: (raw as RawPosition[]).map((p) => ({
        keyword: p.keyword,
        position: p.position,
        url: p.url,
        impressions: p.impressions,
        clicks: p.clicks,
        ctr: p.ctr,
      })),
    };
  }
  return placeholderSnapshot('[no-source]', capturedAt);
}

function placeholderSnapshot(keyword: string, capturedAt: string): RankSnapshot {
  return {
    keyword,
    capturedAt,
    source: 'placeholder',
    positions: [],
  };
}

// ── Rank snapshot diff ───────────────────────────────────────────────────────

/**
 * Diff two snapshots of the same keyword.
 * Returns delta: improved / declined / new positions.
 */
export interface RankDelta {
  keyword: string;
  baseline: RankSnapshot;
  current: RankSnapshot;
  improved: RankPosition[];
  declined: RankPosition[];
  new: RankPosition[];
  dropped: RankPosition[];
}

export function diffRankSnapshots(baseline: RankSnapshot, current: RankSnapshot): RankDelta {
  const baselineMap = new Map(baseline.positions.map((p) => [p.url, p]));
  const currentMap = new Map(current.positions.map((p) => [p.url, p]));

  const improved: RankPosition[] = [];
  const declined: RankPosition[] = [];
  const newPositions: RankPosition[] = [];
  const dropped: RankPosition[] = [];

  for (const [url, currentPos] of Array.from(currentMap.entries())) {
    const baselinePos = baselineMap.get(url);
    if (!baselinePos) {
      newPositions.push(currentPos);
    } else if (currentPos.position < baselinePos.position) {
      improved.push({ ...currentPos, clicks: currentPos.clicks });
    } else if (currentPos.position > baselinePos.position) {
      declined.push({ ...currentPos, clicks: currentPos.clicks });
    }
  }

  for (const [url, baselinePos] of Array.from(baselineMap.entries())) {
    if (!currentMap.has(url)) {
      dropped.push(baselinePos);
    }
  }

  return {
    keyword: current.keyword,
    baseline,
    current,
    improved,
    declined,
    new: newPositions,
    dropped,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sum(nums: number[]): number {
  return nums.reduce((s, n) => s + n, 0);
}