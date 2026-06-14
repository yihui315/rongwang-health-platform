/**
 * Manual Pack Generator — Phase 8
 *
 * When pipeline reaches manual_package mode (publish_mode='manual_package' or
 * a platform is unavailable), this module generates a self-contained package
 * containing everything a human operator needs to complete the publish manually.
 *
 * Package contents:
 *   {job_id}/
 *     manual-pack.json       ← structured manifest (this module)
 *     article.md             ← generated content
 *     seo-report.json        ← SEO/GEO Ready Score
 *     publish-summary.json   ← per-platform publish attempt results
 *     rank-baseline.json    ← baseline rank snapshot
 *     instructions.md        ← human-readable step-by-step guide
 *     checklist.md          ← operator checklist
 *
 * Output: packagePath (string) written to disk.
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  MarketingJob,
  NormalizedContext,
  PublishSummary,
  SeoReadyScoreDetail,
  RunRecord,
} from './job-types';
import type { RankSnapshot } from './adapters/seo-snapshot';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ManualPackManifest {
  version: 'v1';
  jobId: string;
  runId: string;
  generatedAt: string;
  primaryKeyword: string;
  publishMode: string;
  channels: string[];
  packagePath: string;
  contents: ManualPackFile[];
  /** Human-readable instructions (markdown) */
  instructions: string;
  /** Operator checklist (markdown) */
  checklist: string;
  /** SEO score at time of pack generation */
  seoReadyScore?: SeoReadyScoreDetail;
  /** Publish summary (null if pack generated before publish step) */
  publishSummary?: PublishSummary | null;
  /** Baseline rank snapshot (null if generated before baseline step) */
  rankBaseline?: RankSnapshot | null;
  complianceStatus: 'approved' | 'warning' | 'blocked';
  complianceNotes: string[];
}

export interface ManualPackFile {
  fileName: string;
  description: string;
  path: string;
  sizeBytes: number;
  hash?: string;
}

export interface ManualPackInstructions {
  steps: ManualPackStep[];
  estimatedMinutes: number;
  tips: string[];
}

export interface ManualPackStep {
  order: number;
  action: string;
  detail: string;
  codeSnippet?: string;
  screenshotHint?: string;
}

export interface ManualPackChecklistItem {
  id: string;
  label: string;
  required: boolean;
  hint?: string;
}

export interface GenerateManualPackOptions {
  job: MarketingJob;
  context: NormalizedContext;
  /** Content markdown (article body) */
  articleMarkdown: string;
  /** SEO report (from seo_geo_gate step) */
  seoReport?: SeoReadyScoreDetail;
  /** Publish summary (from publish_drafts step — null if skipped or not yet run) */
  publishSummary?: PublishSummary | null;
  /** Baseline rank snapshot (from baseline_snapshot step) */
  rankBaseline?: RankSnapshot | null;
  /** Pipeline run record */
  runRecord?: RunRecord;
  /** Custom output directory override */
  outputDir?: string;
  /** Compliance notes from content generation */
  complianceNotes?: string[];
}

// ── Main entry point ─────────────────────────────────────────────────────────

/**
 * Generate a complete manual publish package.
 * Writes all files to disk and returns the manifest.
 */
