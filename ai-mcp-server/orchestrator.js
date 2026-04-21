/**
 * 一辉智能体 — 统一调度核心 v5.0
 *
 * 🧠 Claude Pro (本体) → CEO大脑：分析、决策、规划、审核
 * 💪 Copilot Pro (copilot-api) → 内容生产引擎
 * 🇨🇳 MiniMax M2.7 (Anthropic兼容API) → 中国市场内容
 * 🏠 Qwen3-Coder 30B (Ollama本地) → 离线代码、无限调用
 * 🔄 PackyAPI → 备用大脑
 *
 * v5.0: 取消token限制，全力构建商城
 * v5.1: 引擎自动启动 — 离线自动拉起
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ensureEngine } from './engine-manager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── AI Client 初始化 ───────────────────────────────────

function createClients(env) {
  return {
    packy: {
      anthropicKey: env.PACKY_ANTHROPIC_KEY,
      anthropicUrl: env.PACKY_ANTHROPIC_URL || 'https://www.packyapi.com',
      anthropicModel: env.PACKY_ANTHROPIC_MODEL || 'claude-opus-4-6',
      openaiKey: env.PACKY_OPENAI_KEY,
      openaiUrl: env.PACKY_OPENAI_URL || 'https://www.packyapi.com',
      openaiModel: env.PACKY_OPENAI_MODEL || 'claude-opus-4-6',
    },

    minimax: {
      apiKey: env.MINIMAX_API_KEY,
      groupId: env.MINIMAX_GROUP_ID,
      model: env.MINIMAX_MODEL || 'MiniMax-M2.7',
      baseUrl: env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1',
    },

    qwen: {
      baseUrl: env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: env.OLLAMA_MODEL || 'qwen3-coder:30b',
    },

    copilot: {
      baseUrl: env.COPILOT_API_URL || 'http://localhost:4141',
    },
  };
}

// ─── Copilot Pro 模型库 ────────────────────────────────

const COPILOT_MODELS = {
  'gpt-5.4':              { name: 'GPT-5.4',           tier: 'premium',  speed: 'medium', best: '最强内容、复杂推理' },
  'gpt-5.1':              { name: 'GPT-5.1',           tier: 'premium',  speed: 'medium', best: '高质量内容' },
  'gpt-4o':               { name: 'GPT-4o',            tier: 'standard', speed: 'fast',   best: '通用任务、性价比' },
  'gpt-5.4-mini':         { name: 'GPT-5.4 Mini',     tier: 'fast',     speed: 'fast',   best: '快速任务、批量处理' },
  'gpt-5.2-codex':        { name: 'Codex 5.2',        tier: 'premium',  speed: 'medium', best: '复杂代码生成' },
  'gpt-5.3-codex':        { name: 'Codex 5.3',        tier: 'premium',  speed: 'medium', best: '最新代码能力' },
  'grok-code-fast-1':     { name: 'Grok Code Fast',   tier: 'fast',     speed: 'fast',   best: '快速代码补全' },
  'gemini-2.5-pro':       { name: 'Gemini 2.5 Pro',   tier: 'premium',  speed: 'medium', best: '长文分析、多模态' },
  'gemini-3.1-pro-preview': { name: 'Gemini 3.1 Pro', tier: 'premium',  speed: 'medium', best: '最新Google模型' },
  'claude-sonnet-4.6':    { name: 'Claude Sonnet 4.6', tier: 'standard', speed: 'fast',   best: '备用推理' },
};

// ─── 模型调用函数 ────────────────────────────────────────

/** PackyAPI — 双通道自动切换 */
async function callPacky(clients, messages, options = {}) {
  const { packy } = clients;
  try {
    return await callPackyOpenAI(packy, messages, options);
  } catch (e) {
    console.error('[Packy/OpenAI] fallback:', e.message);
    return await callPackyAnthropic(packy, messages, options);
  }
}

