#!/usr/bin/env node
/**
 * 一辉智能体 · 三引擎并行批量生产
 *
 * 大脑(Claude)编排 → 三引擎各司其职：
 *   🇨🇳 MiniMax M2.7  — 中文内容 (SEO文章 / 小红书 / 电商文案)
 *   💪 Copilot Pro    — 英文内容 / 技术文档
 *   🏠 Qwen3-Coder    — 前端组件代码 (HTML/React)
 *
 * 用法: node scripts/batch-build.mjs
 */

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GW = process.env.AI_MCP_URL || 'http://43.160.251.191:8787';
const SECRET = process.env.AI_MCP_SECRET || 'rw-health-2024';

// ─── 网关调用 ────────────────────────────────────────
async function ask(prompt, { engine = 'auto', taskType, model, system, maxTokens = 1500, timeout = 45000 } = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${GW}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SECRET}` },
      body: JSON.stringify({ prompt, engine, taskType, model: model ?? 'MiniMax-M2.7', system, temperature: 0.75, maxTokens }),
      signal: AbortSignal.timeout(timeout),
    });
    const data = await res.json();
    const elapsed = Date.now() - t0;
    if (data.success && data.content) {
      return { ok: true, text: data.content, worker: data.worker, model: data.model, elapsed };
    }
    return { ok: false, error: data.error || 'empty', worker: data.worker, elapsed };
  } catch (e) {
    return { ok: false, error: e.message, elapsed: Date.now() - t0 };
  }
}

// ─── 工具函数 ────────────────────────────────────────
function log(icon, msg) { console.log(`  ${icon} ${msg}`); }
function section(title) { console.log(`\n${'═'.repeat(50)}\n  ${title}\n${'═'.repeat(50)}`); }

async function saveFile(relPath, content) {
  const full = join(ROOT, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, content, 'utf-8');
  log('💾', `已保存 → ${relPath}`);
}

// ─── 任务定义 ────────────────────────────────────────

// 🇨🇳 MiniMax 任务：中文 SEO 文章
const seoArticles = [
  { slug: 'coq10-energy-guide', title: '辅酶Q10：线粒体的能量引擎', keyword: '辅酶Q10功效' },
  { slug: 'magnesium-sleep-science', title: '镁与睡眠：最被低估的矿物质', keyword: '镁助眠' },
  { slug: 'vitamin-d-immune-hk', title: '维生素D：香港人最缺的阳光营养素', keyword: '维生素D 香港' },
  { slug: 'ashwagandha-stress-adaptogens', title: 'Ashwagandha：古老草本的现代抗压科学', keyword: 'ashwagandha功效' },
  { slug: 'omega3-brain-heart', title: 'Omega-3：大脑与心血管的双重守护', keyword: 'omega3鱼油' },
];

// 🇨🇳 MiniMax 任务：小红书种草文
const xhsTopics = [
  '打工人下午3点必崩？试试这个「B族+辅酶Q10」组合',
  '失眠星人自救指南：GABA+镁，亲测一周见效',
  '换季又中招了？免疫力拉满的秘密武器清单',
  '996压力大到头秃？这几个适应原草本真的管用',
  '香港代购不踩雷：这5款保健品我会无限回购',
  '从月经期贫血到精力满满，补铁的正确打开方式',
  '30+姐姐的抗氧化清单｜NMN+辅酶Q10+虾青素',
  '不花冤枉钱！保健品怎么选才不是在交智商税',
  '全家人的健康方案：从爸妈三高到孩子免疫力',
  '跨境保健品避坑：认准这几个认证标志就对了',
];

// 💪 Copilot 任务：英文 SEO 落地页
const englishPages = [
  { slug: 'women-fatigue-solution', title: 'Beat Chronic Fatigue', keyword: 'women fatigue supplements Hong Kong' },
  { slug: 'deep-sleep-formula', title: 'Deep Sleep Formula', keyword: 'natural sleep supplements HK' },
  { slug: 'immune-boost-family', title: 'Family Immune Shield', keyword: 'immune booster supplements Hong Kong' },
];

// 🏠 Qwen3 任务：前端组件
const components = [
  { name: 'TestimonialCarousel', desc: '客户评价轮播组件，3条评价自动滚动，带头像和星级' },
  { name: 'CountdownBanner', desc: '限时优惠倒计时横幅，显示剩余时间，背景渐变动画' },
  { name: 'ProductCompare', desc: '产品对比表格组件，支持2-3款产品并列对比成分和价格' },
];

// ═══════════════════════════════════════════════════════
//  执行
// ═══════════════════════════════════════════════════════

console.log('\n🧠 大脑(Claude) 编排 · 一辉智能体三引擎并行\n');

const results = { seo: [], xhs: [], en: [], code: [] };
const errors = [];

// ─── 第1波：MiniMax 中文 SEO + 小红书（并行） ─────────
section('🇨🇳 MiniMax M2.7 · 中文内容生产');

log('📝', `派发 ${seoArticles.length} 篇 SEO 文章 + ${xhsTopics.length} 条小红书...`);

const wave1 = [];

// SEO 文章
for (const art of seoArticles) {
  wave1.push(
    ask(
      `你是跨境保健品领域的 SEO 专家。写一篇关于「${art.title}」的科普长文。
