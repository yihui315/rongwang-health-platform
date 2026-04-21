/**
 * 一辉智能体 — Next.js 前端调用入口 (ai-brain) v6
 *
 * 多模型混合架构：
 *   MiniMax M2.7  → 云端网关 (43.161.229.245/ai/) — 中文内容、营销
 *   Copilot Pro   → 本地 (localhost:4141) — GPT-4o/GPT-5/Gemini/Claude
 *   Ollama Qwen3  → 本地 (localhost:11434) — 离线代码、无限调用
 *
 * 智能路由策略：
 *   1. 优先使用指定 handler
 *   2. 中文营销/保健内容 → MiniMax
 *   3. 代码/技术任务 → Ollama Qwen3
 *   4. 通用高质量内容 → Copilot Pro
 *   5. 任意引擎失败 → 自动 fallback 到下一个可用引擎
 *
 * 环境变量：
 *   AI_MCP_URL / NEXT_PUBLIC_AI_MCP_URL  — MiniMax 云端网关
 *   AI_MCP_SECRET                         — 网关 Bearer Token
 *   COPILOT_API_URL                       — 本地 copilot-api (默认 http://localhost:4141)
 *   COPILOT_MODEL                         — Copilot 默认模型 (默认 gpt-4o)
 *   OLLAMA_BASE_URL                       — 本地 Ollama (默认 http://localhost:11434)
 *   OLLAMA_MODEL                          — Ollama 默认模型 (默认 qwen3:8b)
 *   MINIMAX_API_KEY                       — MiniMax 图像生成直连
 */

// ─── 配置 ────────────────────────────────────────────────────

const env = (key: string, fallback = '') =>
  (typeof process !== 'undefined' && process.env?.[key]) || fallback;

/** MiniMax 云端网关 */
const MCP_BASE = env('AI_MCP_URL') || env('NEXT_PUBLIC_AI_MCP_URL') || 'http://localhost:8787';
const MCP_SECRET = env('AI_MCP_SECRET');

/** Copilot Pro 本地代理 */
const COPILOT_URL = env('COPILOT_API_URL', 'http://localhost:4141');
const COPILOT_MODEL = env('COPILOT_MODEL', 'gpt-4o');

/** Ollama 本地 */
const OLLAMA_URL = env('OLLAMA_BASE_URL', 'http://localhost:11434');
const OLLAMA_MODEL = env('OLLAMA_MODEL', 'qwen3:8b');

// ─── 类型定义 ─────────────────────────────────────────────────

export type AIHandler = 'minimax' | 'copilot' | 'ollama' | 'auto';

export interface AskOptions {
  handler?: AIHandler;
  taskType?: string;
  model?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  save?: boolean;
  filename?: string;
}

export interface AskResult {
  success: boolean;
  content: string | null;
  worker?: string;
  model?: string;
  elapsed?: number;
  error?: string;
}

export interface BatchTask {
  label: string;
  prompt: string;
  handler?: string;
  taskType?: string;
  model?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface BatchResult {
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: Array<AskResult & { task: string }>;
}

export interface GeneratePageOptions {
  topic: string;
  type?: 'seo' | 'product' | 'landing';
  keywords?: string[];
  audience?: string;
  brand?: string;
  language?: 'zh' | 'en';
}

export interface GeneratePageResult {
  success: boolean;
  outline: string | null;
  content: string | null;
  file?: string;
  steps?: Array<{ step: string; worker?: string; model?: string; elapsed?: number }>;
  error?: string;
}

export interface RunTaskResult {
  success: boolean;
  taskName: string;
  content: string | null;
  worker?: string;
  model?: string;
  elapsed?: number;
  file?: string | null;
  error?: string;
}

export interface HealthResult {
  status: 'ok' | 'error';
  service?: string;
  version?: string;
  timestamp?: string;
  minimax?: boolean;
  copilot?: boolean;
  ollama?: boolean;
  error?: string;
}

// ─── 底层调用：三个 AI 引擎 ──────────────────────────────────

/**
 * 调用 MiniMax (通过云端网关)
 */
async function callMiniMax(
  prompt: string,
  options: AskOptions = {},
): Promise<AskResult> {
  const start = Date.now();
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (MCP_SECRET) headers['Authorization'] = `Bearer ${MCP_SECRET}`;

    const res = await fetch(`${MCP_BASE}/ask`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt, ...options }),
      signal: AbortSignal.timeout(60_000),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

