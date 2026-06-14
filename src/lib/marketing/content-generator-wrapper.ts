/**
 * 荣旺营销 Pipeline v1 — Content Generator Wrapper
 *
 * 复用现有的 ai-content-generator.ts (generateMarketingContent)
 * 包装为 ContentArtifact 格式输出
 *
 * 健康内容合规要求（内置）:
 * - 所有内容必须包含免责声明
 * - 禁止：治愈/治疗/诊断/处方/100%/保证/一定/永久/彻底
 * - 允许：支持/帮助/改善/促进/辅助调理/参考
 */

import { generateMarketingContent, type ContentGenerationRequest, type ContentGenerationResult } from './ai-content-generator';
import type { MarketingChannel } from '@/schemas/marketing';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ContentArtifact {
  title: string;
  summary: string;
  bodyMarkdown: string;
  faq?: Array<{ question: string; answer: string }>;
  seo: {
    keyword: string;
    metaTitle: string;
    metaDescription: string;
    hasBrandMention: boolean;
    hasMedicalDisclaimer: boolean;
    hasAiHealthCheckCta: boolean;
  };
  platformVariants: Partial<Record<PlatformV2, string>>;
  compliance: {
    approved: boolean;
    warnings: string[];
  };
  meta: {
    wordCount: number;
    provider: string;
    elapsedMs: number;
  };
}

export type PlatformV2 = 'website' | 'wechat' | 'xiaohongshu' | 'zhihu';

export interface GenerateContentInput {
  keyword: string;
  productName: string;
  audience?: string;
  channel: PlatformV2;
  cta?: string;
  locale?: string;
  solutionSlug?: string;
}

// ─────────────────────────────────────────────
// Health disclaimer (auto-injected)
// ─────────────────────────────────────────────

const HEALTH_DISCLAIMER = `
---
*本内容仅用于健康管理和营养知识参考，不替代医生诊断、治疗或用药建议。如有持续不适或慢性疾病，请咨询专业医生。*
`.trim();

// ─────────────────────────────────────────────
// Compliance check
// ─────────────────────────────────────────────

const DISALLOWED_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /治愈|根治|治疗|诊断|处方/, label: '诊断/治疗词汇' },
  { pattern: /100%|保证|一定|永久|彻底/, label: '绝对化承诺' },
  { pattern: /最有效|唯一|首选|零风险/, label: '最优化/极端化表达' },
  { pattern: /替代医生|替代药物|不用看医生/, label: '医疗替代建议' },
];

function checkHealthCompliance(body: string): { approved: boolean; warnings: string[] } {
  const warnings: string[] = [];

  for (const { pattern, label } of DISALLOWED_PATTERNS) {
    if (pattern.test(body)) {
      warnings.push(`合规警告: 发现 "${label}" 相关表达`);
    }
  }

  const hasDisclaimer = /本内容仅用于.*参考.*不构成.*建议/i.test(body);
  if (!hasDisclaimer) {
    warnings.push('合规警告: 缺少医疗免责声明');
  }

  return {
    approved: warnings.length === 0,
    warnings,
  };
}

// ─────────────────────────────────────────────
// Platform channel mapping
// ─────────────────────────────────────────────

function platformV2ToChannel(platform: PlatformV2): MarketingChannel {
  const map: Record<PlatformV2, MarketingChannel> = {
    website: 'seo_article',
    wechat: 'wechat',
    xiaohongshu: 'xiaohongshu',
    zhihu: 'xiaohongshu', // Fallback - zhihu uses similar format
  };
  return map[platform] ?? 'seo_article';
}

function platformV2ToTone(platform: PlatformV2): 'educational' | 'conversational' | 'professional' {
  const map: Record<PlatformV2, 'educational' | 'conversational' | 'professional'> = {
    website: 'educational',
    wechat: 'conversational',
    xiaohongshu: 'conversational',
    zhihu: 'professional',
  };
  return map[platform];
}

// ─────────────────────────────────────────────
// Main wrapper
// ─────────────────────────────────────────────