目标关键词：${art.keyword}
要求：
- 标题含关键词，≤30字
- 正文 800-1200 字，H2/H3 结构清晰
- 引用至少2项临床研究数据
- 段落短（3-4行），适合手机阅读
- 结尾自然引出荣旺健康的对应产品
- 语气专业温暖，不要夸大功效
- 输出格式：先输出 TITLE: 标题，然后空行，再输出正文（Markdown格式）`,
      { engine: 'minimax', taskType: 'seo', maxTokens: 2000, timeout: 60000 }
    ).then(r => {
      if (r.ok) { log('✅', `SEO: ${art.slug} (${r.elapsed}ms via ${r.worker})`); results.seo.push({ ...art, content: r.text }); }
      else { log('❌', `SEO: ${art.slug} — ${r.error}`); errors.push(`seo:${art.slug}`); }
    })
  );
}

// 小红书（5条一批，避免过载）
for (let i = 0; i < xhsTopics.length; i++) {
  wave1.push(
    ask(
      `你是小红书保健品种草达人。写一篇关于「${xhsTopics[i]}」的种草笔记。
要求：
- 标题 ≤20字，带 emoji，有悬念感
- 正文 200-400 字，第一人称真实分享
- 用 emoji 分段，口语化
- 结尾 5-8 个 hashtag
- 引导收藏和关注
- 自然提及荣旺健康品牌`,
      { engine: 'minimax', taskType: 'xiaohongshu', maxTokens: 800, timeout: 45000 }
    ).then(r => {
      if (r.ok) { log('✅', `小红书 #${i+1} (${r.elapsed}ms)`); results.xhs.push({ index: i, topic: xhsTopics[i], content: r.text }); }
      else { log('❌', `小红书 #${i+1} — ${r.error}`); errors.push(`xhs:${i}`); }
    })
  );
}

await Promise.all(wave1);

// ─── 第2波：Copilot 英文 + Qwen3 代码（并行） ────────
section('💪 Copilot Pro · 英文内容 + 🏠 Qwen3 · 组件代码');

const wave2 = [];

// Copilot: 英文 SEO 页面
for (const page of englishPages) {
  wave2.push(
    ask(
      `You are an SEO copywriter for a Hong Kong health supplement brand "Rongwang Health".
Write a landing page for "${page.title}".
Target keyword: "${page.keyword}"
Requirements:
- Meta title (≤60 chars) + meta description (≤155 chars)
- Hero section: headline + subheadline + CTA text
- 3 pain points the audience faces
- Solution section with 3 bullet benefits
- How it works (3 steps)
- 3 FAQs with answers
- Final CTA section
Output as JSON with fields: metaTitle, metaDescription, hero{headline,subheadline,cta}, painPoints[3], solution{title,bullets[3]}, howItWorks[3]{step,title,desc}, faqs[3]{q,a}, finalCta{headline,cta}`,
      { engine: 'copilot', taskType: 'english', model: 'gpt-4o', maxTokens: 2000, timeout: 60000 }
    ).then(r => {
      if (r.ok) { log('✅', `EN: ${page.slug} (${r.elapsed}ms via ${r.worker})`); results.en.push({ ...page, content: r.text }); }
      else { log('⚠️', `EN: ${page.slug} — ${r.error}，尝试 MiniMax 降级...`);
        // 降级到 MiniMax
        return ask(`Write a landing page JSON for "${page.title}" targeting "${page.keyword}" for a Hong Kong health supplement brand. Output JSON with: metaTitle, metaDescription, hero, painPoints, solution, howItWorks, faqs, finalCta.`,
          { engine: 'minimax', maxTokens: 2000, timeout: 60000 }
        ).then(r2 => {
          if (r2.ok) { log('✅', `EN(降级): ${page.slug} (${r2.elapsed}ms)`); results.en.push({ ...page, content: r2.text }); }
          else { errors.push(`en:${page.slug}`); }
        });
      }
    })
  );
}

