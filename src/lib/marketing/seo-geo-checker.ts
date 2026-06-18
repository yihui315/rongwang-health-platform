/**
 * 荣旺营销 Pipeline v1 — SEO/GEO Checker
 * 本地内容质量评分 + 合规检查（不依赖外部API）
 *
 * 检查项（12项）:
 * 1. title_contains_keyword - title是否包含targetKeyword
 * 2. meta_title_exists - metaTitle是否存在
 * 3. meta_description_exists - metaDescription是否存在
 * 4. has_h_structure - 是否有H1/H2结构
 * 5. has_faq - 是否有FAQ
 * 6. has_cta - 是否有CTA
 * 7. has_brand_mention - 是否提到荣旺/Rongwang
 * 8. has_ai_health_check_cta - 是否有AI健康自测入口
 * 9. has_medical_disclaimer - 是否有医疗免责声明
 * 10. no_medical_exaggeration - 是否避免医疗夸大词
 * 11. ai_summary_ready - 是否适合AI摘要引用
 * 12. entity_clarity - 是否有清晰实体信息
 *
 * 评分标准:
 * 90-100: 可发布
 * 75-89:  可草稿发布，需人工检查
 * 60-74:  只生成手动发布包
 * <60:    禁止进入发布步骤
 */

import { evaluateMarketingCompliance } from './automation';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface SeoGeoCheckItem {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  weight: number; // 0-10, contributes to score
}

export interface SeoGeoReport {
  passed: boolean;
  score: number; // 0-100
  grade: 'publishable' | 'draft_only' | 'manual_pack' | 'blocked';
  checks: SeoGeoCheckItem[];
  fallbackUsed: boolean;
  warnings: string[];
  blockers: string[];
}

export interface SeoGeoInput {
  title: string;
  bodyMarkdown: string;
  targetKeyword: string;
  metaTitle?: string;
  metaDescription?: string;
  landingPageUrl?: string;
}

// ─────────────────────────────────────────────
// Medical exaggeration patterns (from automation.ts)
// ─────────────────────────────────────────────

const MEDICAL_EXAGGERATION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /治愈|根治|治疗|诊断|处方/, label: '诊断/治疗词汇' },
  { pattern: /100%|保证|一定|永久|彻底/, label: '绝对化承诺' },
  { pattern: /最有效|唯一|首选|零风险/, label: '最优化/极端化表达' },
  { pattern: /替代医生|替代药物|不用看医生/, label: '医疗替代建议' },
];

const BRAND_PATTERNS = [/荣旺|rongwang/i, /RongWang/i];

const HEALTH_CHECK_CTA_PATTERNS = [
  /AI健康自测|AI测评|健康自测|健康评估/,
  /开始测评|开始评估|立即自测/,
  /评估入口|测评链接/,
];

const DISCLAIMER_PATTERNS = [
  /本内容仅用于.*参考.*不构成.*建议/,
  /本内容.*健康教育.*不替代.*医生/,
  /如有.*请咨询.*专业医生/,
  /不代表.*诊断.*治疗.*处方/,
];

const AI_SUMMARY_PATTERNS = [
  /^\s*#{1,2}\s+.+/m,           // Has heading structure
  /^\s*[-*]\s+.+/m,             // Has list items
  /\d+[%℃％]/.test.bind(/\d+[%℃％]/), // Has data/numbers
];

// ─────────────────────────────────────────────
// Checker
// ─────────────────────────────────────────────

