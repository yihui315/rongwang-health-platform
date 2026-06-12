/**
 * 自有 AI 营销内容生成引擎
 * 替代 geoFlow 的核心能力：SEO 文章、微信文案、邮件、社交媒体脚本
 *
 * 使用已配置的 AI Provider（DeepSeek/MiniMax），直接写入 MarketingPost 表
 */

import { generateTextWithProvider, type TextGenerationResult } from "@/lib/ai/provider";
import { evaluateMarketingCompliance, type MarketingComplianceResult } from "@/lib/marketing/automation";
import type { ContentTopic } from "@/lib/marketing/content-topics";
import type { MarketingChannel } from "@/schemas/marketing";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface GeneratedContent {
  topicId: string;
  channel: MarketingChannel;
  title: string;
  content: string;
  excerpt: string;
  keywords: string[];
  wordCount: number;
  compliance: MarketingComplianceResult;
  metaDescription: string;
  provider: string;
  elapsedMs: number;
}

export interface ContentGenerationRequest {
  topic: ContentTopic;
  channel: MarketingChannel;
  tone?: "educational" | "conversational" | "professional";
  primaryCtaHref?: string;
  secondaryHref?: string;
  solutionSlug?: string;
}

export interface ContentGenerationResult {
  success: boolean;
  generated: GeneratedContent | null;
  error?: string;
  complianceWarnings: string[];
  skipped: boolean;
  skipReason?: string;
}

// ─────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────

const COMPLIANCE_RULES = `
【合规要求 - 严格遵守】
- 禁止：治愈、治疗、诊断、处方、替代医生
- 禁止：100%、保证、一定、永久、彻底、无副作用
- 禁止：最有效、唯一、首选、零风险
- 允许：支持、帮助、改善、促进、辅助调理、参考
- 所有内容必须以健康教育为主，最终引导用户完成AI健康评估
- 需要在内容结尾保留"本内容仅供健康教育参考，不构成医学建议"的免责声明
`;

function buildSeoArticlePrompt(input: ContentGenerationRequest): string {
  const { topic } = input;
  return `你是荣旺健康的资深健康教育内容编辑，负责撰写SEO文章。

## 任务
请根据以下信息，撰写一篇高质量的SEO健康教育文章。

## 内容主题
标题：${topic.title}
关键词：${topic.keywords.join("、")}
内容摘要：${topic.summary}
类型：${topic.contentType}
字数要求：${topic.wordCount ?? 1500}字左右

## 结构要求
1. H1标题（与主题一致）
2. 前言（100字，引入话题，建立用户痛点共鸣）
3. H2章节（3-5章），每章：
   - 包含2-3个段落
   - 自然融入关键词
   - 给出实用的健康教育信息
4. H2"先评估，再看方案"（引导AI评估）
5. 免责声明（固定格式）

## 注意事项
- 内容纯健康教育，不做任何诊断或治疗承诺
- 涉及营养补充剂时，以"查阅研究文献""健康辅助参考"方式描述
- 如症状严重、持续或正在服药，建议先咨询医生
${COMPLIANCE_RULES}

请直接输出文章正文，不需要任何额外说明。`;
}

function buildWeChatArticlePrompt(input: ContentGenerationRequest): string {
  const { topic } = input;
  const primaryCta = input.primaryCtaHref ?? "https://rongwang.hk/ai-consult";
  const secondaryHref = input.secondaryHref ?? "https://rongwang.hk/solutions";

  return `你是荣旺健康公众号的内容编辑，负责撰写微信文章。

## 任务
请根据以下信息，撰写一篇适合微信公众号的健康教育文章。

## 内容主题
标题：${topic.title}
关键词：${topic.keywords.join("、")}
内容摘要：${topic.summary}
类型：${topic.contentType}

## 结构要求（Markdown格式）
1. H1标题（吸引眼球，可用emoji点缀）
2. 导读段落（100字，建立共鸣）
3. 3-4个H2章节，每章包含实用信息
4. H2"先评估，更精准"（引导AI评估环节）
5. 延伸阅读（如果有）
6. CTA：${primaryCta}
7. 官网商城入口
8. 免责声明

## 文风
- 亲切自然，像朋友推荐
- 适当使用emoji增加可读性（✅⚠️💡🌙🍵🏃等）
- 避免过度营销感，以教育为主
${COMPLIANCE_RULES}

请直接输出Markdown格式文章。`;
}