    return {
      success: !!data.success,
      content: data.content ?? null,
      worker: 'minimax',
      model: data.model ?? 'MiniMax-M2.7',
      elapsed: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      content: null,
      worker: 'minimax',
      error: err instanceof Error ? err.message : String(err),
      elapsed: Date.now() - start,
    };
  }
}

/**
 * 调用 Copilot Pro (本地 copilot-api，OpenAI 兼容)
 */
async function callCopilot(
  prompt: string,
  options: AskOptions = {},
): Promise<AskResult> {
  const start = Date.now();
  const model = options.model || COPILOT_MODEL;
  try {
    const messages: Array<{ role: string; content: string }> = [];
    if (options.system) messages.push({ role: 'system', content: options.system });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${COPILOT_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? null;

    return {
      success: !!content,
      content,
      worker: 'copilot',
      model: data.model || model,
      elapsed: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      content: null,
      worker: 'copilot',
      model,
      error: err instanceof Error ? err.message : String(err),
      elapsed: Date.now() - start,
    };
  }
}

/**
 * 调用 Ollama (本地，OpenAI 兼容接口)
 */
async function callOllama(
  prompt: string,
  options: AskOptions = {},
): Promise<AskResult> {
  const start = Date.now();
  const model = options.model || OLLAMA_MODEL;
  try {
    const messages: Array<{ role: string; content: string }> = [];
    if (options.system) messages.push({ role: 'system', content: options.system });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: false,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? null;

    return {
      success: !!content,
      content,
      worker: 'ollama',
      model: data.model || model,
      elapsed: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      content: null,
      worker: 'ollama',
      model,
      error: err instanceof Error ? err.message : String(err),
      elapsed: Date.now() - start,
    };
  }
}

// ─── 智能路由 ────────────────────────────────────────────────

/** 根据任务类型自动选择最佳引擎 */
function autoSelectHandler(prompt: string, options: AskOptions): AIHandler {
  const taskType = options.taskType?.toLowerCase() ?? '';
  const p = prompt.toLowerCase();

  // 中文营销内容 → MiniMax (中国市场专精)
  if (
    taskType === 'xiaohongshu' ||
    taskType === 'marketing' ||
    taskType === 'seo' ||
    p.includes('小红书') ||
    p.includes('种草') ||
    p.includes('营销')
  ) {
    return 'minimax';
  }

  // 代码任务 → Ollama Qwen3
  if (
    taskType === 'code' ||
    taskType === 'refactor' ||
    p.includes('代码') ||
    p.includes('function') ||
    p.includes('import') ||
    p.includes('```')
  ) {
    return 'ollama';
  }

  // 默认：Copilot Pro (最强通用能力)
  return 'copilot';
}

/** 引擎优先级 fallback 链 */
const FALLBACK_CHAIN: Record<AIHandler, AIHandler[]> = {
  minimax: ['copilot', 'ollama'],
  copilot: ['minimax', 'ollama'],
  ollama: ['copilot', 'minimax'],
  auto: ['copilot', 'minimax', 'ollama'],
};

const HANDLER_MAP: Record<string, (prompt: string, options: AskOptions) => Promise<AskResult>> = {
  minimax: callMiniMax,
  copilot: callCopilot,
  ollama: callOllama,
};

// ─── 核心导出 ────────────────────────────────────────────────

/**
 * 统一 AI 调用入口 — 智能路由 + 自动 fallback
 */
export async function askBrain(
  prompt: string,
  options: AskOptions = {},
): Promise<AskResult> {
  const handler = options.handler && options.handler !== 'auto'
    ? options.handler
    : autoSelectHandler(prompt, options);

  // Try primary handler
  const primaryFn = HANDLER_MAP[handler];
  if (primaryFn) {
    const result = await primaryFn(prompt, options);
    if (result.success) return result;

    // Primary failed — try fallback chain
    const fallbacks = FALLBACK_CHAIN[handler] ?? [];
    for (const fb of fallbacks) {
      const fbFn = HANDLER_MAP[fb];
      if (fbFn) {
        const fbResult = await fbFn(prompt, options);
        if (fbResult.success) return { ...fbResult, worker: `${fb} (fallback from ${handler})` };
      }
    }

    // All failed
    return result;
  }

  return { success: false, content: null, error: `Unknown handler: ${handler}` };
}

/**
 * 指定引擎调用（不走 fallback）
 */
export async function askDirect(
  handler: 'minimax' | 'copilot' | 'ollama',
  prompt: string,
  options: AskOptions = {},
): Promise<AskResult> {
  const fn = HANDLER_MAP[handler];
  if (!fn) return { success: false, content: null, error: `Unknown handler: ${handler}` };
  return fn(prompt, options);
}

/**
 * 批量并行内容生产 (通过云端网关)
 */
export async function batchContent(tasks: BatchTask[]): Promise<BatchResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (MCP_SECRET) headers['Authorization'] = `Bearer ${MCP_SECRET}`;
  const res = await fetch(`${MCP_BASE}/batch_content`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tasks }),
  });
  return (await res.json()) as BatchResult;
}

