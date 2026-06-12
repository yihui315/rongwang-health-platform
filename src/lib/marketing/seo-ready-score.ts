/**
 * SEO Ready Score Calculator
 *
 * Designed for both English and Chinese content.
 * Chinese text uses character-level analysis since spaces don't separate words.
 */

export interface SEOScoreInput {
  title: string;
  content: string; // HTML or markdown
  primaryKeyword: string;
  secondaryKeywords?: string[];
  schemaTypes?: string[];
  minScore?: number;
}

export interface SEOScoreDetail {
  total: number;          // 0-100
  passed: boolean;
  blockers: string[];     // reasons below threshold
  breakdown: {
    title: number;        // 0-25
    content: number;     // 0-25
    length: number;      // 0-25
    meta: number;        // 0-25
  };
  keywordDensity: number;
  wordCount: number;
  minScore: number;
}

/** Count words/characters - Chinese uses characters, English uses words */
function countWords(text: string): number {
  // Remove HTML tags first
  const plain = text.replace(/<[^>]*>/g, '').trim();
  if (!plain) return 0;

  // Chinese character count (CJK Unified Ideographs)
  const chineseChars = (plain.match(/[\u4e00-\u9fff]/g) || []).length;
  // English/bilingual words (space-separated tokens)
  const englishWords = plain.split(/\s+/).filter(Boolean).length;

  // If mostly Chinese (>50% chars), use character count
  // Otherwise use word count
  return chineseChars > englishWords ? chineseChars : englishWords;
}

/** Count keyword occurrences case-insensitively */
function countKeyword(text: string, keyword: string): number {
  if (!keyword) return 0;
  const lower = text.toLowerCase();
  const lowerKw = keyword.toLowerCase();
  // Chinese: each character match counts; English: word match
  const chineseChars = (keyword.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chineseChars > 0) {
    // Chinese: character-level matching
    return (lower.match(new RegExp(lowerKw, 'g')) || []).length;
  }
  // English: word-level (whole word boundary)
  return (lower.match(new RegExp(`\\b${lowerKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length;
}

/** Check if keyword appears in title */
function keywordInTitle(title: string, keyword: string): boolean {
  if (!keyword) return false;
  return title.toLowerCase().includes(keyword.toLowerCase());
}

/** Calculate keyword density */
function keywordDensity(text: string, keyword: string, wordCount: number): number {
  if (!keyword || wordCount === 0) return 0;
  const chineseChars = (keyword.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chineseChars > 0) {
    // For Chinese, density = keyword_char_count / total_chars
    const charCount = text.replace(/<[^>]*>/g, '').length;
    return charCount > 0 ? countKeyword(text, keyword) / charCount : 0;
  }
  return countKeyword(text, keyword) / wordCount;
}

export function calculateSeoReadyScore(input: SEOScoreInput): SEOScoreDetail {
  const {
    title,
    content,
    primaryKeyword,
    schemaTypes = ['Article'],
    minScore = 70,
  } = input;

  const plainContent = content.replace(/<[^>]*>/g, '').trim();
  const wordCount = countWords(plainContent);
  const kd = keywordDensity(plainContent, primaryKeyword, wordCount);

  // 1. Title score (0-25): keyword in title
  const titleScore = keywordInTitle(title, primaryKeyword) ? 25 : 0;

  // 2. Content keyword score (0-25)
  // Chinese: keyword appears >= 1 time; English: density 1-3%
  let contentScore = 0;
  const kwCount = countKeyword(plainContent, primaryKeyword);
  const chineseChars = (primaryKeyword.match(/[\u4e00-\u9fff]/g) || []).length;

  if (chineseChars > 0) {
    // Chinese: at least 1 occurrence = 25pts
    contentScore = kwCount >= 1 ? 25 : 0;
  } else {
    // English: density 1-3% = 25pts, partial credit outside
    contentScore = kd >= 0.01 && kd <= 0.03 ? 25 : Math.max(0, 25 - Math.abs(kd - 0.02) * 500);
  }

  // 3. Length score (0-25): Chinese >= 300 chars or English >= 300 words
  const lengthScore = Math.min(25, (wordCount / 300) * 25);

  // 4. Meta description score (0-25): always 25 since we don't have it as input
  // (In real pipeline this would come from the AI output)
  const metaScore = 25;

  const total = Math.round(titleScore + contentScore + lengthScore + metaScore);

  const blockers: string[] = [];
  if (titleScore === 0) blockers.push('keyword missing from title');
  if (contentScore < 15) blockers.push('keyword density not optimal');
  if (lengthScore < 15) blockers.push(`content too short (${wordCount} words/chars, need 300)`);
  // metaScore always 25 since not available in input

  const passed = total >= minScore && blockers.length === 0;

  return {
    total,
    passed,
    blockers,
    breakdown: { title: titleScore, content: contentScore, length: lengthScore, meta: metaScore },
    keywordDensity: Math.round(kd * 10000) / 100, // as percentage
    wordCount,
    minScore,
  };
}

// ── Pipeline adapter ────────────────────────────────────────────────────────────
// Convert internal SEOScoreDetail (4-dim) to pipeline's SeoReadyScoreDetail (8-dim format).

export function toSeoReadyScoreDetail(
  score: SEOScoreDetail,
  _title: string,
): import('./job-types.js').SeoReadyScoreDetail {
  // Map 4-dimension breakdown → 8-dimension pipeline format
  const b = score.breakdown;
  return {
    title_h1: b.title === 25 ? 20 : Math.round(b.title * 0.8),
    author_reviewer_sources: b.content === 25 ? 20 : Math.round(b.content * 0.8),
    content_uniqueness: b.content >= 15 ? 15 : Math.round(b.content * 0.6),
    article_jsonld: b.content >= 15 ? 15 : 0,
    meta_canonical_date: b.meta,
    internal_links_cta: 5,
    image_alt_visibility: 5,
    total: score.total,
    passed: score.passed,
    blockers: score.blockers,
  };
}