async function callPackyOpenAI(packy, messages, options = {}) {
  if (!packy.openaiKey) throw new Error('PACKY_OPENAI_KEY not set');
  const response = await fetch(`${packy.openaiUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${packy.openaiKey}` },
    body: JSON.stringify({
      model: options.model || packy.openaiModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(`Packy/OpenAI: ${data.error.message || JSON.stringify(data.error)}`);
  return { content: data.choices?.[0]?.message?.content, usage: data.usage, model: data.model || packy.openaiModel };
}

async function callPackyAnthropic(packy, messages, options = {}) {
  if (!packy.anthropicKey) throw new Error('PACKY_ANTHROPIC_KEY not set');
  const system = messages.find(m => m.role === 'system')?.content || '';
  const anthropicMessages = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));
  const body = { model: options.model || packy.anthropicModel, max_tokens: options.maxTokens ?? 4096, messages: anthropicMessages };
  if (system) body.system = system;
  const response = await fetch(`${packy.anthropicUrl}/v1/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': packy.anthropicKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.error) throw new Error(`Packy/Anthropic: ${data.error.message || JSON.stringify(data.error)}`);
  return { content: data.content?.[0]?.text || data.content, usage: data.usage, model: data.model || packy.anthropicModel };
}

/**
 * MiniMax — Anthropic兼容API (优先) + 旧API降级
 */
async function callMiniMax(clients, messages, options = {}) {
  const { apiKey, model } = clients.minimax;
  const useModel = options.model || model || 'MiniMax-M2.7';

  try {
    return await callMiniMaxAnthropic(apiKey, useModel, messages, options);
  } catch (e) {
    console.error(`[MiniMax/Anthropic] ${e.message}, 降级旧API...`);
    return await callMiniMaxLegacy(clients.minimax, messages, options);
  }
}

async function callMiniMaxAnthropic(apiKey, model, messages, options = {}) {
  if (!apiKey) throw new Error('MINIMAX_API_KEY not set');
  const system = messages.find(m => m.role === 'system')?.content || '';
  const anthropicMessages = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));
  const body = { model, max_tokens: options.maxTokens ?? 4096, messages: anthropicMessages };
  if (system) body.system = system;
  const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.error || data.type === 'error') throw new Error(`MiniMax/Anthropic: ${data.error?.message || JSON.stringify(data.error || data)}`);

  // MiniMax M2.7 may return thinking + text blocks — extract text blocks
  let textContent = '';
  if (Array.isArray(data.content)) {
    const textBlocks = data.content.filter(b => b.type === 'text');
    textContent = textBlocks.map(b => b.text).join('\n');
    // If no text blocks, fall back to first block's text
    if (!textContent && data.content.length > 0) {
      textContent = data.content[0].text || '';
    }
  }
  return { content: textContent, usage: data.usage, model: data.model || model };
}

async function callMiniMaxLegacy(cfg, messages, options = {}) {
  const models = [cfg.model, 'MiniMax-M2.7', 'abab6.5s-chat', 'abab5.5s-chat'];
  for (const m of [...new Set(models)]) {
    try {
      const response = await fetch(`${cfg.baseUrl}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({ model: m, messages, temperature: options.temperature ?? 0.7, max_tokens: options.maxTokens ?? 4096 }),
      });
      const data = await response.json();
      if (data.base_resp?.status_code !== 0 && data.base_resp) continue;
      return { content: data.choices?.[0]?.message?.content || data.reply, usage: data.usage, model: m };
    } catch { continue; }
  }
  throw new Error('MiniMax: 所有端点和模型都失败');
}

/** Ollama Qwen3 (本地离线) */
async function callQwen(clients, messages, options = {}) {
  const { baseUrl, model } = clients.qwen;
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model || model, messages, stream: false,
      options: { temperature: options.temperature ?? 0.7, num_predict: options.maxTokens ?? 4096 },
    }),
  });
  const data = await response.json();
  return { content: data.message?.content, usage: { total_duration: data.total_duration, eval_count: data.eval_count }, model: data.model };
}

/** Copilot Pro — 自动兼容GPT-5.x / Codex */
async function callCopilot(clients, messages, options = {}) {
  const { baseUrl } = clients.copilot;
  const model = options.model || 'gpt-4o';

  const needsNewParam = model.startsWith('gpt-5') || model.startsWith('o1') || model.startsWith('o3');
  const tokenParam = needsNewParam ? { max_completion_tokens: options.maxTokens ?? 4096 } : { max_tokens: options.maxTokens ?? 4096 };
  const isCodex = model.includes('codex');
  const endpoint = isCodex ? `${baseUrl}/v1/responses` : `${baseUrl}/v1/chat/completions`;

  let body;
  if (isCodex) {
    const userMsg = messages.find(m => m.role === 'user')?.content || '';
    const sysMsg = messages.find(m => m.role === 'system')?.content || '';
    body = { model, input: sysMsg ? `${sysMsg}\n\n${userMsg}` : userMsg, ...tokenParam };
  } else {
    body = { model, messages, temperature: options.temperature ?? 0.7, ...tokenParam };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.error) throw new Error(`Copilot [${model}]: ${data.error.message || JSON.stringify(data.error)}`);

  const content = isCodex
    ? (data.output?.[0]?.content?.[0]?.text || data.output_text || JSON.stringify(data.output))
    : data.choices?.[0]?.message?.content;

  return { content, usage: data.usage, model: data.model || model };
}

