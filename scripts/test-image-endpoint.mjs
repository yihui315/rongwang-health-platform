#!/usr/bin/env node
/**
 * 一辉智能体 /image 端点上线后的端到端验证
 *
 * 用法: node scripts/test-image-endpoint.mjs
 *
 * 检查项:
 *   1. /health 列出 POST /image
 *   2. /image 能跑通并返回 base64
 *   3. 落地到 public/img/test.png
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'img');

const MCP_URL = process.env.AI_MCP_URL || 'http://43.160.251.191:8787';
const MCP_SECRET = process.env.AI_MCP_SECRET || 'rw-health-2024';

console.log(`🎯 测试网关: ${MCP_URL}\n`);

// === 1. health ===
console.log('[1/3] GET /health');
const health = await fetch(`${MCP_URL}/health`).then((r) => r.json());
console.log('     version:', health.version, '· minimax:', health.minimax);

// === 2. 探可用端点 ===
console.log('\n[2/3] 检查 /image 端点');
const probe = await fetch(`${MCP_URL}/`).then((r) => r.json()).catch(() => null);
const endpoints = probe?.available || [];
const hasImage = endpoints.some((e) => e.includes('/image'));
console.log('     可用端点:', endpoints.join(', '));
if (!hasImage) {
  console.error('\n❌ /image 端点未上线 — 请确认网关已合并 patch 并重启');
  process.exit(1);
}
console.log('     ✓ /image 端点已就绪');

// === 3. 实测一张图 ===
console.log('\n[3/3] POST /image (测试图)');
const t0 = Date.now();
const res = await fetch(`${MCP_URL}/image`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${MCP_SECRET}`,
  },
  body: JSON.stringify({
    prompt:
      'A clean amber glass supplement bottle on a soft cream background, golden morning light, minimalist Apple-store product photography, hyperrealistic 8K, no text, no logo',
    aspect_ratio: '1:1',
    n: 1,
    model: 'image-01',
    prompt_optimizer: true,
    response_format: 'base64',
  }),
  signal: AbortSignal.timeout(180_000),
});

const data = await res.json();
const elapsed = Date.now() - t0;

if (!data.success || !data.images?.[0]?.base64) {
  console.error(`\n❌ 失败 (${elapsed}ms):`, data.error || JSON.stringify(data));
  process.exit(1);
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const buf = Buffer.from(data.images[0].base64, 'base64');
const file = path.join(OUT, 'test.png');
fs.writeFileSync(file, buf);

console.log(`     ✓ ${elapsed}ms · ${(buf.length / 1024).toFixed(0)} KB → ${file}`);
console.log(`\n✅ 端到端验证通过！网关已支持 /image 端点。\n`);
console.log('下一步：node scripts/generate-images.mjs  (跑全部 12 张第一批图)');