export function checkSeoGeo(input: SeoGeoInput): SeoGeoReport {
  const { title, bodyMarkdown, targetKeyword, metaTitle, metaDescription, landingPageUrl } = input;

  const checks: SeoGeoCheckItem[] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];

  // Strip markdown for plain text checks
  const plainBody = bodyMarkdown
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/`(.+?)`/g, '$1') // inline code
    .replace(/^\s*[-*+]\s+/gm, '') // list items
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .trim();

  // ── Check 1: title_contains_keyword ──────────────────────
  const titleKeywordPass = title.includes(targetKeyword) || targetKeyword.split(/\s+/)[0].length < 3;
  checks.push({
    id: 'title_contains_keyword',
    label: 'Title 包含目标关键词',
    status: titleKeywordPass ? 'pass' : 'fail',
    detail: titleKeywordPass
      ? `Title 包含关键词 "${targetKeyword}"`
      : `Title 不包含关键词 "${targetKeyword}"`,
    weight: 8,
  });
  if (!titleKeywordPass) blockers.push('title 不包含目标关键词');

  // ── Check 2: meta_title_exists ───────────────────────────
  const hasMetaTitle = Boolean(metaTitle && metaTitle.trim().length > 10);
  checks.push({
    id: 'meta_title_exists',
    label: 'Meta Title 存在',
    status: hasMetaTitle ? 'pass' : 'warn',
    detail: hasMetaTitle
      ? `Meta Title: "${(metaTitle ?? '').slice(0, 60)}"`
      : 'Meta Title 未提供，将使用 title',
    weight: 5,
  });
  if (!hasMetaTitle) warnings.push('建议提供 metaTitle');

  // ── Check 3: meta_description_exists ────────────────────
  const hasMetaDesc = Boolean(metaDescription && metaDescription.trim().length > 80);
  checks.push({
    id: 'meta_description_exists',
    label: 'Meta Description 存在',
    status: hasMetaDesc ? 'pass' : 'warn',
    detail: hasMetaDesc
      ? `Meta Description 已提供 (${(metaDescription ?? '').length}字符)`
      : 'Meta Description 未提供或过短',
    weight: 5,
  });
  if (!hasMetaDesc) warnings.push('建议提供有效的 metaDescription (80+字符)');

  // ── Check 4: has_h_structure ────────────────────────────
  const h1Matches = bodyMarkdown.match(/^#\s+(.+)/m);
  const h2Count = (bodyMarkdown.match(/^##\s+(.+)/gm) || []).length;
  const hasHStructure = Boolean(h1Matches && h2Count >= 2);
  checks.push({
    id: 'has_h_structure',
    label: 'H1/H2 结构完整',
    status: hasHStructure ? 'pass' : 'fail',
    detail: hasHStructure
      ? `H1: "${h1Matches?.[1]?.slice(0, 40)}", H2章节: ${h2Count}个`
      : `缺少H1或H2结构 (H2章节: ${h2Count})`,
    weight: 7,
  });
  if (!hasHStructure) blockers.push('内容缺少H1/H2结构');

  // ── Check 5: has_faq ────────────────────────────────────
  const hasFaq = /faq|常见问题|问：|答：|Q:|Q\./i.test(bodyMarkdown);
  checks.push({
    id: 'has_faq',
    label: 'FAQ 内容',
    status: hasFaq ? 'pass' : 'warn',
    detail: hasFaq ? '发现 FAQ/常见问题 内容' : '未发现 FAQ 内容',
    weight: 6,
  });
  if (!hasFaq) warnings.push('建议添加 FAQ 章节提升 SEO 效果');

  // ── Check 6: has_cta ────────────────────────────────────
  const hasCta = /CTA|行动呼吁|立即|点击|开始|立即获取|立即体验/i.test(bodyMarkdown);
  checks.push({
    id: 'has_cta',
    label: 'CTA 存在',
    status: hasCta ? 'pass' : 'warn',
    detail: hasCta ? '发现 CTA 引导语' : '未发现明确的 CTA',
    weight: 7,
  });
  if (!hasCta) warnings.push('建议添加明确的 CTA');

  // ── Check 7: has_brand_mention ─────────────────────────
  const brandMentions = BRAND_PATTERNS.flatMap((p) => bodyMarkdown.match(p) || []);
  const hasBrandMention = brandMentions.length >= 1;
  checks.push({
    id: 'has_brand_mention',
    label: '品牌提及',
    status: hasBrandMention ? 'pass' : 'warn',
    detail: hasBrandMention
      ? `荣旺/Rongwang 出现 ${brandMentions.length} 次`
      : '未发现品牌名称提及',
    weight: 5,
  });
  if (!hasBrandMention) warnings.push('建议提及品牌名称增强品牌识别');

  // ── Check 8: has_ai_health_check_cta ───────────────────
  const hasAiCta = HEALTH_CHECK_CTA_PATTERNS.some((p) => p.test(bodyMarkdown));
  checks.push({
    id: 'has_ai_health_check_cta',
    label: 'AI健康自测入口',
    status: hasAiCta ? 'pass' : 'warn',
    detail: hasAiCta
      ? '发现 AI健康自测/测评 CTA'
      : '未发现 AI健康自测入口',
    weight: 8,
  });
  if (!hasAiCta) warnings.push('建议添加 AI健康自测 入口引导');

  // ── Check 9: has_medical_disclaimer ───────────────────
  const hasDisclaimer = DISCLAIMER_PATTERNS.some((p) => p.test(bodyMarkdown));
  checks.push({
    id: 'has_medical_disclaimer',
    label: '医疗免责声明',
    status: hasDisclaimer ? 'pass' : 'fail',
    detail: hasDisclaimer
      ? '发现医疗健康声明'
      : '未发现医疗免责声明（必须添加！）',
    weight: 10,
  });
  if (!hasDisclaimer) blockers.push('缺少医疗免责声明');

  // ── Check 10: no_medical_exaggeration ─────────────────
  const complianceResult = evaluateMarketingCompliance(plainBody);
  const hasExaggeration = !complianceResult.approved;
  const exaggerationDetails = hasExaggeration
    ? complianceResult.warnings.slice(0, 3).join('; ')
    : '';
  checks.push({
    id: 'no_medical_exaggeration',
    label: '无医疗夸大表达',
    status: hasExaggeration ? 'fail' : 'pass',
    detail: hasExaggeration
      ? `发现违规表达: ${exaggerationDetails}`
      : '未发现医疗夸大/绝对化承诺',
    weight: 10,
  });
  if (hasExaggeration) {
    blockers.push(`合规警告: ${exaggerationDetails}`);
    warnings.push(...complianceResult.warnings);
  }

  // ── Check 11: ai_summary_ready ────────────────────────
  const hasHeadingStructure = /^#{1,2}\s+/m.test(bodyMarkdown);
  const hasListItems = /^[-*]\s+/m.test(bodyMarkdown) || /^\d+\.\s+/m.test(bodyMarkdown);
  const hasData = /\d+[%℃％%]/.test(bodyMarkdown);
  const aiSummaryScore = [hasHeadingStructure, hasListItems, hasData].filter(Boolean).length;
  const aiSummaryReady = aiSummaryScore >= 2;
  checks.push({
    id: 'ai_summary_ready',
    label: 'AI摘要引用就绪',
    status: aiSummaryReady ? 'pass' : 'warn',
    detail: aiSummaryReady
      ? `结构完整(标题:${hasHeadingStructure ? '✓' : '✗'} 列表:${hasListItems ? '✓' : '✗'} 数据:${hasData ? '✓' : '✗'})`
      : `内容结构较简单，AI摘要可能不完整`,
    weight: 6,
  });
  if (!aiSummaryReady) warnings.push('建议增加段落结构、列表或数据以提升AI摘要质量');

  // ── Check 12: entity_clarity ───────────────────────────
  const hasContact = /官网|商城|联系| Rongwang|rongwang\.hk/i.test(bodyMarkdown);
  const hasEntityClarity = Boolean(hasContact || landingPageUrl);
  checks.push({
    id: 'entity_clarity',
    label: '实体信息清晰',
    status: hasEntityClarity ? 'pass' : 'warn',
    detail: hasEntityClarity
      ? '内容包含联系方式或落地页链接'
      : '未发现明确的联系/落地信息',
    weight: 5,
  });
  if (!hasEntityClarity) warnings.push('建议添加官网或商城链接增强实体识别');

  // ── Calculate score ────────────────────────────────────
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earnedScore = checks.reduce((sum, c) => {
    if (c.status === 'pass') return sum + c.weight;
    if (c.status === 'warn') return sum + c.weight * 0.5;
    return sum;
  }, 0);
  const score = Math.round((earnedScore / totalWeight) * 100);

  // ── Determine grade ────────────────────────────────────
  let grade: SeoGeoReport['grade'];
  let passed: boolean;

  if (score >= 90) {
    grade = 'publishable';
    passed = true;
  } else if (score >= 75) {
    grade = 'draft_only';
    passed = true; // draft is allowed
  } else if (score >= 60) {
    grade = 'manual_pack';
    passed = false;
  } else {
    grade = 'blocked';
    passed = false;
  }

  // Critical blocker: medical exaggeration is always a hard block
  if (!hasDisclaimer || hasExaggeration) {
    passed = false;
  }

  return {
    passed,
    score,
    grade,
    checks,
    fallbackUsed: false, // This checker always uses local logic, never falls back
    warnings,
    blockers,
  };
}

// ─────────────────────────────────────────────
// Quick check function
// ─────────────────────────────────────────────

export function quickSeoScore(title: string, body: string, keyword: string): number {
  const report = checkSeoGeo({ title, bodyMarkdown: body, targetKeyword: keyword });
  return report.score;
}
