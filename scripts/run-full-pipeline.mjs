#!/usr/bin/env node
/**
 * 一辉智能体 · 图像流水线一键编排
 *
 * 运行步骤：
 *   1. 探 /image 端点是否就绪
 *   2. 跑一张测试图（test.png）
 *   3. 批量生成 image-prompts.json 里的全部图
 *   4. 读取 manifest，把 public/index.html 里的 emoji 占位符换成真图
 *
 * 用法: node scripts/run-full-pipeline.mjs
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MCP_URL = process.env.AI_MCP_URL || 'http://43.160.251.191:8787';
const MCP_SECRET = process.env.AI_MCP_SECRET || 'rw-health-2024';

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
  });
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  一辉智能体 · 图像流水线');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// --- 1. 探端点 ---
console.log('▶ Step 1/4  探测 /image 端点');
const probe = await fetch(`${MCP_URL}/`).then((r) => r.json()).catch(() => null);
const endpoints = probe?.available || [];
const hasImage = endpoints.some((e) => e.includes('/image'));
if (!hasImage) {
  console.error(`\n❌ /image 端点未上线`);
  console.error(`   现有端点: ${endpoints.join(', ')}`);
  console.error(`\n  请先在网关服务器执行:`);
  console.error(`    1) 合并 scripts/gateway-image-patch.js 到 server.js`);
  console.error(`    2) 重启网关进程`);
  console.error(`  详见 scripts/DEPLOY-IMAGE-ENDPOINT.md\n`);
  process.exit(2);
}
console.log('   ✓ /image 端点已就绪\n');

// --- 2. test image ---
console.log('▶ Step 2/4  跑测试图');
await run('node', ['scripts/test-image-endpoint.mjs']);

// --- 3. batch ---
console.log('\n▶ Step 3/4  批量生成全部图');
await run('node', ['scripts/generate-images.mjs']);

// --- 4. 读 manifest + 改 HTML ---
console.log('\n▶ Step 4/4  把 HTML 里的 emoji 占位符换成真图');
const manifestPath = path.join(ROOT, 'public', 'img', 'manifest.json');
const htmlPath = path.join(ROOT, 'public', 'index.html');
if (!fs.existsSync(manifestPath)) {
  console.error('   ❌ manifest.json 未生成');
  process.exit(3);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let html = fs.readFileSync(htmlPath, 'utf8');
const img = (id) => manifest.images?.[id]?.file;

// 替换规则 — 每个规则: { match, replacement, id }
const swaps = [
  // Hero 仪表盘区域: 保留 (非 emoji)
  // 方案卡 4 张 — 替换 <div class="text-5xl mb-4">⚡</div> 等
  img('scene-fatigue') && {
    id: 'scene-fatigue',
    match: /<div class="text-5xl mb-4">⚡<\/div>/,
    replacement: `<div class="aspect-[4/3] -mx-7 -mt-7 mb-5 overflow-hidden rounded-t-3xl"><img src="${img('scene-fatigue')}" alt="抗疲劳场景" class="w-full h-full object-cover"></div>`,
  },
  img('scene-sleep') && {
    id: 'scene-sleep',
    match: /<div class="text-5xl mb-4">🌙<\/div>/,
    replacement: `<div class="aspect-[4/3] -mx-7 -mt-7 mb-5 overflow-hidden rounded-t-3xl"><img src="${img('scene-sleep')}" alt="深度睡眠场景" class="w-full h-full object-cover"></div>`,
  },
  img('scene-immune') && {
    id: 'scene-immune',
    match: /<div class="text-5xl mb-4">🛡️<\/div>/,
    replacement: `<div class="aspect-[4/3] -mx-7 -mt-7 mb-5 overflow-hidden rounded-t-3xl"><img src="${img('scene-immune')}" alt="免疫防护场景" class="w-full h-full object-cover"></div>`,
  },
  img('scene-stress') && {
    id: 'scene-stress',
    match: /<div class="text-5xl mb-4">🧘<\/div>/,
    replacement: `<div class="aspect-[4/3] -mx-7 -mt-7 mb-5 overflow-hidden rounded-t-3xl"><img src="${img('scene-stress')}" alt="压力缓解场景" class="w-full h-full object-cover"></div>`,
  },
  // 明星产品 3 张
  img('prod-bcomplex') && {
    id: 'prod-bcomplex',
    match: /<div class="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-8xl">⚡<\/div>/,
    replacement: `<div class="aspect-square overflow-hidden"><img src="${img('prod-bcomplex')}" alt="活性 B 族" class="w-full h-full object-cover"></div>`,
  },
  img('prod-magnesium') && {
    id: 'prod-magnesium',
    match: /<div class="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-8xl">🌙<\/div>/,
    replacement: `<div class="aspect-square overflow-hidden"><img src="${img('prod-magnesium')}" alt="甘氨酸镁" class="w-full h-full object-cover"></div>`,
  },
  img('prod-ashwagandha') && {
    id: 'prod-ashwagandha',
    match: /<div class="aspect-square bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-8xl">🧘<\/div>/,
    replacement: `<div class="aspect-square overflow-hidden"><img src="${img('prod-ashwagandha')}" alt="南非醉茄" class="w-full h-full object-cover"></div>`,
  },
  // 证言头像 3 张
  img('avatar-lin') && {
    id: 'avatar-lin',
    match: /<div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 text-white flex items-center justify-center font-bold">林<\/div>/,
    replacement: `<img src="${img('avatar-lin')}" alt="林小姐" class="w-10 h-10 rounded-full object-cover">`,
  },
  img('avatar-chen') && {
    id: 'avatar-chen',
    match: /<div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white flex items-center justify-center font-bold">陈<\/div>/,
    replacement: `<img src="${img('avatar-chen')}" alt="陈先生" class="w-10 h-10 rounded-full object-cover">`,
  },
  img('avatar-huang') && {
    id: 'avatar-huang',
    match: /<div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 text-white flex items-center justify-center font-bold">黄<\/div>/,
    replacement: `<img src="${img('avatar-huang')}" alt="黄女士" class="w-10 h-10 rounded-full object-cover">`,
  },
].filter(Boolean);

// Hero 背景 — 加一个 <img> 作为绝对定位背景
if (img('hero-bg-1')) {
  html = html.replace(
    /<section class="relative overflow-hidden pt-20 pb-32">\s*<div class="blob/,
    `<section class="relative overflow-hidden pt-20 pb-32"><img src="${img('hero-bg-1')}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" /><div class="blob`,
  );
}

let hits = 0;
for (const swap of swaps) {
  if (swap.match.test(html)) {
    html = html.replace(swap.match, swap.replacement);
    hits++;
    console.log(`   ✓ ${swap.id}`);
  } else {
    console.log(`   ⚠ ${swap.id} — 占位符未找到，跳过`);
  }
}

const backup = htmlPath + '.bak';
if (!fs.existsSync(backup)) fs.copyFileSync(htmlPath, backup);
fs.writeFileSync(htmlPath, html);
console.log(`\n   写入 ${htmlPath} (${hits} 处替换)  备份: ${backup}`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  ✅ 全流水线完成`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  图像: public/img/`);
console.log(`  落地页: public/index.html  (打开浏览器预览)`);
console.log(`  manifest: public/img/manifest.json`);
