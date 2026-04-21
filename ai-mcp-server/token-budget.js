/**
 * 一辉智能体 — Token 预算管理器
 *
 * 核心目标：最小化Claude Pro token消耗，保证系统长时间运作
 *
 * 策略：
 * 1. Claude 只做"CEO决策" — 分析、判断、路由，不做内容生成
 * 2. 所有内容生产推给 Copilot Pro / MiniMax / Qwen3（零Claude token）
 * 3. 每日token预算追踪，超限自动降级
 * 4. 结果缓存，避免重复调用
 * 5. Prompt压缩，减少每次输入的token数
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUDGET_FILE = join(__dirname, 'data', 'token-budget.json');
const CACHE_FILE = join(__dirname, 'data', 'response-cache.json');

// ─── Token 预算配置 ────────────────────────────────────

const BUDGET_CONFIG = {
  // Claude Pro 每日预算（保守估计，留余量）
  daily_limit: 50000,       // 每日token上限
  warning_threshold: 0.7,   // 70%时开始警告
  critical_threshold: 0.9,  // 90%时强制降级

  // 各操作估算token消耗
  cost_estimates: {
    route_decision: 200,     // CEO决策：选择哪个模型
    task_analysis: 500,      // 任务分析：理解复杂任务
    result_summary: 300,     // 结果汇总：整合多模型输出
    simple_query: 100,       // 简单查询：状态、列表等
    pipeline_orchestration: 800, // 流水线编排
  },

  // 降级策略
  degradation: {
    // 正常模式：Claude分析+路由，Copilot/MiniMax/Qwen执行
    normal: {
      analysis: true,
      rich_response: true,
      multi_model_compare: true,
    },
    // 节省模式（70%预算）：减少Claude分析，直接路由
    saving: {
      analysis: false,
      rich_response: false,
      multi_model_compare: true,
    },
    // 极限模式（90%预算）：Claude只做最基本路由
    critical: {
      analysis: false,
      rich_response: false,
      multi_model_compare: false,
    },
  },
};

// ─── 预算追踪 ──────────────────────────────────────────

let budgetState = null;

async function loadBudget() {
  try {
    const raw = await readFile(BUDGET_FILE, 'utf-8');
    budgetState = JSON.parse(raw);

    // 检查是否新的一天，重置计数
    const today = new Date().toISOString().slice(0, 10);
    if (budgetState.date !== today) {
      budgetState = createFreshBudget(today);
    }
  } catch {
    budgetState = createFreshBudget(new Date().toISOString().slice(0, 10));
  }
  return budgetState;
}

function createFreshBudget(date) {
  return {
    date,
    tokens_used: 0,
    calls_made: 0,
    calls_by_type: {},
    tokens_saved_by_delegation: 0, // 通过委托给其他模型节省的token
    mode: 'normal',
    history: [],
  };
}

async function saveBudget() {
  const dir = join(__dirname, 'data');
  await mkdir(dir, { recursive: true });
  await writeFile(BUDGET_FILE, JSON.stringify(budgetState, null, 2), 'utf-8');
}

/**
 * 记录一次Claude token消耗
 */
async function recordUsage(operationType, tokensUsed, metadata = {}) {
  if (!budgetState) await loadBudget();

  budgetState.tokens_used += tokensUsed;
  budgetState.calls_made += 1;
  budgetState.calls_by_type[operationType] =
    (budgetState.calls_by_type[operationType] || 0) + 1;

  budgetState.history.push({
    time: new Date().toISOString(),
    type: operationType,
    tokens: tokensUsed,
    ...metadata,
  });

  // 更新运行模式
  const usage_ratio = budgetState.tokens_used / BUDGET_CONFIG.daily_limit;
  if (usage_ratio >= BUDGET_CONFIG.critical_threshold) {
    budgetState.mode = 'critical';
  } else if (usage_ratio >= BUDGET_CONFIG.warning_threshold) {
    budgetState.mode = 'saving';
  } else {
    budgetState.mode = 'normal';
  }

  await saveBudget();
  return getBudgetStatus();
}

/**
 * 记录因为委托给其他模型而节省的token
 */
