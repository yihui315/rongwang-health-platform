/**
 * 荣旺营销 Pipeline v1 — Manual Pack Generator
 * 当平台发布失败时，生成人类可读的发布包
 *
 * 输出目录: .ai/marketing-manual-packs/{timestamp}-{jobId}/
 * 每个平台输出:
 *   {platform}.md         — 平台特定内容（可直接复制粘贴）
 *   README.md            — 发布说明和步骤
 *   assets/              — 图片资源占位目录
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ManualPackInput {
  jobId: string;
  platform: 'wechat' | 'xiaohongshu' | 'zhihu' | 'website';
  title: string;
  body: string;       // Markdown content
  cta?: string;
  tags?: string[];
  failureReason: string;
  metaDescription?: string;
  landingPageUrl?: string;
}

export interface ManualPack {
  jobId: string;
  platform: string;
  timestamp: string;
  title: string;
  content: string; // Markdown body
  tags: string[];
  cta: string;
  publishNotes: string;
  failureReason: string;
  manualInstructions: string;
  outputPath: string;
}

// ─────────────────────────────────────────────
// Platform-specific generators
// ─────────────────────────────────────────────

function generateWechatPack(input: ManualPackInput): ManualPack {
  const { title, body, cta, failureReason, landingPageUrl } = input;

  const publishNotes = `
## 微信公众号发布注意事项

1. **标题**: 复制下方标题到微信公众号后台
2. **作者**: 荣旺健康（或指定作者）
3. **正文**: 直接粘贴Markdown内容，微信后台会自动处理格式
4. **封面图**: 建议使用 2.35:1 比例的图片（900x383像素最佳）
5. **摘要**: 建议填写，有助于分享时显示
6. **原创声明**: 如内容为纯教育科普，建议勾选原创
7. **保存草稿**: 先保存草稿，检查无误后再发布

## 补充内容

${cta ? `**引导CTA**: ${cta}\n` : ''}
${landingPageUrl ? `**落地页链接**: ${landingPageUrl}\n` : ''}

## 失败原因

${failureReason}
`;

  const instructions = `
## 人工处理步骤

1. 打开微信公众号后台: https://mp.weixin.qq.com
2. 复制下方标题和正文
3. 上传封面图片
4. 选择分类和标签
5. 保存草稿预览检查
6. 确认无误后发布
`;

  return {
    jobId: input.jobId,
    platform: 'wechat',
    timestamp: new Date().toISOString(),
    title,
    content: body,
    tags: input.tags ?? ['健康科普', '营养健康', '荣旺健康'],
    cta: cta ?? '开始AI健康自测',
    publishNotes,
    failureReason,
    manualInstructions: instructions,
    outputPath: '',
  };
}

function generateXiaohongshuPack(input: ManualPackInput): ManualPack {
  const { title, body, cta, failureReason, tags } = input;

  // 小红书需要短标题 + 精简正文
  const shortTitle = title.length > 20 ? title.slice(0, 19) + '...' : title;

  // 小红书正文需要 emoji 和分段
  const xhsBody = `
${shortTitle}

${body.split('\n').slice(0, 15).join('\n')}

${cta ? `✅ ${cta}\n` : ''}
---
❤️ 收藏起来慢慢看
💬 评论区见~
`;

  const publishNotes = `
## 小红书发布注意事项

1. **标题**: 上方短标题（20字以内效果最好），可加emoji
2. **正文**: 复制上方内容（小红书对字数敏感，建议精简）
3. **话题标签**: ${(tags ?? ['健康科普', '营养师', '健康养生']).map((t) => `#${t}`).join(' ')}
4. **封面图**: 竖版3:4比例（建议1080x1440像素），突出标题
5. **发布时间**: 工作日 7-9点、12-14点、18-21点最佳
6. **互动引导**: 主动提问引导评论，提高推送量

⚠️ 注意：平台算法会检测AI生成内容。建议适度修改表达方式，增加真实体验描述。
`;

  const instructions = `
## 人工处理步骤

1. 打开小红书APP或网页版
2. 点击发布笔记
3. 上传封面图和正文
4. 添加话题标签：${(tags ?? ['健康科普']).map((t) => `#${t}`).join(' ')}
5. @相关账号（如有）
6. 预览后发布
`;

  return {
    jobId: input.jobId,
    platform: 'xiaohongshu',
    timestamp: new Date().toISOString(),
    title: shortTitle,
    content: xhsBody,
    tags: tags ?? ['健康科普', '营养师', '健康养生'],
    cta: cta ?? '开始AI健康自测',
    publishNotes,
    failureReason: failureReason + ' (小红书本轮不做无人值守发布，仅生成手动包)',
    manualInstructions: instructions,
    outputPath: '',
  };
}

function generateZhihuPack(input: ManualPackInput): ManualPack {
  const { title, body, cta, failureReason, tags } = input;

  const publishNotes = `
## 知乎发布注意事项

1. **标题**: 复制下方标题
2. **正文**: 直接粘贴Markdown，知乎支持部分Markdown格式
3. **话题**: ${(tags ?? ['健康', '营养学', '睡眠健康']).map((t) => `#${t}`).join(' ')}
4. **专栏**: 可选择投放到相关专栏
5. **开启赞赏**: 如内容优质可开启
6. **发布**: 建议先发布后修改，不要过度追求完美

## 附加内容

${cta ? `**行动引导**: ${cta}\n` : ''}
`;

  const instructions = `
## 人工处理步骤

1. 打开知乎后台: https://www.zhihu.com/write
2. 粘贴标题和正文
3. 添加话题标签
4. 选择是否开启评论
5. 预览检查
6. 发布
`;

  return {
    jobId: input.jobId,
    platform: 'zhihu',
    timestamp: new Date().toISOString(),
    title,
    content: body,
    tags: tags ?? ['健康', '营养学', '睡眠健康'],
    cta: cta ?? '开始AI健康自测',
    publishNotes,
    failureReason,
    manualInstructions: instructions,
    outputPath: '',
  };
}

function generateWebsitePack(input: ManualPackInput): ManualPack {
  const { title, body, cta, failureReason, metaDescription, landingPageUrl } = input;

  const publishNotes = `
## 官网文章发布注意事项

1. **标题(H1)**: 使用下方标题
2. **URL Slug**: 建议使用拼音或英文slug
3. **正文**: 粘贴Markdown内容
4. **SEO字段**:
   - Meta Title: ${title.slice(0, 60)}
   - Meta Description: ${metaDescription ?? '(建议80-160字符)'}
   - Canonical URL: ${landingPageUrl ?? '(填写落地页URL)'}
5. **标签**: ${(input.tags ?? ['健康科普']).join(', ')}
6. **作者**: 荣旺健康内容团队
7. **发布日期**: 今天

## 附加内容

${cta ? `**CTA**: ${cta}\n` : ''}
`;

  const instructions = `
## 人工处理步骤

1. 登录 CMS 后台
2. 创建新文章
3. 填写标题和正文
4. 填写SEO元数据
5. 上线前预览检查
6. 保存草稿 → 审核 → 发布
`;

  return {
    jobId: input.jobId,
    platform: 'website',
    timestamp: new Date().toISOString(),
    title,
    content: body,
    tags: input.tags ?? ['健康科普'],
    cta: cta ?? '开始AI健康自测',
    publishNotes,
    failureReason,
    manualInstructions: instructions,
    outputPath: '',
  };
}

// ─────────────────────────────────────────────
// Main Generator
// ─────────────────────────────────────────────

const PLATFORM_GENERATORS: Record<string, (input: ManualPackInput) => ManualPack> = {
  wechat: generateWechatPack,
  xiaohongshu: generateXiaohongshuPack,
  zhihu: generateZhihuPack,
  website: generateWebsitePack,
};

const BASE_OUTPUT_DIR = '.ai/marketing-manual-packs';

export function generateManualPack(input: ManualPackInput): ManualPack {
  const generator = PLATFORM_GENERATORS[input.platform];
  if (!generator) {
    throw new Error(`Unknown platform: ${input.platform}`);
  }

  const pack = generator(input);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = join(BASE_OUTPUT_DIR, `${timestamp}-${input.jobId}`);

  mkdirSync(outputDir, { recursive: true });
  mkdirSync(join(outputDir, 'assets'), { recursive: true });

  // Write platform-specific content
  const platformFile = `${input.platform}.md`;
  const platformContent = `# ${pack.platform.toUpperCase()} Manual Pack

# ${pack.title}

---

${pack.content}

---

## 标签
${pack.tags.map((t) => `- ${t}`).join('\n')}

## CTA
${pack.cta}

${pack.publishNotes}
`;

  writeFileSync(join(outputDir, platformFile), platformContent, 'utf-8');

  // Write README
  const readmeContent = `# Manual Pack — ${input.jobId}

## 平台
${pack.platform}

## 失败原因
${pack.failureReason}

${pack.publishNotes}

${pack.manualInstructions}

---

**Generated by 荣旺营销 Pipeline v1**
**Timestamp: ${pack.timestamp}**
`;

  writeFileSync(join(outputDir, 'README.md'), readmeContent, 'utf-8');

  const packWithPath: ManualPack = {
    ...pack,
    outputPath: outputDir,
  };

  console.log(`[ManualPack] Generated ${pack.platform} pack: ${outputDir}`);

  return packWithPath;
}

// ─────────────────────────────────────────────
// Batch generator
// ─────────────────────────────────────────────

export interface BatchManualPackResult {
  jobId: string;
  timestamp: string;
  packs: ManualPack[];
  totalFailed: number;
}

export function generateAllManualPacks(
  jobId: string,
  failedPlatforms: Array<{
    platform: ManualPackInput['platform'];
    title: string;
    body: string;
    failureReason: string;
    cta?: string;
    tags?: string[];
  }>
): BatchManualPackResult {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const packs: ManualPack[] = [];

  for (const fp of failedPlatforms) {
    try {
      const pack = generateManualPack({
        jobId,
        platform: fp.platform,
        title: fp.title,
        body: fp.body,
        cta: fp.cta,
        tags: fp.tags,
        failureReason: fp.failureReason,
      });
      packs.push(pack);
    } catch (err) {
      console.error(`[ManualPack] Failed to generate pack for ${fp.platform}: ${err}`);
    }
  }

  return {
    jobId,
    timestamp,
    packs,
    totalFailed: failedPlatforms.length,
  };
}