// ─── 统一路由 ────────────────────────────────────────────

const MODEL_REGISTRY = {
  packy: callPacky,
  minimax: callMiniMax,
  qwen: callQwen,
  copilot: callCopilot,
};

const TASK_ROUTING = {
  // PackyAPI 备用
  'task-analyze':      { handler: 'packy', model: null },
  'task-plan':         { handler: 'packy', model: null },
  'result-synthesize': { handler: 'packy', model: null },
  'quality-review':    { handler: 'packy', model: null },
  'strategy':          { handler: 'packy', model: null },

  // GPT-5.4: 英文内容
  'seo-article':       { handler: 'copilot', model: 'gpt-5.4' },
  'product-desc':      { handler: 'copilot', model: 'gpt-5.4' },
  'landing-copy':      { handler: 'copilot', model: 'gpt-5.4' },
  'blog-post':         { handler: 'copilot', model: 'gpt-5.4' },

  // GPT-4o: 通用快速
  'email-campaign':    { handler: 'copilot', model: 'gpt-4o' },
  'translation':       { handler: 'copilot', model: 'gpt-4o' },
  'summary':           { handler: 'copilot', model: 'gpt-4o' },

  // Gemini: 竞品分析
  'competitor-intel':  { handler: 'copilot', model: 'gemini-2.5-pro' },
  'market-trend':      { handler: 'copilot', model: 'gemini-2.5-pro' },
  'news-analysis':     { handler: 'copilot', model: 'gemini-2.5-pro' },
  'price-research':    { handler: 'copilot', model: 'gemini-2.5-pro' },
  'long-report':       { handler: 'copilot', model: 'gemini-2.5-pro' },

  // Codex: 代码
  'code-complex':      { handler: 'copilot', model: 'gpt-5.3-codex' },
  'code-refactor':     { handler: 'copilot', model: 'gpt-5.2-codex' },
  'code-fast':         { handler: 'copilot', model: 'grok-code-fast-1' },

  // MiniMax: 中文
  'xiaohongshu':       { handler: 'minimax', model: null },
  'wechat-article':    { handler: 'minimax', model: null },
  'cn-localization':   { handler: 'minimax', model: null },
  'cn-ad-copy':        { handler: 'minimax', model: null },
  'douyin-script':     { handler: 'minimax', model: null },
  'cn-product-desc':   { handler: 'minimax', model: null },
  'cn-seo':            { handler: 'minimax', model: null },

  // Qwen3: 本地代码
  'html-component':    { handler: 'qwen', model: null },
  'css-styling':       { handler: 'qwen', model: null },
  'js-feature':        { handler: 'qwen', model: null },
  'data-processing':   { handler: 'qwen', model: null },
  'code-review':       { handler: 'qwen', model: null },
};

/** 调用AI核心入口 */
async function callAI(clients, modelOrTask, messages, options = {}) {
  if (MODEL_REGISTRY[modelOrTask]) {
    return await executeCall(clients, modelOrTask, messages, options);
  }
  const route = TASK_ROUTING[modelOrTask];
  if (route) {
    const opts = { ...options };
    if (route.model) opts.model = route.model;
    return await executeCall(clients, route.handler, messages, opts);
  }
  // 默认走Copilot GPT-4o
  return await executeCall(clients, 'copilot', messages, { ...options, model: 'gpt-4o' });
}

async function executeCall(clients, handler, messages, options) {
  const callFn = MODEL_REGISTRY[handler];
  if (!callFn) throw new Error(`Unknown handler: ${handler}`);
  const startTime = Date.now();
  try {
    const result = await callFn(clients, messages, options);
    return { ...result, worker: handler, elapsed: Date.now() - startTime, success: true };
  } catch (error) {
    return { content: null, error: error.message, worker: handler, elapsed: Date.now() - startTime, success: false };
  }
}

/** 并行调用多个AI */
async function callMultiAI(clients, tasks) {
  const results = await Promise.allSettled(
    tasks.map(({ model, messages, options }) => callAI(clients, model, messages, options))
  );
  return results.map((r, i) => ({
    task: tasks[i].label || `task-${i}`,
    ...(r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message }),
  }));
}