async function recordDelegationSaving(estimatedClaudeTokens) {
  if (!budgetState) await loadBudget();
  budgetState.tokens_saved_by_delegation += estimatedClaudeTokens;
  await saveBudget();
}

/**
 * 获取当前预算状态
 */
function getBudgetStatus() {
  if (!budgetState) return { mode: 'normal', usage: 0 };

  const remaining = BUDGET_CONFIG.daily_limit - budgetState.tokens_used;
  const usage_pct = Math.round((budgetState.tokens_used / BUDGET_CONFIG.daily_limit) * 100);

  return {
    mode: budgetState.mode,
    date: budgetState.date,
    tokens_used: budgetState.tokens_used,
    tokens_remaining: remaining,
    usage_pct,
    calls_made: budgetState.calls_made,
    tokens_saved: budgetState.tokens_saved_by_delegation,
    can_do: {
      route_decisions: Math.floor(remaining / BUDGET_CONFIG.cost_estimates.route_decision),
      task_analyses: Math.floor(remaining / BUDGET_CONFIG.cost_estimates.task_analysis),
      pipelines: Math.floor(remaining / BUDGET_CONFIG.cost_estimates.pipeline_orchestration),
    },
  };
}

/**
 * 检查是否应该执行某操作，还是应该降级
 */
function shouldExecute(operationType) {
  if (!budgetState) return { execute: true, mode: 'normal' };

  const mode = budgetState.mode;
  const degradation = BUDGET_CONFIG.degradation[mode];

  // 简单查询总是允许
  if (operationType === 'simple_query') return { execute: true, mode };

  // 根据降级策略判断
  switch (operationType) {
    case 'task_analysis':
      return { execute: degradation.analysis, mode };
    case 'result_summary':
      return { execute: degradation.rich_response, mode };
    case 'multi_model_compare':
      return { execute: degradation.multi_model_compare, mode };
    default:
      return { execute: true, mode };
  }
}

// ─── 响应缓存 ──────────────────────────────────────────

let responseCache = {};

async function loadCache() {
  try {
    const raw = await readFile(CACHE_FILE, 'utf-8');
    responseCache = JSON.parse(raw);

    // 清理过期缓存（超过24小时）
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    for (const key of Object.keys(responseCache)) {
      if (now - responseCache[key].timestamp > DAY_MS) {
        delete responseCache[key];
      }
    }
  } catch {
    responseCache = {};
  }
}