export function generateManualPack(
  options: GenerateManualPackOptions
): ManualPackManifest {
  const {
    job,
    context,
    articleMarkdown,
    seoReport,
    publishSummary,
    rankBaseline,
    runRecord,
    outputDir,
    complianceNotes = [],
  } = options;

  const runId = runRecord?.runId ?? `manual-${Date.now()}`;
  const baseDir = outputDir ?? `/tmp/marketing-pipeline/manual-packs/${job.job_id}`;
  const runDir = join(baseDir, runId);

  mkdirSync(runDir, { recursive: true });

  // ── 1. Write article.md ────────────────────────────────────────────────
  const articlePath = join(runDir, 'article.md');
  writeFileSync(articlePath, articleMarkdown, 'utf-8');

  // ── 2. Write seo-report.json ────────────────────────────────────────────
  let seoReportPath: string | undefined;
  if (seoReport) {
    seoReportPath = join(runDir, 'seo-report.json');
    writeFileSync(seoReportPath, JSON.stringify(seoReport, null, 2), 'utf-8');
  }

  // ── 3. Write publish-summary.json ───────────────────────────────────────
  let publishSummaryPath: string | undefined;
  if (publishSummary !== undefined) {
    publishSummaryPath = join(runDir, 'publish-summary.json');
    writeFileSync(publishSummaryPath, JSON.stringify(publishSummary, null, 2), 'utf-8');
  }

  // ── 4. Write rank-baseline.json ─────────────────────────────────────────
  let rankBaselinePath: string | undefined;
  if (rankBaseline) {
    rankBaselinePath = join(runDir, 'rank-baseline.json');
    writeFileSync(rankBaselinePath, JSON.stringify(rankBaseline, null, 2), 'utf-8');
  }

  // ── 5. Write instructions.md ────────────────────────────────────────────
  const instructions = buildInstructions(options, publishSummary, runDir);
  const instructionsPath = join(runDir, 'instructions.md');
  writeFileSync(instructionsPath, instructions, 'utf-8');

  // ── 6. Write checklist.md ──────────────────────────────────────────────
  const checklist = buildChecklist(options, publishSummary, complianceNotes);
  const checklistPath = join(runDir, 'checklist.md');
  writeFileSync(checklistPath, checklist, 'utf-8');

  // ── 7. Write manifest ───────────────────────────────────────────────────
  const contents: ManualPackFile[] = [
    {
      fileName: 'article.md',
      description: 'Generated article content in Markdown format',
      path: articlePath,
      sizeBytes: Buffer.byteLength(articleMarkdown, 'utf-8'),
    },
    ...(seoReportPath
      ? [{
          fileName: 'seo-report.json',
          description: 'SEO/GEO Ready Score report',
          path: seoReportPath,
          sizeBytes: Buffer.byteLength(JSON.stringify(seoReport), 'utf-8'),
        }]
      : []),
    ...(publishSummaryPath
      ? [{
          fileName: 'publish-summary.json',
          description: 'Per-platform publish attempt summary',
          path: publishSummaryPath,
          sizeBytes: Buffer.byteLength(JSON.stringify(publishSummary), 'utf-8'),
        }]
      : []),
    ...(rankBaselinePath
      ? [{
          fileName: 'rank-baseline.json',
          description: 'Baseline keyword rank snapshot',
          path: rankBaselinePath,
          sizeBytes: Buffer.byteLength(JSON.stringify(rankBaseline), 'utf-8'),
        }]
      : []),
    {
      fileName: 'instructions.md',
      description: 'Step-by-step publish instructions for operators',
      path: instructionsPath,
      sizeBytes: Buffer.byteLength(instructions, 'utf-8'),
    },
    {
      fileName: 'checklist.md',
      description: 'Operator checklist before final publish',
      path: checklistPath,
      sizeBytes: Buffer.byteLength(checklist, 'utf-8'),
    },
  ];

  const manifest: ManualPackManifest = {
    version: 'v1',
    jobId: job.job_id,
    runId,
    generatedAt: new Date().toISOString(),
    primaryKeyword: context.primaryKeyword,
    publishMode: context.publishMode,
    channels: context.channels,
    packagePath: runDir,
    contents,
    instructions: buildInstructions(options, publishSummary, runDir),
    checklist: buildChecklist(options, publishSummary, complianceNotes),
    seoReadyScore: seoReport,
    publishSummary: publishSummary ?? null,
    rankBaseline: rankBaseline ?? null,
    complianceStatus: complianceNotes.length === 0 ? 'approved' : 'warning',
    complianceNotes,
  };

  const manifestPath = join(runDir, 'manual-pack.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  return manifest;
}

// ── Instructions builder ─────────────────────────────────────────────────────

function buildInstructions(
  options: GenerateManualPackOptions,
  publishSummary: PublishSummary | null | undefined,
  runDir: string,
): string {
  const { job, context, articleMarkdown, rankBaseline } = options;

  const titleMatch = articleMarkdown.match(/^#\s+(.+)$/m);
  const articleTitle = titleMatch?.[1]?.trim() ?? context.primaryKeyword;

  const lines: string[] = [
    `# 手动发布说明 — ${articleTitle}`,
    ``,
    `> 生成时间: ${new Date().toLocaleString('zh-CN')}  |  Job: ${job.job_id}  |  Run: ${runDir}`,
    ``,
    `## 背景`,
    ``,
    `本套餐由荣旺健康 AI 营销流水线自动生成（manual_package 模式）。`,
    `内容已通过 SEO/GEO Ready Score 评估，需人工审核后发布至以下平台：`,
    ``,
    ...context.channels.map((ch) => `  - **${ch}**`),
    ``,
    `## 发布步骤`,
    ``,
    `### Step 1 — 审核文章内容`,
    ``,
    `打开 article.md，逐段检查以下内容：`,
    ``,
    `  - [ ] 标题与关键词一致，无夸大宣传`,
    `  - [ ] 含有"本内容仅供健康教育参考，不构成医学建议"免责条款`,
    `  - [ ] 无治愈/治疗/诊断等违规表述`,
    `  - [ ] CTA 链接正确（https://rongwang.hk/ai-consult）`,
    `  - [ ] 产品提及有科学依据支撑`,
    ``,
    `### Step 2 — SEO 自检`,
    ``,
    `使用 SEO 工具检查 article.md 内容：`,
    ``,
    `  - [ ] 关键词出现在 H1、前 100 字、H2 小标题`,
    `  - [ ] 图片含 alt 属性`,
    `  - [ ] 有 2+ 条内链（指向官网相关页面）`,
    `  - [ ] 字数 ≥ ${context.maxWords} 字`,
    ``,
  ];

  if (publishSummary) {
    lines.push(`### Step 3 — 查看自动发布结果`, ``);
    lines.push(`publish-summary.json 显示各平台自动发布情况：`, ``);
    lines.push(`  - 成功: ${publishSummary.succeeded.join(', ') || '无'}`, ``);
    lines.push(`  - 失败: ${publishSummary.failed.join(', ') || '无'}`, ``);
    lines.push(`  - 跳过: ${publishSummary.authMissing.join(', ') || '无'}`, ``);
    lines.push(``);
    if (publishSummary.partialSuccess) {
      lines.push(`⚠️ 部分平台发布成功，请手动完成其余平台。`, ``);
    }
  }

  if (rankBaseline) {
    lines.push(`### Step 4 — 记录基线排名`, ``);
    lines.push(``);
    lines.push(`在发布前记录当前关键词排名，后续用于效果追踪：`, ``);
    lines.push(``);
    lines.push(`关键词: **${rankBaseline.keyword}**`, ``);
    lines.push(`数据来源: ${rankBaseline.source}`, ``);
    lines.push(`排名数量: ${rankBaseline.positions.length} 条`, ``);
    if (rankBaseline.avgPosition) {
      lines.push(`平均排名: ${rankBaseline.avgPosition}`, ``);
    }
    lines.push(``);
    lines.push(`建议用表格记录，便于对比发布后的变化。`, ``);
  }

  // Per-channel instructions
  for (const channel of context.channels) {
    lines.push(...getChannelInstructions(channel));
  }

  lines.push(`## 完成后`, ``);
  lines.push(``);
  lines.push(`1. 将 article.md 原始文件存档至 \`/tmp/marketing-pipeline/evidence/${job.job_id}/\``, ``);
  lines.push(`2. 将发布链接填入运营表格（飞书文档）`, ``);
  lines.push(`3. 如有异常，在 #内容运营 群反馈`, ``);

  return lines.join('\n');
}

function getChannelInstructions(channel: string): string[] {
  switch (channel) {
    case 'wechat':
      return [
        `### Step N+1 — 微信公众号发布`,
        ``,
        `1. 登录微信公众平台: https://mp.weixin.qq.com`,
        `2. 进入「内容与编辑」→「图文消息」→「新建图文消息」`,
        `3. 将 article.md 内容粘贴至编辑器`,
        `4. 配图：使用 article/ 目录下的图片（如有）`,
        `5. 填写摘要（自动从文章提取）`,
        `6. 设置标签：AI健康、健康教育`,
        `7. 点击「保存」→「预览」→ 确认无误后「群发」`,
        ``,
        `> 注意：草稿模式下可在"保存"后选择"存入草稿箱"，无需立即群发`,
        ``,
      ];
    case 'zhihu':
      return [
        `### Step N+1 — 知乎发布`,
        ``,
        `1. 登录知乎创作者中心: https://zhuanlan.zhihu.com/write`,
        `2. 新建文章，标题与 article.md H1 保持一致`,
        `3. 将 article.md 内容粘贴至编辑器（知乎支持 Markdown）`,
        `4. 添加话题标签：健康、健康教育、营养学`,
        `5. 设置文章类型为"知乎专栏"`,
        `6. 点击「发布」`,
        ``,
      ];
    case 'xiaohongshu':
      return [
        `### Step N+1 — 小红书发布`,
        ``,
        `1. 登录小红书创作者中心: https://creator.xiaohongshu.com`,
        `2. 新建笔记，标题限制 20 字内（可使用 article.md H1 精简版）`,
        `3. 正文限制 1000 字，将 article.md 内容精简后发布`,
        `4. 配图：使用文章相关图片（需自行准备）`,
        `5. 添加话题标签：#健康教育 #营养补充 #AI健康评估`,
        `6. 点击「发布」`,
        ``,
      ];
    case 'toutiao':
      return [
        `### Step N+1 — 今日头条发布`,
        ``,
        `1. 登录头条号后台: https://mp.toutiao.com`,
        `2. 新建文章，标题与 H1 一致`,
        `3. 将 article.md 内容粘贴发布`,
        `4. 设置分类：健康 > 健康教育`,
        `5. 申请原创标签（如适用）`,
        `6. 点击「发布」`,
        ``,
      ];
    default:
      return [
        `### Step N+1 — ${channel} 发布`,
        ``,
        `1. 登录 ${channel} 平台`,
        `2. 将 article.md 内容发布为新文章`,
        `3. 标记发布完成`,
        ``,
      ];
  }
}

// ── Checklist builder ────────────────────────────────────────────────────────

function buildChecklist(
  options: GenerateManualPackOptions,
  publishSummary: PublishSummary | null | undefined,
  complianceNotes: string[],
): string {
  const { job, context, seoReport } = options;

  const lines: string[] = [
    `# 发布前核查清单 — ${job.job_id}`,
    ``,
    `> 生成时间: ${new Date().toLocaleString('zh-CN')}`,
    ``,
    `## 内容合规`,
    ``,
    `  [ ] 文章包含健康教育免责声明`,
    `  [ ] 无"治愈/治疗/诊断"等违规表述`,
    `  [ ] 无"100%有效/保证/永久"等夸大表述`,
    `  [ ] 营养补充剂描述为"辅助/参考"而非"治疗"`,
    `  [ ] 严重症状建议就医（内容中有体现）`,
    ``,
  ];

  if (seoReport) {
    lines.push(`## SEO 质量（目标分数: ${seoReport.total}/100）`, ``);
    lines.push(`  [ ] H1 包含关键词 "${context.primaryKeyword}"`, ``);
    lines.push(`  [ ] 字数达标（目标 ≥ ${context.maxWords} 字）`, ``);
    if (seoReport.internal_links_cta === 0) {
      lines.push(`  [ ] 添加内链 CTA（当前: 无）`, ``);
    }
    lines.push(``);
  }

  if (publishSummary) {
    lines.push(`## 平台发布状态`, ``);
    for (const ch of context.channels) {
      const succeeded = publishSummary.succeeded.includes(ch as never);
      const failed = publishSummary.failed.includes(ch as never);
      const authMissing = publishSummary.authMissing.includes(ch as never);
      const status = succeeded ? '✅ 已自动发布' : failed ? '❌ 失败' : authMissing ? '⚠️ 需认证' : '⏳ 待手动';
      lines.push(`  [ ] ${ch}: ${status}`, ``);
    }
    lines.push(``);
  }

  if (complianceNotes.length > 0) {
    lines.push(`## 合规注意事项`, ``);
    for (const note of complianceNotes) {
      lines.push(`  ⚠️ ${note}`, ``);
    }
    lines.push(``);
  }

  lines.push(`## 追踪`, ``);
  lines.push(`  [ ] 记录发布链接`, ``);
  lines.push(`  [ ] 记录发布时间`, ``);
  lines.push(`  [ ] 设置 7 天后排名复盘提醒`, ``);

  return lines.join('\n');
}

// ── Utility: read a pack manifest ───────────────────────────────────────────

/**
 * Read a previously generated pack manifest.
 */
export function readManualPack(jobId: string, runId: string): ManualPackManifest | null {
  try {
    const path = `/tmp/marketing-pipeline/manual-packs/${jobId}/${runId}/manual-pack.json`;
    if (!existsSync(path)) return null;
    const { readFileSync } = require('fs');
    return JSON.parse(readFileSync(path, 'utf-8')) as ManualPackManifest;
  } catch {
    return null;
  }
}