/**
 * Content Wrapper — Phase 4: Multi-Platform Content Adapter
 * =========================================================
 * Wraps raw AI-generated markdown content into platform-specific formats.
 * Supports: WeChat article, Xiaohongshu note, Zhihu answer, SEO article, email.
 *
 * Design principles:
 * - Input: GeneratedContent from AI content generator (raw markdown)
 * - Output: platform-adapted content with proper formatting, length limits, CTA insertion
 * - Compliance: all outputs pass through marketing compliance rules before wrapping
 * - Never modifies the original markdown — always produces new structured content
 */

import type { GeneratedContent } from '../../src/lib/marketing/ai-content-generator';

export type TargetPlatform = 'wechat' | 'xiaohongshu' | 'zhihu' | 'seo' | 'email' | 'douyin';

export interface WrappedContent {
  platform: TargetPlatform;
  title: string;
  body: string;           // Platform-native body (HTML for WeChat, plain for others)
  excerpt?: string;       // Used for meta description / og:description
  tags?: string[];       // Hashtags / topics for the platform
  coverImageHint?: string; // Suggested image style/color for the cover
  wordCount: number;
  complianceNotes: string[];
  ctaText?: string;
  publishedAt?: string;
}

// ─── Platform-specific wrappers ──────────────────────────────────────────────

/**
 * WeChat Official Account article wrapper
 * - Converts markdown to HTML suitable for WeChat rich text editor
 * - Inserts CTA sections, disclaimer, source link
 * - Max ~20000 chars (WeChat limit)
 * - Inserts section dividers, blockquotes, callout boxes
 */
