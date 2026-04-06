/**
 * 一辉智能体 — Next.js 前端调用入口 (ai-brain)
 *
 * 统一接口，让 Cowork 云端沙箱能直接调用部署在腾讯云服务器上的
 * 一辉智能体 HTTP 网关，将内容生产任务甩给 MiniMax / Copilot / Qwen3，
 * 减少 Claude token 消耗。
 *
 * 环境变量：
 *   NEXT_PUBLIC_AI_MCP_URL  — 服务器地址（前端可见）
 *   AI_MCP_URL              — 服务器地址（服务端专用，优先级更高）
 *   AI_MCP_SECRET           — Bearer Token 鉴权密钥
 *
 * 使用示例：
 * @example
 * import { askBrain, batchContent, generatePage, runTask, checkBrainHealth } from '@/lib/ai-brain';
 *
 * // 通用 AI 调用
 * const result = await askBrain('写一篇NMN小红书笔记', { taskType: 'xiaohongshu' });
 * console.log(result.content);
 *
 * // 批量内容生产（并行）
 * const batch = await batchContent([
 *   { label: '小红书1', prompt: '写NMN种草笔记', taskType: 'xiaohongshu' },
 *   { label: '小红书2', prompt: '写辅酶Q10笔记', taskType: 'xiaohongshu' },
 * ]);
 *
 * // SEO / 产品描述流水线
 * const page = await generatePage({ topic: 'NMN抗衰老保健品', type: 'seo', keywords: ['NMN', '抗衰老'] });
 *
 * // 执行预定义模板
 * const post = await runTask('xiaohongshu-post', { productName: 'NMN', benefit: '抗衰老', audience: '40岁女性' });
 */

// ─── 配置 ────────────────────────────────────────────────────

/** HTTP 网关基础地址（优先使用服务端环境变量，回退到公共变量，最后本地调试地址）*/
const MCP_BASE =
  (typeof process !== 'undefined' && process.env?.AI_MCP_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_AI_MCP_URL) ||
  'http://localhost:8787';

/** Bearer Token 鉴权密钥 */
const MCP_SECRET =
  (typeof process !== 'undefined' && process.env?.AI_MCP_SECRET) || '';

// ─── 类型定义 ─────────────────────────────────────────────────

/** AI 调用选项 */
export interface AskOptions {
  /** 指定处理器: minimax | copilot | qwen */
  handler?: 'minimax' | 'copilot' | 'qwen';
  /** 按任务路由: xiaohongshu | seo-article | wechat-article | ... */
  taskType?: string;
  /** 指定模型（仅 copilot handler 有效）*/
  model?: string;
  /** 系统提示词 */
  system?: string;
  /** 创意度（0~1）*/
  temperature?: number;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 是否保存输出文件 */
  save?: boolean;
  /** 保存文件名 */
  filename?: string;
}

/** AI 调用结果 */
export interface AskResult {
  success: boolean;
  content: string | null;
  worker?: string;
  model?: string;
  elapsed?: number;
  error?: string;
}

/** 批量内容任务项 */
export interface BatchTask {
  /** 任务标签（用于结果对应）*/
  label: string;
  /** 用户提问 */
  prompt: string;
  /** 指定处理器 */
  handler?: string;
  /** 任务类型路由 */
  taskType?: string;
  /** 指定模型 */
  model?: string;
  /** 系统提示词 */
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

/** 批量任务结果 */
export interface BatchResult {
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: Array<AskResult & { task: string }>;
}

/** 页面生成选项 */
export interface GeneratePageOptions {
  /** 主题或产品名（必填）*/
  topic: string;
  /** 内容类型：seo | product | landing */
  type?: 'seo' | 'product' | 'landing';
  /** 关键词列表 */
  keywords?: string[];
  /** 目标人群 */
  audience?: string;
  /** 品牌名 */
  brand?: string;
  /** 语言：zh | en */
  language?: 'zh' | 'en';
}

/** 页面生成结果 */
export interface GeneratePageResult {
  success: boolean;
  outline: string | null;
  content: string | null;
  file?: string;
  steps?: Array<{
    step: string;
    worker?: string;
    model?: string;
    elapsed?: number;
  }>;
  error?: string;
}

/** 模板执行选项 */
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

/** 健康检查结果 */
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

// ─── 工具函数 ─────────────────────────────────────────────────

/** 构建请求头 */
function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (MCP_SECRET) {
    headers['Authorization'] = `Bearer ${MCP_SECRET}`;
  }
  return headers;
}