function buildEmailPrompt(input: ContentGenerationRequest): string {
  const { topic } = input;
  const primaryCta = input.primaryCtaHref ?? "https://rongwang.hk/ai-consult";

  return `你是荣旺健康的邮件营销编辑，负责撰写营销邮件。

## 任务
撰写一封针对用户的健康教育邮件。

## 内容主题
标题：${topic.title}
关键词：${topic.keywords.join("、")}
内容摘要：${topic.summary}

## 邮件结构
1. 主题行（30字以内，吸引打开）
2. 预览文字（50字以内，补充主题）
3. 正文（300-500字）
4. 主CTA按钮（"立即开始AI评估" → ${primaryCta}）
5. 副CTA（可选）
6. 退订链接占位

## 要求
- 邮件风格简洁有力，适合移动端阅读
- 每段不超过3行
- CTA突出但不夸大
- 纯健康教育，不承诺疗效
${COMPLIANCE_RULES}

请输出JSON格式：{"subject": "...", "preview": "...", "body": "..."}`;
}

function buildXiaoHongShuPrompt(input: ContentGenerationRequest): string {
  const { topic } = input;
  const primaryCta = input.primaryCtaHref ?? "https://rongwang.hk/ai-consult";

  return `你是小红书健康类目的内容创作者，负责撰写种草笔记。

## 任务
根据以下信息，撰写一篇小红书风格的种草/科普笔记。

## 内容主题
标题：${topic.title}
关键词：${topic.keywords.join("、")}
内容摘要：${topic.summary}
类型：${topic.contentType}

## 小红书结构
1. 标题（带emoji，吸引点击，可用数字/对比/痛点式）
2. 正文（500-800字，自然真实）：
   - 开头：场景化痛点描述（emoji）
   - 中间：亲身经历/干货知识
   - 结尾：软性引导AI评估（不能说"快买"，要自然）
3. 标签（5-8个相关话题标签）
4. 合规注释

## 文风
- 真实、亲切、有代入感
- emoji要自然，不能过度
- 适当口语化，像真人写的
- 不能出现"最有效""保证""100%"等绝对化表述
${COMPLIANCE_RULES}

请直接输出正文内容。`;
}

function buildDouyinScriptPrompt(input: ContentGenerationRequest): string {
  const { topic } = input;
  const primaryCta = input.primaryCtaHref ?? "https://rongwang.hk/ai-consult";

  return `你是抖音健康类目的内容策划，负责撰写短视频脚本。

## 任务
根据以下信息，撰写一份抖音短视频口播脚本。

## 内容主题
标题：${topic.title}
关键词：${topic.keywords.join("、")}
内容摘要：${topic.summary}

## 脚本结构（60秒完播率优化）
1. 开头钩子（0-5秒）：用痛点/反常识/数字吸引停留
2. 正文（5-50秒）：
   - 层层递进的健康教育信息
   - 2-3个关键知识点
   - 保持语速适中，信息密度高
3. 结尾引导（50-60秒）：软性CTA引导AI评估

## 格式
[开场钩子] - 吸引停留的3-5秒
[正文] - 分段口播内容，每段标注时长
[引导] - 结尾CTA

## 要求
- 语言口语化，有感染力
- 避免书面语和长句
- 禁止：绝对化表述、治疗承诺、医疗建议
- 适合直接对着镜头读
${COMPLIANCE_RULES}

请直接输出脚本内容。`;
}

// ─────────────────────────────────────────────
// Channel → Prompt 路由
// ─────────────────────────────────────────────

function buildPrompt(input: ContentGenerationRequest): string {
  switch (input.channel) {
    case "seo_article":
      return buildSeoArticlePrompt(input);
    case "wechat":
      return buildWeChatArticlePrompt(input);
    case "email":
      return buildEmailPrompt(input);
    case "xiaohongshu":
      return buildXiaoHongShuPrompt(input);
    case "douyin":
      return buildDouyinScriptPrompt(input);
    default:
      return buildSeoArticlePrompt(input);
  }
}

function buildSystemPrompt(): string {
  return `你是荣旺健康的健康教育内容AI助手。
荣旺健康是一家专注于精准营养和健康教育的跨境保健品电商平台，使命是"先评估、后方案、再产品"。
所有内容必须：
1. 以用户健康教育为核心目的
2. 不做任何形式的诊断、治疗或替代医生的承诺
3. 最终引导用户完成AI健康评估，获得个性化建议
4. 涉及营养补充剂时，描述其辅助调理作用，不夸大功效
5. 内容科学、有据可依、通俗易懂`;
}