export function wrapForWeChat(raw: GeneratedContent): WrappedContent {
  const body = raw.content;
  const wc = countChars(body);
  const overLimit = wc > 18000;

  const warnings: string[] = [];
  if (overLimit) warnings.push(`Content ${wc} chars exceeds WeChat soft limit of 18000`);

  // Convert markdown sections to WeChat HTML
  let html = markdownToWeChatHtml(body);

  // Insert AI assessment CTA before the final disclaimer
  const ctaSection = `
<div class="assessment-cta" style="background:#f0f9f0;border-left:4px solid #10b981;padding:16px 20px;margin:24px 0;border-radius:4px;">
  <p style="margin:0 0 8px;font-weight:bold;color:#065f46;">💡 先评估，更精准</p>
  <p style="margin:0 0 12px;color:#374151;font-size:14px;">每个人的体质和健康状况不同，在选择营养方案前，建议先完成荣旺AI健康评估，获取个性化的方案建议。</p>
  <a href="https://rongwang.hk/ai-consult" style="display:inline-block;background:#10b981;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-size:14px;">→ 立即开始AI评估</a>
</div>`;

  // Insert CTA before final disclaimer section
  if (html.includes('免责声明') || html.includes('©')) {
    const parts = html.split(/(<div class="disclaimer.*)/s);
    if (parts.length >= 2) {
      html = parts[0] + ctaSection + '\n' + parts[1];
    } else {
      html += '\n' + ctaSection;
    }
  } else {
    html += '\n' + ctaSection;
  }

  // Disclaimer
  const disclaimer = `
<div class="disclaimer" style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
  <p>本内容仅供健康教育参考，不构成医学诊断或治疗建议。如有健康问题，请咨询专业医生或营养师。</p>
  <p>© 荣旺健康 rongwang.hk · 进口保健品与OTC药品</p>
</div>`;
  html += disclaimer;

  return {
    platform: 'wechat',
    title: raw.title,
    body: html,
    excerpt: raw.excerpt ?? body.slice(0, 120).replace(/[#*\n]/g, '').trim(),
    tags: ['健康科普', '营养补充剂', '荣旺健康'],
    coverImageHint: 'professional health lifestyle',
    wordCount: wc,
    complianceNotes: warnings,
    ctaText: '立即开始AI评估',
  };
}

/**
 * Xiaohongshu (Little Red Book) note wrapper
 * - Plain text with emoji, max 1000 chars for body
 * - First-person conversational tone
 * - 3-5 hashtags at the end
 * - Short punchy paragraphs
 */
export function wrapForXiaohongshu(raw: GeneratedContent, meta?: { primaryKeyword?: string }): WrappedContent {
  const warnings: string[] = [];
  let body = raw.content;

  // Trim to ~1000 chars for Xiaohongshu
  const charCount = countChars(body);
  if (charCount > 900) {
    body = body.slice(0, 900) + '...';
    warnings.push('Content truncated to 900 chars for Xiaohongshu');
  }

  // Convert to conversational Xiaohongshu style
  const lines = body.split('\n').filter(Boolean);
  const shortLines = lines.map((l) => {
    // Shorten paragraphs
    if (l.length > 80) return l.slice(0, 80) + '...';
    return l;
  });

  // Extract key points into bullet-like format
  let formatted = shortLines
    .map((l) => {
      // Convert H2 to ## -> bold intro
      if (l.startsWith('## ')) return '✨ ' + l.replace(/^## \s*/, '');
      if (l.startsWith('# ')) return ''; // Skip H1
      if (l.startsWith('> ')) return '" ' + l.replace(/^> \s*/, '');
      return l;
    })
    .filter(Boolean)
    .join('\n\n');

  const hashtags = [
    `#健康科普`,
    `#营养补充剂`,
    `#${meta?.primaryKeyword ?? '健康管理'}`,
    `#跨境保健品`,
    `#荣旺健康`,
  ].slice(0, 5);

  const formattedBody = formatted + '\n\n' + hashtags.join(' ');

  return {
    platform: 'xiaohongshu',
    title: raw.title,
    body: formattedBody,
    excerpt: formattedBody.slice(0, 120),
    tags: hashtags.map((h) => h.replace('#', '')),
    coverImageHint: 'warm lifestyle photo with health product',
    wordCount: countChars(formattedBody),
    complianceNotes: warnings,
    ctaText: '收藏起来慢慢看~',
  };
}

/**
 * Zhihu answer wrapper
 * - Expert, authoritative tone
 * - Starts with direct answer/conclusion
 * - Structured with clear hierarchy
 * - References/sources section
 */
export function wrapForZhihu(raw: GeneratedContent): WrappedContent {
  const body = raw.content;
  const wc = countChars(body);

  // Zhihu benefits from structured Q&A format
  let formatted = body;

  // Ensure first paragraph gives direct answer
  const paragraphs = formatted.split('\n\n');
  const firstPara = paragraphs[0] ?? '';
  if (!firstPara.match(/^结论|^直接说|^(能|可以|建议|推荐)/)) {
    // Prepend a TLDR summary line
    formatted = `> 💡 核心结论：${firstPara.slice(0, 100)}...\n\n` + formatted;
  }

  // Add sources section if not present
  if (!formatted.includes('来源') && !formatted.includes('参考文献')) {
    formatted += '\n\n---\n\n**参考来源**：荣旺健康 (rongwang.hk)，文章内容经专业编辑审核。\n';
  }

  // Disclaimer
  formatted += '\n\n> 本回答仅供参考，不构成医学建议。如有健康问题请咨询专业医生。';

  return {
    platform: 'zhihu',
    title: raw.title,
    body: formatted,
    excerpt: body.slice(0, 150).replace(/[#*\n]/g, '').trim(),
    tags: ['营养学', '健康科普', '跨境保健品'],
    coverImageHint: 'professional infographic or data visual',
    wordCount: wc,
    complianceNotes: [],
    ctaText: '查看完整健康评估方案',
  };
}

/**
 * SEO article wrapper
 * - Keeps markdown structure (H1, H2, lists, tables)
 * - Adds meta description and structured data hints
 * - Optimizes heading hierarchy
 */
export function wrapForSeo(raw: GeneratedContent): WrappedContent {
  const body = raw.content;

  // Ensure H1 is the title
  let formatted = body;
  if (!formatted.startsWith('# ')) {
    formatted = `# ${raw.title}\n\n` + formatted;
  }

  // Ensure FAQ section exists at the end
  if (!formatted.toLowerCase().includes('常见问题') && !formatted.toLowerCase().includes('faq')) {
    formatted += `\n\n## 常见问题\n\n### ${raw.title}的效果如何？\n上述内容为健康教育参考，具体效果因人而异。建议在选择营养补充方案前咨询专业医生或营养师。\n`;
  }

  // Disclaimer at bottom
  formatted += `\n\n---\n\n*本内容仅供健康教育参考，不构成医学诊断或治疗建议。© 荣旺健康*`;

  return {
    platform: 'seo',
    title: raw.title,
    body: formatted,
    excerpt: raw.excerpt ?? body.slice(0, 160).replace(/[#*\n]/g, '').trim(),
    wordCount: countWords(formatted),
    complianceNotes: [],
  };
}

/**
 * Email sequence wrapper
 * - Plain text, conversational, personal tone
 * - Short paragraphs, clear CTA
 * - Unsubscribe footer
 */
export function wrapForEmail(raw: GeneratedContent): WrappedContent {
  const body = raw.content;
  const shortBody = body.length > 500 ? body.slice(0, 500) + '\n\n(内容已缩减，查看完整版本请访问官网)' : body;

  const emailBody = `亲爱的读者，

${shortBody}

--
💡 想了解适合自己的个性化健康方案？
👉 https://rongwang.hk/ai-consult

---
您收到这封邮件因为订阅了荣旺健康资讯。退订请回复"退订"。
© 荣旺健康 rongwang.hk`;

  return {
    platform: 'email',
    title: raw.title,
    body: emailBody,
    excerpt: shortBody.slice(0, 120),
    wordCount: countChars(emailBody),
    complianceNotes: [],
    ctaText: '立即开始AI评估',
  };
}

/**
 * Douyin script wrapper
 * - Converts content into a short-video script
 * - Format: [钩子(3s)] [痛点(5s)] [方案(15s)] [CTA(5s)]
 * - Stage directions in brackets
 */
export function wrapForDouyin(raw: GeneratedContent): WrappedContent {
  const body = raw.content;
  const points = extractKeyPoints(body, 3);

  const script = `[开场钩子 - 3秒]
⚡ ${points[0] ?? raw.title}

[痛点陈述 - 5秒]
${points[1] ?? '你是否也有这样的困扰？'}

[解决方案 - 15秒]
${points[2] ?? body.slice(0, 150)}

[产品/方案引导 - 5秒]
想要找到适合自己的健康方案？点击下方链接，荣旺AI健康评估帮你分析。

[CTA]
👉 https://rongwang.hk/ai-consult
💬 评论区告诉我你的困扰

---
本内容仅供健康教育参考，不构成医学建议。`;

  return {
    platform: 'douyin',
    title: `[短视频] ${raw.title}`,
    body: script,
    excerpt: script.slice(0, 100),
    wordCount: countChars(script),
    complianceNotes: [],
    ctaText: '立即开始AI评估',
  };
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export function wrapContent(
  raw: GeneratedContent,
  platform: TargetPlatform,
  meta?: { primaryKeyword?: string }
): WrappedContent {
  switch (platform) {
    case 'wechat': return wrapForWeChat(raw);
    case 'xiaohongshu': return wrapForXiaohongshu(raw, meta);
    case 'zhihu': return wrapForZhihu(raw);
    case 'seo': return wrapForSeo(raw);
    case 'email': return wrapForEmail(raw);
    case 'douyin': return wrapForDouyin(raw);
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function countChars(text: string): number {
  return text.replace(/<[^>]*>/g, '').length;
}

function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, '');
  const chinese = (stripped.match(/[\u4e00-\u9fff]/g) || []).length;
  const english = stripped.split(/\s+/).filter(Boolean).length;
  return chinese > english ? chinese : english;
}

function extractKeyPoints(text: string, count: number): string[] {
  const lines = text.split('\n').filter((l) => l.length > 20 && !l.startsWith('#'));
  return lines.slice(0, count).map((l) => l.replace(/[*#>\[\]]/g, '').trim().slice(0, 60));
}

function markdownToWeChatHtml(md: string): string {
  let html = md;

  // H1 -> div class="title1"
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:24px;font-weight:bold;margin:16px 0;">$1</h1>');

  // H2 -> div class="title2"
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:bold;margin:20px 0 12px;border-left:4px solid #10b981;padding-left:12px;">$1</h2>');

  // H3 -> h3
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:bold;margin:16px 0 8px;">$1</h3>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #10b981;margin:12px 0;padding:8px 16px;color:#374151;background:#f9fafb;">$1</blockquote>');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin:4px 0;">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul style="margin:12px 0;padding-left:24px;">${match}</ul>`);

  // Paragraphs (double newlines)
  html = html.replace(/\n\n+/g, '</p><p style="margin:12px 0;line-height:1.8;">');
  html = `<p style="margin:12px 0;line-height:1.8;">${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p style="[^"]*"><\/p>/g, '');
  html = html.replace(/<p style="[^"]*">\s*<\/p>/g, '');

  return html;
}