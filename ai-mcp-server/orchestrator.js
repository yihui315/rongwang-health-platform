/**
 * 一辉智能体 — 统一调度核心 v4 (全自动)
 *
 * 通过 Copilot Pro (copilot-api) 解锁全部顶级模型：
 *   GPT-5.4       → 最强内容生成、SEO文章
 *   GPT-5.2-Codex → 代码任务、重构优化
 *   Gemini 3.1    → 长文分析、多模态理解
 *   Grok Code     → 快速代码、实时信息
 *   GPT-4o        → 通用任务、性价比高
 *
 * + MiniMax 2.7 (直连API) → 中国市场内容
 * + Qwen3-Coder 30B (Ollama本地) → 离线代码、无限调用
 *
 * 全部自动化，零剪贴板！
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── AI Client 初始化 ───────────────────────────────────

function createClients(env) {
  return {
    minimax: {
      apiKey: env.MINIMAX_API_KEY,
      groupId: env.MINIMAX_GROUP_ID,
      model: env.MINIMAX_MODEL || 'MiniMax-Text-01',
      baseUrl: 'https://api.minimax.chat/v1',
    },

    qwen: {
      baseUrl: env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: env.OLLAMA_MODEL || 'qwen3-coder:30b',
    },

    // copilot-api 代理，暴露所有 Copilot Pro 模型为 OpenAI 兼容接口
    copilot: {
      baseUrl: env.COPILOT_API_URL || 'http://localhost:4141',
    },
  };
}

// ─── Copilot Pro 模型库 ────────────────────────────────

/**
 * Copilot Pro 可用模型 — 按任务场景分配最优模型
 */
const COPILOT_MODELS = {
  // 内容生成（最强）
  'gpt-5.4':              { name: 'GPT-5.4',           tier: 'premium',  speed: 'medium', best: '最强内容、复杂推理' },
  'gpt-5.1':              { name: 'GPT-5.1',           tier: 'premium',  speed: 'medium', best: '高质量内容' },
  'gpt-4o':               { name: 'GPT-4o',            tier: 'standard', speed: 'fast',   best: '通用任务、性价比' },
  'gpt-5.4-mini':         { name: 'GPT-5.4 Mini',     tier: 'fast',     speed: 'fast',   best: '快速任务、批量处理' },

  // 代码专用
  'gpt-5.2-codex':        { name: 'Codex 5.2',        tier: 'premium',  speed: 'medium', best: '复杂代码生成' },
  'gpt-5.3-codex':        { name: 'Codex 5.3',        tier: 'premium',  speed: 'medium', best: '最新代码能力' },
  'grok-code-fast-1':     { name: 'Grok Code Fast',   tier: 'fast',     speed: 'fast',   best: '快速代码补全' },

  // 竞品分析 & 实时信息
  'gemini-2.5-pro':       { name: 'Gemini 2.5 Pro',   tier: 'premium',  speed: 'medium', best: '长文分析、多模态' },
  'gemini-3.1-pro-preview': { name: 'Gemini 3.1 Pro', tier: 'premium',  speed: 'medium', best: '最新Google模型' },

  // Claude (备用，但我们本身就是Claude)
  'claude-sonnet-4.6':    { name: 'Claude Sonnet 4.6', tier: 'standard', speed: 'fast',   best: '备用推理' },
};

// ─── 模型调用函数 ────────────────────────────────────────

/**
 * 调用 MiniMax 2.7 (中国市场专用)
 */