// Qwen3: React 组件
for (const comp of components) {
  wave2.push(
    ask(
      `生成一个 React + Tailwind CSS 组件「${comp.name}」。
功能：${comp.desc}
要求：
- TypeScript，函数组件 + hooks
- 使用 Tailwind CSS 样式
- 品牌色用 teal-600 和 orange-500
- 无外部依赖，自包含
- 导出为 default export
只输出代码，不要解释。`,
      { engine: 'qwen', taskType: 'code', maxTokens: 1500, timeout: 60000 }
    ).then(r => {
      if (r.ok) { log('✅', `组件: ${comp.name} (${r.elapsed}ms via ${r.worker})`); results.code.push({ ...comp, content: r.text }); }
      else { log('⚠️', `组件: ${comp.name} — ${r.error}，尝试 Copilot 降级...`);
        return ask(`Generate a React + TypeScript + Tailwind component "${comp.name}": ${comp.desc}. Brand colors: teal-600, orange-500. Export default. Code only.`,
          { engine: 'copilot', model: 'gpt-5.3-codex', maxTokens: 1500, timeout: 60000 }
        ).then(r2 => {
          if (r2.ok) { log('✅', `组件(降级): ${comp.name} (${r2.elapsed}ms)`); results.code.push({ ...comp, content: r2.text }); }
          else { errors.push(`code:${comp.name}`); }
        });
      }
    })
  );
}

await Promise.all(wave2);

// ═══════════════════════════════════════════════════════
//  保存产出
// ═══════════════════════════════════════════════════════
section('💾 保存生成内容');

// SEO 文章 → articles/ai-generated/
for (const art of results.seo) {
  const lines = art.content.split('\n');
  const titleLine = lines.find(l => l.startsWith('TITLE:')) || '';
  const title = titleLine.replace('TITLE:', '').trim() || art.title;
  const body = art.content.replace(/^TITLE:.*\n?/, '').trim();

  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | 荣旺健康</title>
<meta name="description" content="${title} — 荣旺健康科普专栏">
<meta name="keywords" content="${art.keyword},荣旺健康,保健品">
<link rel="stylesheet" href="https://cdn.tailwindcss.com">
</head>
<body class="bg-white text-slate-800 font-sans">
<article class="mx-auto max-w-2xl px-6 py-16">
<h1 class="text-3xl font-bold mb-6">${title}</h1>
<div class="prose prose-slate max-w-none leading-relaxed">
${body.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('\n')}
</div>
<div class="mt-12 p-6 bg-teal-50 rounded-xl text-center">
<p class="text-teal-800 font-semibold mb-2">想了解更多？</p>
<a href="/quiz" class="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700">免费 AI 健康检测</a>
</div>
</article>
</body></html>`;

  await saveFile(`articles/ai-${art.slug}.html`, html);
}

// 小红书 → output/xiaohongshu/
for (const xhs of results.xhs) {
  await saveFile(`output/xiaohongshu/post-${String(xhs.index + 1).padStart(2, '0')}.md`, xhs.content);
}

// 英文落地页 → output/landing-pages/
for (const page of results.en) {
  await saveFile(`output/landing-pages/${page.slug}.json`, page.content);
}

// React 组件 → src/components/ui/
for (const comp of results.code) {
  let code = comp.content;
  // 清理 markdown code block
  code = code.replace(/^```(?:tsx?|jsx?|react)?\n?/m, '').replace(/\n?```$/m, '').trim();
  await saveFile(`src/components/ui/${comp.name}.tsx`, code);
}

// ═══════════════════════════════════════════════════════
//  汇总报告
// ═══════════════════════════════════════════════════════
section('📊 任务完成报告');

console.log(`
  🇨🇳 MiniMax — SEO文章: ${results.seo.length}/${seoArticles.length} | 小红书: ${results.xhs.length}/${xhsTopics.length}
  💪 Copilot — 英文页面: ${results.en.length}/${englishPages.length}
  🏠 Qwen3   — 组件代码: ${results.code.length}/${components.length}
  ❌ 失败任务: ${errors.length > 0 ? errors.join(', ') : '无'}

  总计生成: ${results.seo.length + results.xhs.length + results.en.length + results.code.length} 项内容
  Claude 主线 token 消耗: 0 (全走一辉智能体)
`);