// ─────────────────────────────────────────────
// Compliance & Quality
// ─────────────────────────────────────────────

function extractExcerpt(content: string, maxLength = 160): string {
  // Remove markdown syntax for plain text excerpt
  const plain = content
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();

  return plain.length > maxLength ? plain.slice(0, maxLength) + "…" : plain;
}

function countWords(text: string): number {
  return text.replace(/\s+/g, "").length;
}

function checkCompliance(content: string): string[] {
  const compliance = evaluateMarketingCompliance(content);
  return compliance.warnings;
}

// ─────────────────────────────────────────────
// Core Generation
// ─────────────────────────────────────────────

export async function generateMarketingContent(
  request: ContentGenerationRequest,
): Promise<ContentGenerationResult> {
  // Step 1: Check if AI content generation is enabled
  if (process.env.FEATURE_MARKETING_CONTENT_AI !== "true") {
    return {
      success: false,
      generated: null,
      error: "FEATURE_MARKETING_CONTENT_AI is not enabled",
      complianceWarnings: [],
      skipped: true,
      skipReason: "feature_disabled",
    };
  }

  // Step 2: Check AI provider is configured
  const hasDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
  const hasMiniMax = Boolean(process.env.MINIMAX_API_KEY);
  if (!hasDeepSeek && !hasMiniMax) {
    return {
      success: false,
      generated: null,
      error: "No AI provider configured (DEEPSEEK_API_KEY or MINIMAX_API_KEY required)",
      complianceWarnings: [],
      skipped: true,
      skipReason: "no_ai_provider",
    };
  }

  // Step 3: Build prompt
  const prompt = buildPrompt(request);
  const systemPrompt = buildSystemPrompt();

  // Step 4: Generate
  const provider = hasDeepSeek ? "deepseek" : "minimax";
  const result: TextGenerationResult = await generateTextWithProvider({
    prompt,
    systemPrompt,
    taskType: "marketing_content_generation",
    provider,
    temperature: 0.4,
    maxTokens: 4000,
    promptVersion: "marketing-content-v1",
  });

  if (!result.success || !result.text) {
    return {
      success: false,
      generated: null,
      error: result.error ?? "AI generation returned empty content",
      complianceWarnings: [],
      skipped: false,
    };
  }

  // Step 5: Compliance check
  const complianceWarnings = checkCompliance(result.text);

  // Step 6: Build generated content
  const title = request.topic.title;
  const content = result.text;
  const excerpt = extractExcerpt(content);
  const wordCount = countWords(content);
  const metaDescription = extractExcerpt(content, 155);
  const compliance = evaluateMarketingCompliance(content);

  return {
    success: true,
    generated: {
      topicId: request.topic.id,
      channel: request.channel,
      title,
      content,
      excerpt,
      keywords: request.topic.keywords,
      wordCount,
      compliance,
      metaDescription,
      provider: result.resolvedProvider,
      elapsedMs: result.elapsedMs ?? 0,
    },
    complianceWarnings,
    skipped: false,
  };
}

// ─────────────────────────────────────────────
// Batch Generation (for autopilot)
// ─────────────────────────────────────────────

export interface BatchGenerationRequest {
  topics: ContentTopic[];
  channels: MarketingChannel[];
  solutionSlug?: string;
  primaryCtaHref?: string;
}

export interface BatchGenerationResult {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: ContentGenerationResult[];
  totalElapsedMs: number;
}

export async function generateBatchContent(
  batch: BatchGenerationRequest,
): Promise<BatchGenerationResult> {
  const results: ContentGenerationResult[] = [];
  let totalElapsedMs = 0;

  for (const topic of batch.topics) {
    for (const channel of batch.channels) {
      const result = await generateMarketingContent({
        topic,
        channel,
        primaryCtaHref: batch.primaryCtaHref,
        solutionSlug: batch.solutionSlug,
      });

      results.push(result);
      if (result.generated) {
        totalElapsedMs += result.generated.elapsedMs;
      }
    }
  }

  return {
    total: results.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success && !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    results,
    totalElapsedMs,
  };
}