/** 发起 POST 请求并解析 JSON */
async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const url = `${MCP_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  const data = await res.json() as T;

  if (!res.ok) {
    const errData = data as Record<string, unknown>;
    throw new Error(
      (errData?.error as string) ||
      `HTTP ${res.status}: ${res.statusText}`
    );
  }

  return data;
}

/** 发起 GET 请求并解析 JSON */
async function getJSON<T>(path: string): Promise<T> {
  const url = `${MCP_BASE}${path}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(),
  });

  const data = await res.json() as T;

  if (!res.ok) {
    const errData = data as Record<string, unknown>;
    throw new Error(
      (errData?.error as string) ||
      `HTTP ${res.status}: ${res.statusText}`
    );
  }

  return data;
}

// ─── 导出函数 ─────────────────────────────────────────────────

/**
 * 通用 AI 调用
 *
 * @param prompt - 用户提问
 * @param options - 调用选项（handler / taskType / model 等）
 * @returns AI 回复结果
 *
 * @example
 * const result = await askBrain('写一篇NMN小红书笔记', { taskType: 'xiaohongshu' });
 * console.log(result.content);
 *
 * @example
 * // 指定 GPT-5.4 写 SEO 文章
 * const article = await askBrain('Write an SEO article about NMN supplements', {
 *   handler: 'copilot',
 *   model: 'gpt-5.4',
 * });
 */
export async function askBrain(
  prompt: string,
  options: AskOptions = {}
): Promise<AskResult> {
  return postJSON<AskResult>('/ask', { prompt, ...options });
}

/**
 * 批量并行内容生产
 *
 * @param tasks - 任务列表（并行执行，互不阻塞）
 * @returns 批量结果
 *
 * @example
 * const batch = await batchContent([
 *   { label: '小红书1', prompt: '写NMN种草笔记', taskType: 'xiaohongshu' },
 *   { label: '小红书2', prompt: '写辅酶Q10笔记', taskType: 'xiaohongshu' },
 *   { label: '公众号', prompt: '写NMN科普文章', taskType: 'wechat-article' },
 * ]);
 * batch.results.forEach(r => console.log(r.task, r.content?.slice(0, 100)));
 */
export async function batchContent(tasks: BatchTask[]): Promise<BatchResult> {
  return postJSON<BatchResult>('/batch_content', { tasks });
}

/**
 * SEO 文章 / 产品描述 / 落地页 流水线生成
 *
 * @param options - 生成选项（topic 必填）
 * @returns 包含大纲和完整内容的结果
 *
 * @example
 * const page = await generatePage({
 *   topic: 'NMN抗衰老保健品',
 *   type: 'seo',
 *   keywords: ['NMN', '抗衰老', '线粒体'],
 *   audience: '40岁以上女性',
 * });
 * console.log(page.content);
 */
export async function generatePage(
  options: GeneratePageOptions
): Promise<GeneratePageResult> {
  return postJSON<GeneratePageResult>('/generate_page', options);
}

/**
 * 执行预定义任务模板
 *
 * @param taskName - 模板名称（tasks/ 目录下 JSON 文件名，不含扩展名）
 * @param variables - 变量替换对象 { key: value }
 * @returns 模板执行结果
 *
 * @example
 * // 执行小红书模板
 * const post = await runTask('xiaohongshu-post', {
 *   productName: 'NMN 6000',
 *   benefit: '抗衰老、提升精力',
 *   audience: '40岁职场女性',
 * });
 * console.log(post.content);
 *
 * @example
 * // 执行 SEO 文章模板
 * const article = await runTask('seo-article', {
 *   topic: 'NMN的功效与作用',
 *   keywords: 'NMN,抗衰老,保健品',
 * });
 */
export async function runTask(
  taskName: string,
  variables: Record<string, string> = {}
): Promise<RunTaskResult> {
  return postJSON<RunTaskResult>('/run_task', { taskName, variables });
}

/**
 * 健康检查（无需鉴权）
 *
 * @returns 服务状态，包含各 AI 后端可用情况
 *
 * @example
 * const health = await checkBrainHealth();
 * if (health.status === 'ok') {
 *   console.log('MiniMax 可用:', health.minimax);
 *   console.log('Copilot 可用:', health.copilot);
 * }
 */
export async function checkBrainHealth(): Promise<HealthResult> {
  try {
    return await getJSON<HealthResult>('/health');
  } catch (err) {
    return {
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
