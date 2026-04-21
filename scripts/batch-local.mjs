#!/usr/bin/env node
/**
 * 一辉智能体 · 本地双引擎串行生产
 *
 * MiniMax 暂时 520，切换到本地引擎：
 *   💪 Copilot Pro (localhost:4141) — 中英文内容 + 代码
 *   🏠 Qwen3-Coder (localhost:11434) — 前端组件代码
 *
 * 在用户本地 PowerShell 运行: node scripts/batch-local.mjs
 */

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const COPILOT = 'http://localhost:4141';
const OLLAMA  = 'http://localhost:11434';

// ─── Copilot 调用 ────────────────────────────────────
async function askCopilot(prompt, { model = 'gpt-4o', system, maxTokens = 2000, timeout = 90000 } = {}) {
  const t0 = Date.now();
  try {
    const msgs = [];
    if (system) msgs.push({ role: 'system', content: system });
    msgs.push({ role: 'user', content: prompt });

    const res = await fetch(`${COPILOT}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: msgs, max_tokens: maxTokens, temperature: 0.75 }),
      signal: AbortSignal.timeout(timeout),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { ok: !!text, text, model: data.model || model, elapsed: Date.now() - t0 };
  } catch (e) {
    return { ok: false, text: '', error: e.message, elapsed: Date.now() - t0 };
  }
}

// ─── Ollama Qwen3 调用 ──────────────────────────────
async function askQwen(prompt, { model = 'qwen3-coder:30b', maxTokens = 2000, timeout = 120000 } = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${OLLAMA}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false, options: { num_predict: maxTokens, temperature: 0.7 } }),
      signal: AbortSignal.timeout(timeout),
    });
    const data = await res.json();
    const text = data.response || '';
    return { ok: !!text, text, model, elapsed: Date.now() - t0 };
  } catch (e) {
    return { ok: false, text: '', error: e.message, elapsed: Date.now() - t0 };
  }
}

// ─── 工具 ────────────────────────────────────────────
function log(icon, msg) { console.log(`  ${icon} ${msg}`); }
function section(title) { console.log(`\\n${'═'.repeat(56)}\\n  ${title}\\n${'═'.repeat(56)}`); }

async function saveFile(relPath, content) {
  const full = join(ROOT, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, content, 'utf-8');
  log('💾', relPath);
}

// 串行执行，每个任务间隔1秒，避免过载
async function runSerial(tasks) {
  const results = [];
  for (const task of tasks) {
    const r = await task();
    results.push(r);
    await new Promise(ok => setTimeout(ok, 1000));
  }
  return results;
}

// ═══════════════════════════════════════════════════════
console.log('\\n🧠 大脑指挥 · 本地双引擎串行生产\\n');

const stats = { copilot: 0, qwen: 0, fail: 0 };

// ─── 第1组：Copilot 生成中文 SEO 文章 ────────────────
section('💪 Copilot → 5 篇中文 SEO 文章');

const seoArticles = [
  { slug: 'coq10-energy-guide', title: '辅酶Q10：线粒体的能量引擎', keyword: '辅酶Q10功效' },
  { slug: 'magnesium-sleep-science', title: '镁与睡眠：最被低估的矿物质', keyword: '镁助眠' },
  { slug: 'vitamin-d-immune-hk', title: '维生素D：香港人最缺的阳光营养素', keyword: '维生素D香港' },
  { slug: 'ashwagandha-stress', title: 'Ashwagandha：古老草本的现代抗压科学', keyword: 'ashwagandha功效' },
  { slug: 'omega3-brain-heart', title: 'Omega-3：大脑与心血管的双重守护', keyword: 'omega3鱼油' },
];

for (const art of seoArticles) {
  log('⏳', `生成: ${art.title}...`);
  const r = await askCopilot(
    `你是跨境保健品SEO专家。写一篇关于「${art.title}」的科普文章。
目标关键词：${art.keyword}
要求：800-1000字，Markdown格式（用##和###），引用2项研究，段落短，结尾引出荣旺健康产品。专业温暖，不夸大。`,
    { model: 'gpt-4o', system: '你是荣旺健康的首席营养科普编辑。', maxTokens: 2000 }
  );

  if (r.ok) {
    const html = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${art.title} | 荣旺健康</title><meta name="keywords" content="${art.keyword},荣旺健康">
<script src="https://cdn.tailwindcss.com"><\/script></head>
<body class="bg-white"><article class="mx-auto max-w-2xl px-6 py-16 prose prose-slate">${r.text}</article>
<div class="mx-auto max-w-2xl px-6 pb-16"><div class="p-6 bg-teal-50 rounded-xl text-center">
<p class="text-teal-800 font-semibold mb-2">找到适合你的方案</p>
<a href="/quiz" class="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold">免费AI健康检测</a>
</div></div></body></html>`;
    await saveFile(`articles/ai-${art.slug}.html`, html);
    log('✅', `${art.slug} (${r.elapsed}ms, ${r.model})`);
    stats.copilot++;
  } else {
    log('❌', `${art.slug}: ${r.error}`);
    stats.fail++;
  }
}

// ─── 第2组：Copilot 生成小红书 ──────────────────────
section('💪 Copilot → 10 条小红书种草文');

const xhsTopics = [
  '打工人下午必崩？B族+辅酶Q10组合',
  '失眠自救：GABA+镁亲测一周见效',
  '换季免疫力拉满的秘密武器',
  '996压力大？适应原草本真管用',
  '香港代购不踩雷的5款保健品',
  '月经期贫血到精力满满的补铁方法',
  '30+抗氧化清单NMN+辅酶Q10',
  '保健品怎么选不交智商税',
  '全家健康方案从三高到免疫力',
  '跨境保健品认准这几个认证',
];

for (let i = 0; i < xhsTopics.length; i++) {
  log('⏳', `小红书 #${i+1}...`);
  const r = await askCopilot(
    `写小红书种草笔记：「${xhsTopics[i]}」。标题≤20字带emoji，正文200-350字第一人称，用emoji分段，结尾5-8个hashtag，自然提荣旺健康。`,
    { model: 'gpt-4o', system: '你是小红书保健品种草达人，25岁女生。', maxTokens: 800 }
  );
  if (r.ok) {
    await saveFile(`output/xiaohongshu/post-${String(i+1).padStart(2,'0')}.md`, r.text);
    log('✅', `#${i+1} (${r.elapsed}ms)`);
    stats.copilot++;
  } else {
    log('❌', `#${i+1}: ${r.error}`);
    stats.fail++;
  }
}

// ─── 第3组：Copilot 英文落地页 ─────────────────────
section('💪 Copilot → 3 个英文 SEO 落地页');

const enPages = [
  { slug: 'women-fatigue', keyword: 'women fatigue supplements HK' },
  { slug: 'deep-sleep', keyword: 'natural sleep supplements Hong Kong' },
  { slug: 'immune-boost', keyword: 'immune booster supplements HK' },
];

for (const p of enPages) {
  log('⏳', `EN: ${p.slug}...`);
  const r = await askCopilot(
    `Write landing page content for Rongwang Health (Hong Kong supplement brand).
Keyword: "${p.keyword}". Output JSON: {metaTitle, metaDescription, hero:{headline,sub,cta}, painPoints:[3], benefits:[3], howItWorks:[{step,title,desc}x3], faqs:[{q,a}x3], finalCta:{headline,cta}}. JSON only.`,
    { model: 'gpt-4o', maxTokens: 2000 }
  );
  if (r.ok) {
    await saveFile(`output/landing-pages/${p.slug}.json`, r.text);
    log('✅', `${p.slug} (${r.elapsed}ms)`);
    stats.copilot++;
  } else {
    log('❌', `${p.slug}: ${r.error}`);
    stats.fail++;
  }
}

// ─── 第4组：Qwen3 生成组件代码 ─────────────────────
section('🏠 Qwen3 → 3 个 React 组件');

const components = [
  { name: 'TestimonialCarousel', desc: '客户评价轮播，3条评价自动滚动，头像+星级+评价文字，品牌色teal-600' },
  { name: 'CountdownBanner', desc: '限时优惠倒计时横幅，传入截止时间，显示天:时:分:秒，渐变背景teal到emerald' },
  { name: 'ProductCompare', desc: '产品对比表格，传入2-3款产品数组，并列对比名称/价格/成分/认证，高亮推荐款' },
];

for (const c of components) {
  log('⏳', `组件: ${c.name}...`);
  const r = await askQwen(
    `Generate a React TypeScript component with Tailwind CSS.
Component: ${c.name}
Function: ${c.desc}
Rules: use "use client", hooks, Tailwind only, no external deps, default export.
Output ONLY the code, no explanation, no markdown fences.`,
    { maxTokens: 2000, timeout: 180000 }
  );
  if (r.ok) {
    let code = r.text.replace(/^```[\\w]*\\n?/m,'').replace(/\\n?```$/m,'').trim();
    // 确保有 "use client"
    if (!code.includes("'use client'") && !code.includes('"use client"')) {
      code = "'use client';\\n\\n" + code;
    }
    await saveFile(`src/components/ui/${c.name}.tsx`, code);
    log('✅', `${c.name} (${r.elapsed}ms, ${r.model})`);
    stats.qwen++;
  } else {
    log('⚠️', `Qwen失败(${r.error})，Copilot降级...`);
    const r2 = await askCopilot(
      `Write React TypeScript + Tailwind component "${c.name}": ${c.desc}. "use client", hooks, default export. Code only.`,
      { model: 'gpt-5.3-codex', maxTokens: 2000 }
    );
    if (r2.ok) {
      let code = r2.text.replace(/^```[\\w]*\\n?/m,'').replace(/\\n?```$/m,'').trim();
      await saveFile(`src/components/ui/${c.name}.tsx`, code);
      log('✅', `${c.name}(降级Copilot) (${r2.elapsed}ms)`);
      stats.copilot++;
    } else {
      log('❌', `${c.name}: 双引擎都失败`);
      stats.fail++;
    }
  }
}

// ═══════════════════════════════════════════════════════
section('📊 生产完成报告');
const total = stats.copilot + stats.qwen;
console.log(`
  💪 Copilot Pro 完成: ${stats.copilot} 项
  🏠 Qwen3-Coder 完成: ${stats.qwen} 项
  ❌ 失败: ${stats.fail} 项
  ───────────────────
  总产出: ${total}/21 项
  Claude token 消耗: 0
`);