export async function generateContentArtifact(input: GenerateContentInput): Promise<{
  success: boolean;
  artifact: ContentArtifact | null;
  error?: string;
  warnings: string[];
}> {
  const {
    keyword,
    productName,
    audience,
    channel,
    cta = '开始AI健康自测',
    locale = 'zh-CN',
    solutionSlug,
  } = input;

  // Build content topic request
  const topic = {
    id: `artifact_${Date.now()}`,
    category: channel === 'wechat' ? '公众号推文' as const : channel === 'xiaohongshu' ? '小红书种草' as const : 'SEO文章' as const,
    solutionSlug: solutionSlug as `sleep` | `fatigue` | `liver` | `immune` | `female-health` | `male-health` | undefined,
    title: `${keyword} — ${productName}`,
    keywords: [keyword],
    summary: audience ? `${productName}面向${audience}` : productName,
    priority: 1 as const,
    wordCount: channel === 'xiaohongshu' ? 600 : 1500,
    contentType: '教育科普' as const,
  };

  const channelInput = platformV2ToChannel(channel);
  const tone = platformV2ToTone(channel);

  const request: ContentGenerationRequest = {
    topic,
    channel: channelInput,
    tone,
    primaryCtaHref: 'https://rongwang.hk/ai-health-check',
    secondaryHref: 'https://rongwang.hk/solutions',
    solutionSlug: topic.solutionSlug,
  };

  // Call existing content generator
  let result: ContentGenerationResult;
  try {
    result = await generateMarketingContent(request);
  } catch (err) {
    return {
      success: false,
      artifact: null,
      error: `Content generation failed: ${err}`,
      warnings: [],
    };
  }

  if (result.skipped) {
    return {
      success: false,
      artifact: null,
      error: `Content generation skipped: ${result.skipReason}`,
      warnings: result.complianceWarnings,
    };
  }

  if (!result.generated) {
    return {
      success: false,
      artifact: null,
      error: result.error ?? 'No content generated',
      warnings: result.complianceWarnings,
    };
  }

  const generated = result.generated;

  // Check compliance
  const compliance = checkHealthCompliance(generated.content);

  // Ensure disclaimer is present
  let finalBody = generated.content;
  if (!generated.content.includes('本内容仅用于')) {
    finalBody = generated.content + '\n\n' + HEALTH_DISCLAIMER;
  }

  // Extract FAQ if present
  const faqMatches = finalBody.match(/## FAQ[\s\S]*?(?=##|$)/i);
  let faq: ContentArtifact['faq'] | undefined;
  if (faqMatches) {
    const faqPairs = faqMatches[0].match(/(?:^|\n)([^?]*[?？](?:\n|$)([^#]*?)(?=\n##|\n#|$))/g);
    if (faqPairs) {
      faq = faqPairs.slice(0, 5).map((pair) => {
        const lines = pair.trim().split('\n');
        const question = lines[0].replace(/[?？]$/, '').trim();
        const answer = lines.slice(1).join('\n').trim();
        return { question, answer };
      });
    }
  }

  // Build SEO metadata
  const seo = {
    keyword,
    metaTitle: generated.excerpt.slice(0, 60) || keyword,
    metaDescription: generated.excerpt.slice(0, 160) || `了解${keyword}的全面指南，包含科学依据和实用建议。`,
    hasBrandMention: /荣旺|rongwang|RongWang/i.test(finalBody),
    hasMedicalDisclaimer: /本内容仅用于.*参考.*不构成.*建议/i.test(finalBody),
    hasAiHealthCheckCta: /AI健康自测|AI测评|健康自测|测评链接/i.test(finalBody),
  };

  // Build platform variants
  const platformVariants: Partial<Record<PlatformV2, string>> = {
    [channel]: finalBody,
  };

  // Generate variants for other platforms
  if (channel !== 'wechat') {
    platformVariants.wechat = buildWechatVariant(finalBody, keyword, cta);
  }
  if (channel !== 'xiaohongshu') {
    platformVariants.xiaohongshu = buildXiaohongshuVariant(finalBody, keyword, cta);
  }
  if (channel !== 'zhihu') {
    platformVariants.zhihu = finalBody; // Zhihu uses similar format
  }

  const artifact: ContentArtifact = {
    title: generated.title || keyword,
    summary: generated.excerpt,
    bodyMarkdown: finalBody,
    faq,
    seo,
    platformVariants,
    compliance: {
      approved: compliance.approved,
      warnings: [...result.complianceWarnings, ...compliance.warnings],
    },
    meta: {
      wordCount: generated.wordCount,
      provider: generated.provider,
      elapsedMs: generated.elapsedMs,
    },
  };

  return {
    success: true,
    artifact,
    warnings: artifact.compliance.warnings,
  };
}

// ─────────────────────────────────────────────
// Platform variant builders
// ─────────────────────────────────────────────

function buildWechatVariant(body: string, keyword: string, cta: string): string {
  // WeChat version: add emoji, warmer tone
  let variant = body
    .replace(/^## (.+)/gm, '**$1**')
    .replace(/\*\*(.+?)\*\*/g, '💡 $1')
    .replace(/\n\n/g, '\n\n✅ ')
    .slice(0, 20000); // WeChat max ~20000 chars

  variant += `\n\n✅ ${cta}\n`;
  variant += `\n🏠 [荣旺健康商城](https://rongwang.hk)\n`;
  variant += `\n---\n${HEALTH_DISCLAIMER}`;

  return variant;
}

function buildXiaohongshuVariant(body: string, keyword: string, cta: string): string {
  // XHS version: short, emoji-heavy, line breaks
  const shortBody = body
    .replace(/^## (.+)/gm, '🔖 $1')
    .replace(/\n\n/g, '\n\n')
    .split('\n')
    .slice(0, 50)
    .join('\n');

  let variant = `🌟 ${keyword}\n\n${shortBody}\n\n`;
  variant += `✅ ${cta}\n\n`;
  variant += `---\n${HEALTH_DISCLAIMER}`;

  return variant;
}
