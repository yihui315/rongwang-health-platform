#!/usr/bin/env node
/**
 * 一辉智能体 v5.0 — 全模型连接测试
 */

import dotenv from 'dotenv';
import {
  createClients, callAI, callMiniMax, callCopilot, callQwen, callPacky,
  COPILOT_MODELS, TASK_ROUTING,
} from './orchestrator.js';

dotenv.config();
const clients = createClients(process.env);

console.log('🔍 一辉智能体 v5.0 — 连接测试');
console.log('═'.repeat(56));

const results = {};

async function testModel(label, handler, options = {}) {
  const messages = [{ role: 'user', content: '用一句话介绍你自己' }];
  process.stdout.write(`  ${label.padEnd(30)} ... `);
  const start = Date.now();
  try {
    const result = await callAI(clients, handler, messages, { maxTokens: 100, ...options });
    const elapsed = Date.now() - start;
    if (result.success) {
      console.log(`✅ OK (${elapsed}ms) — ${result.model || handler}`);
      return true;
    } else {
      console.log(`❌ ${result.error}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ${e.message}`);
    return false;
  }
}

// MiniMax
console.log('\n🇨🇳 MiniMax M2.7 (Anthropic兼容API):');
if (process.env.MINIMAX_API_KEY) {
  results.minimax = await testModel('MiniMax M2.7 (中文)', 'minimax');
} else {
  console.log('  ⏭️  跳过 (无API Key)');
}

// Copilot
console.log('\n🌐 Copilot Pro (copilot-api):');
try {
  const r = await fetch(`${process.env.COPILOT_API_URL || 'http://localhost:4141'}/v1/models`);
  if (r.ok) {
    results.copilot_gpt4o = await testModel('GPT-4o', 'copilot', { model: 'gpt-4o' });
  } else {
    console.log('  ❌ copilot-api 返回错误');
  }
} catch {
  console.log('  ❌ copilot-api 未运行');
  console.log('     请先启动: copilot-api start');
}

// Qwen3
console.log('\n💻 Ollama Qwen3 (本地):');
try {
  const r = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/tags`);
  if (r.ok) {
    results.qwen = await testModel('Qwen3-Coder 30B', 'qwen');
  } else {
    console.log('  ❌ Ollama 未响应');
  }
} catch {
  console.log('  ❌ Ollama 未运行 (ollama serve)');
}

// PackyAPI
console.log('\n🔄 PackyAPI (备用大脑):');
if (process.env.PACKY_OPENAI_KEY || process.env.PACKY_ANTHROPIC_KEY) {
  results.packy = await testModel('PackyAPI Opus', 'packy');
} else {
  console.log('  ⏭️  跳过 (无API Key)');
}

// 汇总
const total = Object.keys(results).length;
const passed = Object.values(results).filter(Boolean).length;

console.log('\n' + '═'.repeat(56));
console.log(`📊 测试结果: ${passed}/${total} 连接成功`);
console.log(`\n📦 v5.0 工具数: 19 | 路由规则: ${Object.keys(TASK_ROUTING).length}`);
console.log(`\n🏗️ 模式: 全力构建 — 取消token限制`);

if (passed === 0) {
  console.log('\n⚠️  没有可用引擎！请至少启动一个:');
  console.log('   MiniMax: 检查 .env MINIMAX_API_KEY');
  console.log('   Copilot: copilot-api start');
  console.log('   Qwen3: ollama serve && ollama pull qwen3-coder:30b');
}