async function callMiniMax(clients, messages, options = {}) {
  const { apiKey, groupId, model, baseUrl } = clients.minimax;

  const response = await fetch(`${baseUrl}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    }),
  });

  const data = await response.json();
  if (data.base_resp?.status_code !== 0 && data.base_resp) {
    throw new Error(`MiniMax Error: ${data.base_resp.status_msg}`);
  }

  return {
    content: data.choices?.[0]?.message?.content || data.reply,
    usage: data.usage,
    model: model,
  };
}

/**
 * 调用 Ollama Qwen3 (本地离线)
 */
async function callQwen(clients, messages, options = {}) {
  const { baseUrl, model } = clients.qwen;

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model || model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 4096,
      },
    }),
  });

  const data = await response.json();
  return {
    content: data.message?.content,
    usage: {
      total_duration: data.total_duration,
      eval_count: data.eval_count,
    },
    model: data.model,
  };
}

/**
 * 调用 Copilot Pro 任意模型 (通过 copilot-api)
 */
async function callCopilot(clients, messages, options = {}) {
  const { baseUrl } = clients.copilot;
  const model = options.model || 'gpt-4o';

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Copilot [${model}] Error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return {
    content: data.choices?.[0]?.message?.content,
    usage: data.usage,
    model: data.model || model,
  };
}

// ─── 统一路由 ────────────────────────────────────────────

const MODEL_REGISTRY = {
  minimax: callMiniMax,
  qwen: callQwen,
  copilot: callCopilot,
};

/**
 * 任务 → 最优模型路由表
 * 全部自动化，每个任务都分配到最合适的模型
 */
const TASK_ROUTING = {
  // ── GPT-5.4: 最强英文内容 ──
  'seo-article':       { handler: 'copilot', model: 'gpt-5.4' },
  'product-desc':      { handler: 'copilot', model: 'gpt-5.4' },
  'landing-copy':      { handler: 'copilot', model: 'gpt-5.4' },
  'blog-post':         { handler: 'copilot', model: 'gpt-5.4' },

  // ── GPT-4o: 通用快速任务 ──
  'email-campaign':    { handler: 'copilot', model: 'gpt-4o' },
  'translation':       { handler: 'copilot', model: 'gpt-4o' },
  'summary':           { handler: 'copilot', model: 'gpt-4o' },

  // ── Gemini: 竞品分析 & 长文 ──
  'competitor-intel':  { handler: 'copilot', model: 'gemini-2.5-pro' },
  'market-trend':      { handler: 'copilot', model: 'gemini-2.5-pro' },
  'news-analysis':     { handler: 'copilot', model: 'gemini-2.5-pro' },
  'price-research':    { handler: 'copilot', model: 'gemini-2.5-pro' },
  'long-report':       { handler: 'copilot', model: 'gemini-2.5-pro' },

  // ── Codex: 代码生成 (云端) ──
  'code-complex':      { handler: 'copilot', model: 'gpt-5.3-codex' },
  'code-refactor':     { handler: 'copilot', model: 'gpt-5.2-codex' },
  'code-fast':         { handler: 'copilot', model: 'grok-code-fast-1' },

  // ── MiniMax: 中国市场内容 ──
  'xiaohongshu':       { handler: 'minimax', model: null },
  'wechat-article':    { handler: 'minimax', model: null },
  'cn-localization':   { handler: 'minimax', model: null },
  'cn-ad-copy':        { handler: 'minimax', model: null },
  'douyin-script':     { handler: 'minimax', model: null },
  'cn-product-desc':   { handler: 'minimax', model: null },
  'cn-seo':            { handler: 'minimax', model: null },

  // ── Qwen3: 本地代码 (离线免费) ──
  'html-component':    { handler: 'qwen', model: null },
  'css-styling':       { handler: 'qwen', model: null },
  'js-feature':        { handler: 'qwen', model: null },
  'data-processing':   { handler: 'qwen', model: null },
  'code-review':       { handler: 'qwen', model: null },
};

/**
 * 调用AI — 核心入口
 */
async function callAI(clients, modelOrTask, messages, options = {}) {
  // 直接指定处理器名
  if (MODEL_REGISTRY[modelOrTask]) {
    return await executeCall(clients, modelOrTask, messages, options);
  }

  // 通过任务路由
  const route = TASK_ROUTING[modelOrTask];
  if (route) {
    const opts = { ...options };
    if (route.model) opts.model = route.model;
    return await executeCall(clients, route.handler, messages, opts);
  }

  // 默认走 GPT-4o (快速通用)
  return await executeCall(clients, 'copilot', messages, { ...options, model: 'gpt-4o' });
}

async function executeCall(clients, handler, messages, options) {
  const callFn = MODEL_REGISTRY[handler];
  if (!callFn) throw new Error(`Unknown handler: ${handler}`);

  const startTime = Date.now();
  try {
    const result = await callFn(clients, messages, options);
    return {
      ...result,
      worker: handler,
      elapsed: Date.now() - startTime,
      success: true,
    };
  } catch (error) {
    return {
      content: null,
      error: error.message,
      worker: handler,
      elapsed: Date.now() - startTime,
      success: false,
    };
  }
}

/**
 * 并行调用多个AI
 */
async function callMultiAI(clients, tasks) {
  const results = await Promise.allSettled(
    tasks.map(({ model, messages, options }) =>
      callAI(clients, model, messages, options)
    )
  );

  return results.map((r, i) => ({
    task: tasks[i].label || `task-${i}`,
    ...(r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message }),
  }));
}

// ─── 日志 & 输出 ─────────────────────────────────────────

async function logTask(taskName, result, logDir) {
  const dir = logDir || join(__dirname, 'logs');
  await mkdir(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logEntry = {
    timestamp: new Date().toISOString(),
    task: taskName,
    worker: result.worker,
    model: result.model,
    elapsed: result.elapsed,
    success: result.success,
    error: result.error || null,
    usage: result.usage || null,
    contentLength: result.content?.length || 0,
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

// ─── 导出 ────────────────────────────────────────────────

export {
  createClients,
  callAI,
  callMultiAI,
  callMiniMax,
  callQwen,
  callCopilot,
  COPILOT_MODELS,
  TASK_ROUTING,
  MODEL_REGISTRY,
  logTask,
  saveOutput,
};