/**
 * 页面生成 (通过云端网关)
 */
export async function generatePage(options: GeneratePageOptions): Promise<GeneratePageResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (MCP_SECRET) headers['Authorization'] = `Bearer ${MCP_SECRET}`;
  const res = await fetch(`${MCP_BASE}/generate_page`, {
    method: 'POST',
    headers,
    body: JSON.stringify(options),
  });
  return (await res.json()) as GeneratePageResult;
}

/**
 * 执行预定义任务模板 (通过云端网关)
 */
export async function runTask(
  taskName: string,
  variables: Record<string, string> = {},
): Promise<RunTaskResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (MCP_SECRET) headers['Authorization'] = `Bearer ${MCP_SECRET}`;
  const res = await fetch(`${MCP_BASE}/run_task`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ taskName, variables }),
  });
  return (await res.json()) as RunTaskResult;
}

// ─── 健康检查（三引擎） ────────────────────────────────────────

/**
 * 综合健康检查 — 同时探测三个 AI 引擎
 */
export async function checkBrainHealth(): Promise<HealthResult> {
  const checks = await Promise.allSettled([
    // MiniMax: 通过网关 /health
    fetch(`${MCP_BASE}/health`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.ok),

    // Copilot: 检查 /v1/models
    fetch(`${COPILOT_URL}/v1/models`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.ok),

    // Ollama: 检查 /api/tags
    fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.ok),
  ]);

  const minimax = checks[0].status === 'fulfilled' && checks[0].value;
  const copilot = checks[1].status === 'fulfilled' && checks[1].value;
  const ollama = checks[2].status === 'fulfilled' && checks[2].value;

  return {
    status: (minimax || copilot || ollama) ? 'ok' : 'error',
    service: '一辉智能体 v6 (混合架构)',
    version: '6.0.0',
    timestamp: new Date().toISOString(),
    minimax,
    copilot,
    ollama,
    error: (!minimax && !copilot && !ollama) ? '所有 AI 引擎均不可达' : undefined,
  };
}

// ─── 业务层：测评 & 洞察 ────────────────────────────────────

/**
 * AI 营养顾问 — 根据测评答案生成个性化解读
 * 优先 Copilot (更强推理)，fallback MiniMax，最后兜底模板
 */
export async function summarizeQuiz(
  answers: Array<{ questionId: number; answer: string }>,
  recommendations: string[],
): Promise<string> {
  const prompt = `你是荣旺健康的 AI 营养顾问。根据用户答案生成 ≤80 字的个性化解读，专业温暖，引出推荐方案。

答案:
${answers.map((a) => `Q${a.questionId}: ${a.answer}`).join('\n')}

推荐方案: ${recommendations.join('、')}

只输出解读正文，不要前缀。`;

  try {
    const result = await askBrain(prompt, {
      handler: 'auto',
      system: '你是专业的跨境保健品营养顾问。',
      temperature: 0.6,
      maxTokens: 300,
    });

    if (result.success && result.content?.trim()) return result.content.trim();
  } catch {
    // 所有引擎不可达
  }

  // 兜底模板
  const topTags: Record<string, string> = {
    fatigue: '持续疲劳',
    sleep: '睡眠质量下降',
    immune: '免疫力偏弱',
    stress: '压力与情绪波动',
  };
  const issues = recommendations.map((r) => topTags[r] ?? r).join('、');
  return `从你的回答看，近期身体主要信号是${issues}。我们为你匹配了针对性方案，坚持 30 天通常可感知明显改善。`;
}

/**
 * AI 健康洞察 — 根据用户指标生成建议
 */