async function saveCache() {
  const dir = join(__dirname, 'data');
  await mkdir(dir, { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(responseCache, null, 2), 'utf-8');
}

/**
 * 生成缓存key（基于模型+prompt的hash）
 */
function cacheKey(model, prompt, system) {
  const str = `${model}|${system || ''}|${prompt}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `k_${Math.abs(hash).toString(36)}`;
}

/**
 * 查询缓存
 */
function getCached(model, prompt, system) {
  const key = cacheKey(model, prompt, system);
  const entry = responseCache[key];
  if (entry) {
    entry.hits = (entry.hits || 0) + 1;
    return entry.response;
  }
  return null;
}

/**
 * 存入缓存
 */
async function setCache(model, prompt, system, response) {
  const key = cacheKey(model, prompt, system);
  responseCache[key] = {
    response,
    timestamp: Date.now(),
    model,
    hits: 0,
  };

  // 限制缓存大小（最多200条）
  const keys = Object.keys(responseCache);
  if (keys.length > 200) {
    const sorted = keys.sort((a, b) => responseCache[a].timestamp - responseCache[b].timestamp);
    for (let i = 0; i < keys.length - 200; i++) {
      delete responseCache[sorted[i]];
    }
  }

  await saveCache();
}

// ─── Prompt 压缩工具 ───────────────────────────────────

/**
 * 压缩system prompt — 去除冗余，保留核心指令
 * 这是减少Claude token消耗的最有效手段之一
 */
const COMPRESSED_PROMPTS = {
  // 原来的长prompt → 压缩版
  seo_writer: 'Expert SEO health supplement writer. Evidence-based, H2/H3, meta desc, FAQ.',
  cn_translator: '保健品翻译专家。符合中国消费者习惯，保留SEO结构。',
  html_generator: '前端工程师。荣旺健康风格HTML，#FAFAFA背景，#0A8F7F强调色。',
  product_writer: 'Health supplement copywriter. Science-backed, compelling.',
  competitor_analyst: 'Competitive analyst for health supplements. Specific data.',
  report_writer: 'Business analyst. Structured competitive analysis.',
  xiaohongshu: '小红书爆款笔记作者。真实体验感，emoji适当，引导互动。',
  wechat: '微信公众号健康科普作者。专业权威，通俗易懂。',
};

/**
 * 获取压缩后的system prompt
 */
function getCompressedPrompt(key) {
  return COMPRESSED_PROMPTS[key] || null;
}

/**
 * 估算prompt的token数（粗略：中文≈1.5 token/字，英文≈0.25 token/word）
 */
function estimateTokens(text) {
  if (!text) return 0;
  const cnChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const enWords = text.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(Boolean).length;
  return Math.ceil(cnChars * 1.5 + enWords * 1.3);
}

// ─── Claude CEO 决策优化 ────────────────────────────────

/**
 * 智能决策：这个任务是否需要Claude参与？
 *
 * 原则：
 * - 简单路由：不需要Claude，直接走TASK_ROUTING（零Claude token）
 * - 复杂编排：Claude做最少量分析，然后委托
 * - 结果汇总：只在normal模式下，Claude做rich summary
 */
function classifyTask(taskType, prompt) {
  // 直接路由类 — 零Claude消耗
  const DIRECT_ROUTE = [
    'seo-article', 'product-desc', 'landing-copy', 'blog-post',
    'email-campaign', 'translation', 'summary',
    'xiaohongshu', 'wechat-article', 'cn-localization', 'cn-ad-copy',
    'douyin-script', 'cn-product-desc', 'cn-seo',
    'html-component', 'css-styling', 'js-feature', 'data-processing', 'code-review',
    'code-complex', 'code-refactor', 'code-fast',
  ];

  if (DIRECT_ROUTE.includes(taskType)) {
    return {
      needsClaude: false,
      reason: 'direct_route',
      claudeTokens: 0,
    };
  }

  // 分析类 — Claude做轻量分析
  const LIGHT_ANALYSIS = ['competitor-intel', 'market-trend', 'news-analysis', 'price-research'];
  if (LIGHT_ANALYSIS.includes(taskType)) {
    return {
      needsClaude: false,  // Gemini直接处理
      reason: 'gemini_handles',
      claudeTokens: 0,
    };
  }

  // 流水线类 — Claude只做编排
  const PIPELINE = ['write_seo', 'write_product', 'competitor_scan'];
  if (PIPELINE.includes(taskType)) {
    return {
      needsClaude: true,
      reason: 'pipeline_orchestration',
      claudeTokens: BUDGET_CONFIG.cost_estimates.pipeline_orchestration,
    };
  }

  // 默认：简单路由
  return {
    needsClaude: true,
    reason: 'general',
    claudeTokens: BUDGET_CONFIG.cost_estimates.route_decision,
  };
}

/**
 * 批量任务优化 — 合并多个小任务为一次调用
 */
function batchOptimize(tasks) {
  const batches = {
    minimax: [],
    qwen: [],
    copilot: {},  // 按模型分组
  };

  for (const task of tasks) {
    if (task.handler === 'minimax') {
      batches.minimax.push(task);
    } else if (task.handler === 'qwen') {
      batches.qwen.push(task);
    } else {
      const model = task.model || 'gpt-4o';
      if (!batches.copilot[model]) batches.copilot[model] = [];
      batches.copilot[model].push(task);
    }
  }

  return batches;
}

// ─── 导出 ──────────────────────────────────────────────

export {
  BUDGET_CONFIG,
  loadBudget,
  saveBudget,
  recordUsage,
  recordDelegationSaving,
  getBudgetStatus,
  shouldExecute,
  loadCache,
  getCached,
  setCache,
  getCompressedPrompt,
  COMPRESSED_PROMPTS,
  estimateTokens,
  classifyTask,
  batchOptimize,
};
