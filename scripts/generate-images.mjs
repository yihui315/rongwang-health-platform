#!/usr/bin/env node
/**
 * 一辉智能体 · 图像批量生成器
 *
 * 用法：
 *   1. 在本机设环境变量 MINIMAX_API_KEY=你的key（在 https://platform.minimaxi.com 拿）
 *   2. node scripts/generate-images.mjs                  # 跑全部
 *   3. node scripts/generate-images.mjs hero scene_cards # 只跑指定分组
 *   4. node scripts/generate-images.mjs --id hero-bg-1   # 只跑单个 prompt
 *
 * 输出：public/img/<id>.png（同时把所有结果写到 public/img/manifest.json）
 *
 * 文档：https://platform.minimax.io/docs/guides/image-generation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROMPTS_FILE = path.join(__dirname, 'image-prompts.json');
const OUT_DIR = path.join(ROOT, 'public', 'img');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');

const API_KEY = process.env.MINIMAX_API_KEY;
const API_URL = 'https://api.minimax.io/v1/image_generation';
const MODEL = 'image-01';

if (!API_KEY) {
  console.error('❌ 缺少 MINIMAX_API_KEY 环境变量');
  console.error('   设置方法：export MINIMAX_API_KEY=你的key');
  console.error('   获取地址：https://platform.minimaxi.com');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));

// CLI 参数解析
const args = process.argv.slice(2);
const filterId = args.includes('--id') ? args[args.indexOf('--id') + 1] : null;
const filterGroups = args.filter((a) => !a.startsWith('--') && a !== filterId);

// 收集要跑的任务
const tasks = [];
for (const [group, items] of Object.entries(prompts)) {
  if (group.startsWith('_')) continue;
  if (filterGroups.length > 0 && !filterGroups.includes(group)) continue;
  if (!Array.isArray(items)) continue;
  for (const item of items) {
    if (filterId && item.id !== filterId) continue;
    tasks.push({ ...item, group });
  }
}

if (tasks.length === 0) {
  console.error('❌ 没有匹配的任务');
  process.exit(1);
}

console.log(`📸 开始生成 ${tasks.length} 张图像...\n`);

const negative =
  prompts._meta?.negative ??
  'no text, no logo, no watermark, no busy clutter';

async function generateOne(task) {
  const fullPrompt = `${task.prompt}. AVOID: ${negative}.`;
  const body = {
    model: MODEL,
    prompt: fullPrompt,
    aspect_ratio: task.aspect_ratio || '1:1',
    response_format: 'base64',
    n: 1,
    prompt_optimizer: true,
  };

  const t0 = Date.now();
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  const elapsed = Date.now() - t0;
  const json = await res.json();

  if (!res.ok || json?.base_resp?.status_code !== 0) {
    return {
      id: task.id,
      group: task.group,
      ok: false,
      elapsed,
      error: json?.base_resp?.status_msg || `HTTP ${res.status}`,
    };
  }

  const b64Arr = json?.data?.image_base64;
  if (!b64Arr || b64Arr.length === 0) {
    return { id: task.id, group: task.group, ok: false, elapsed, error: 'empty image_base64' };
  }

  const buf = Buffer.from(b64Arr[0], 'base64');
  const fileName = `${task.id}.png`;
  const filePath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(filePath, buf);

  return {
    id: task.id,
    group: task.group,
    purpose: task.purpose,
    aspect_ratio: task.aspect_ratio,
    file: `/img/${fileName}`,
    bytes: buf.length,
    ok: true,
    elapsed,
  };
}

// 串行跑（图像 API 通常有并发限制）
const results = [];
for (let i = 0; i < tasks.length; i++) {
  const t = tasks[i];
  process.stdout.write(`  [${i + 1}/${tasks.length}] ${t.group}/${t.id}  …`);
  try {
    const r = await generateOne(t);
    results.push(r);
    if (r.ok) {
      console.log(` ✓ ${r.elapsed}ms · ${(r.bytes / 1024).toFixed(0)}KB → ${r.file}`);
    } else {
      console.log(` ✗ ${r.error}`);
    }
  } catch (err) {
    console.log(` ✗ ${err.message}`);
    results.push({ id: t.id, group: t.group, ok: false, error: err.message });
  }
  // 轻微节流，避免触发上游限频
  if (i < tasks.length - 1) await new Promise((r) => setTimeout(r, 1500));
}

const ok = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);

// 写 manifest（前端可以读取）
const manifest = {
  generated: new Date().toISOString(),
  model: MODEL,
  total: results.length,
  ok: ok.length,
  fail: fail.length,
  images: ok.reduce((acc, r) => {
    acc[r.id] = { file: r.file, group: r.group, purpose: r.purpose, ratio: r.aspect_ratio };
    return acc;
  }, {}),
  failures: fail,
};
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

console.log(`\n✅ 完成 ${ok.length}/${results.length} 张  ·  manifest: ${MANIFEST}`);
if (fail.length) {
  console.log(`⚠️  ${fail.length} 张失败：`);
  fail.forEach((f) => console.log(`   - ${f.id}: ${f.error}`));
}