/** 带自动启动+降级的智能调用 — 失败先尝试启动引擎，再降级 */
async function callAISmart(clients, modelOrTask, messages, options = {}) {
  const result = await callAI(clients, modelOrTask, messages, options);
  if (result.success) return result;

  const originalHandler = result.worker;

  // 第1步: 如果是本地引擎失败，尝试自动启动
  const autoStartMap = { copilot: 'copilot', qwen: 'ollama' };
  const engineName = autoStartMap[originalHandler];
  if (engineName) {
    console.error(`[Smart] ${originalHandler} 离线，尝试自动启动...`);
    const config = {
      copilotUrl: clients.copilot.baseUrl,
      ollamaUrl: clients.qwen.baseUrl,
      model: clients.qwen.model,
    };
    const started = await ensureEngine(engineName, config);
    if (started) {
      console.error(`[Smart] ${originalHandler} 已启动，重试调用...`);
      const retryResult = await callAI(clients, modelOrTask, messages, options);
      if (retryResult.success) {
        return { ...retryResult, autoStarted: originalHandler };
      }
    }
  }

  // 第2步: 降级链 — minimax → copilot → qwen
  const fallbackChain = ['minimax', 'copilot', 'qwen'];

  for (const fallback of fallbackChain) {
    if (fallback === originalHandler) continue;

    // 尝试自动启动降级目标
    const fbEngine = autoStartMap[fallback];
    if (fbEngine) {
      const fbConfig = {
        copilotUrl: clients.copilot.baseUrl,
        ollamaUrl: clients.qwen.baseUrl,
        model: clients.qwen.model,
      };
      await ensureEngine(fbEngine, fbConfig);
    }

    console.error(`[Smart] ${originalHandler} 失败，降级到 ${fallback}`);
    const fallbackResult = await executeCall(clients, fallback, messages, options);
    if (fallbackResult.success) {
      return { ...fallbackResult, fallbackFrom: originalHandler };
    }
  }

  return result; // 全部失败
}

// ─── 日志 & 输出 ─────────────────────────────────────────

async function logTask(taskName, result, logDir) {
  const dir = logDir || join(__dirname, 'logs');
  await mkdir(dir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logEntry = {
    timestamp: new Date().toISOString(), task: taskName,
    worker: result.worker, model: result.model, elapsed: result.elapsed,
    success: result.success, error: result.error || null,
    usage: result.usage || null, contentLength: result.content?.length || 0,
  };
  const logFile = join(dir, `${timestamp}_${taskName}.json`);
  await writeFile(logFile, JSON.stringify(logEntry, null, 2), 'utf-8');
  return logFile;
}

async function saveOutput(filename, content, outputDir) {
  const dir = outputDir || join(__dirname, 'output');
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, filename);
  await writeFile(filePath, content, 'utf-8');
  return filePath;
}

// ─── 连接状态检测 ────────────────────────────────────────

async function checkHealth(clients) {
  const status = {};

  // MiniMax
  try {
    const r = await callMiniMax(clients, [{ role: 'user', content: 'ping' }], { maxTokens: 10 });
    status.minimax = { ok: true, model: r.model };
  } catch (e) { status.minimax = { ok: false, error: e.message }; }

  // Copilot
  try {
    const r = await callCopilot(clients, [{ role: 'user', content: 'ping' }], { model: 'gpt-4o', maxTokens: 10 });
    status.copilot = { ok: true, model: r.model };
  } catch (e) { status.copilot = { ok: false, error: e.message }; }

  // Qwen
  try {
    const r = await callQwen(clients, [{ role: 'user', content: 'ping' }], { maxTokens: 10 });
    status.qwen = { ok: true, model: r.model };
  } catch (e) { status.qwen = { ok: false, error: e.message }; }

  // PackyAPI
  try {
    const r = await callPacky(clients, [{ role: 'user', content: 'ping' }], { maxTokens: 10 });
    status.packy = { ok: true, model: r.model };
  } catch (e) { status.packy = { ok: false, error: e.message }; }

  return status;
}

// ─── 导出 ────────────────────────────────────────────────

export {
  createClients,
  callAI,
  callAISmart,
  callMultiAI,
  callPacky,
  callMiniMax,
  callQwen,
  callCopilot,
  checkHealth,
  COPILOT_MODELS,
  TASK_ROUTING,
  MODEL_REGISTRY,
  logTask,
  saveOutput,
};