export async function generateInsights(metrics: {
  energy: number;
  sleep: number;
  stress: number;
  immunity: number;
}): Promise<Array<{ icon: string; title: string; desc: string }>> {
  const prompt = `用户最近健康指标：精力 ${metrics.energy}、睡眠 ${metrics.sleep}、压力 ${metrics.stress}、免疫 ${metrics.immunity}（百分制）。生成 3 条简短洞察，每行格式：emoji|标题|一句话建议（≤40字）。`;

  try {
    const result = await askBrain(prompt, { handler: 'auto', maxTokens: 400 });
    if (result.success && result.content?.trim()) {
      const lines = result.content.split('\n').filter((l) => l.includes('|'));
      const parsed = lines.slice(0, 3).map((line) => {
        const [icon, title, desc] = line.split('|').map((s) => s.trim());
        return { icon: icon ?? '💡', title: title ?? '健康提示', desc: desc ?? '' };
      });
      if (parsed.length === 3) return parsed;
    }
  } catch {
    // fallback
  }

  // 兜底
  const insights: Array<{ icon: string; title: string; desc: string }> = [];
  insights.push(
    metrics.energy < 60
      ? { icon: '⚡', title: '精力偏低', desc: '建议补充 B 族维生素与辅酶 Q10。' }
      : { icon: '✅', title: '精力良好', desc: '保持目前的补剂与作息习惯。' },
  );
  insights.push(
    metrics.sleep < 70
      ? { icon: '🌙', title: '睡眠可改善', desc: '睡前 1 小时远离蓝光，尝试镁甘氨酸。' }
      : { icon: '😴', title: '睡眠稳定', desc: '维持入睡节律，避免周末作息漂移。' },
  );
  insights.push(
    metrics.stress > 60
      ? { icon: '🧘', title: '压力偏高', desc: '每日 10 分钟正念，可加 L-茶氨酸。' }
      : { icon: '🎯', title: '情绪达标', desc: '继续维持当前节奏。' },
  );
  return insights;
}

// ─── 图像生成 (MiniMax image-01 直连) ─────────────────────────

export type ImageAspectRatio = '1:1' | '16:9' | '4:3' | '3:2' | '2:3' | '3:4' | '9:16' | '21:9';

export interface ImageRequestOptions {
  aspectRatio?: ImageAspectRatio;
  n?: number;
  model?: string;
  promptOptimizer?: boolean;
  timeoutMs?: number;
}

export interface ImageResult {
  success: boolean;
  images: Array<{ url: string; format: string }>;
  model?: string;
  elapsed?: number;
  error?: string;
}

/**
 * MiniMax image-01 图像生成
 */
export async function generateImage(
  prompt: string,
  opts: ImageRequestOptions = {},
): Promise<ImageResult> {
  const MINIMAX_KEY = process.env.MINIMAX_API_KEY ?? '';
  const MINIMAX_IMAGE_URL = 'https://api.minimaxi.com/v1/image_generation';

  if (!MINIMAX_KEY) {
    return { success: false, images: [], error: 'MINIMAX_API_KEY not configured' };
  }

  try {
    const res = await fetch(MINIMAX_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MINIMAX_KEY}`,
      },
      body: JSON.stringify({
        model: opts.model ?? 'image-01',
        prompt,
        aspect_ratio: opts.aspectRatio ?? '1:1',
        n: opts.n ?? 1,
        response_format: 'url',
        prompt_optimizer: opts.promptOptimizer ?? true,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
    });

    if (!res.ok) {
      return { success: false, images: [], error: `HTTP ${res.status}` };
    }

    const data = (await res.json()) as {
      base_resp?: { status_code: number; status_msg: string };
      data?: { image_urls?: string[] };
    };

    if (data.base_resp && data.base_resp.status_code !== 0) {
      return { success: false, images: [], error: data.base_resp.status_msg };
    }

    const urls = data.data?.image_urls ?? [];
    return {
      success: urls.length > 0,
      images: urls.map((u) => ({ url: u, format: 'png' })),
      model: 'image-01',
    };
  } catch (err) {
    return {
      success: false,
      images: [],
      error: err instanceof Error ? err.message : 'network error',
    };
  }
}

/**
 * 批量生成图像 (串行，避免限频)
 */
export async function batchGenerateImages(
  tasks: Array<{ id: string; prompt: string; aspectRatio?: ImageAspectRatio }>,
): Promise<Array<ImageResult & { id: string }>> {
  const results: Array<ImageResult & { id: string }> = [];
  for (const task of tasks) {
    const r = await generateImage(task.prompt, { aspectRatio: task.aspectRatio });
    results.push({ id: task.id, ...r });
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  return results;
}
