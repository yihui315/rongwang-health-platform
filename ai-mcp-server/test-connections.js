#!/usr/bin/env node
/**
 * AI连接测试 v4 — 全自动多模型
 */

import dotenv from 'dotenv';
import { createClients, callAI, COPILOT_MODELS } from './orchestrator.js';

dotenv.config();

const TEST_PROMPT = 'Reply with exactly: "OK" and nothing else.';

async function testModel(clients, label, handler, options = {}) {
  const pad = label.padEnd(22);
  process.stdout.write(`  ${pad} ... `);

  try {
    const result = await callAI(
      clients, handler,
      [{ role: 'user', content: TEST_PROMPT }],
      { maxTokens: 10, temperature: 0, ...options }
    );

    if (result.success) {
      console.log(`✅ OK (${result.elapsed}ms) — ${result.model}`);
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

async function main() {
  console.log('');
  console.log('🔍 一辉智能体 v4 — 全模型连接测试');
  console.log('═'.repeat(60));

  const clients = createClients(process.env);
  const results = {};

  // ── Copilot Pro 模型测试 ──
  console.log('');
  console.log('🌐 Copilot Pro (copilot-api):');

  const copilotUrl = process.env.COPILOT_API_URL || 'http://localhost:4141';
  let copilotOnline = false;

  try {
    const health = await fetch(`${copilotUrl}/v1/models`);
    if (health.ok) {
      copilotOnline = true;

      // 测试关键模型
      results.gpt54 = await testModel(clients, 'GPT-5.4 (内容)', 'copilot', { model: 'gpt-5.4' });
      results.gpt4o = await testModel(clients, 'GPT-4o (通用)', 'copilot', { model: 'gpt-4o' });
      results.codex = await testModel(clients, 'Codex 5.3 (代码)', 'copilot', { model: 'gpt-5.3-codex' });
      results.gemini = await testModel(clients, 'Gemini 2.5 Pro (分析)', 'copilot', { model: 'gemini-2.5-pro' });
    }
  } catch {
    console.log('  ❌ copilot-api 未运行');
    console.log('     请先启动: copilot-api start');
  }

  // ── MiniMax ──
  console.log('');
  console.log('🇨🇳 MiniMax 2.7 (API直连):');
  if (process.env.MINIMAX_API_KEY) {
    results.minimax = await testModel(clients, 'MiniMax 2.7 (中文)', 'minimax');
  } else {
    console.log('  ⏭️  跳过 (无API Key)');
  }

  // ── Ollama Qwen3 ──
  console.log('');
  console.log('💻 Ollama Qwen3 (本地):');
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  try {
    const health = await fetch(`${ollamaUrl}/api/tags`);
    if (health.ok) {
      results.qwen = await testModel(clients, 'Qwen3-Coder 30B', 'qwen');
    }
  } catch {
    console.log('  ❌ Ollama 未运行 (ollama serve)');
  }

  // ── 总结 ──
  console.log('');
  console.log('═'.repeat(60));
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  console.log(`📊 测试结果: ${passed}/${total} 模型连接成功`);

  if (copilotOnline && results.gpt54 && results.minimax && results.qwen) {
    console.log('');
    console.log('🎉 核心模型全部就绪！可以启动 MCP Server:');
    console.log('   npm start');
  } else {
    if (!copilotOnline) console.log('⚠️  Copilot: copilot-api start');
    if (!results.minimax) console.log('⚠️  MiniMax: 检查 .env 中的 MINIMAX_API_KEY');
    if (!results.qwen) console.log('⚠️  Qwen3: ollama serve');
  }

  console.log('');
}

main().catch(console.error);
