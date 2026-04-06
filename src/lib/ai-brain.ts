/**
 * ai-brain.ts — Next.js 前端调用一辉智能体的统一入口
 *
 * 通过 HTTP 调用本地 AI 大脑池（经 Cloudflare Tunnel 暴露）
 * 在 Cowork 里 import { askBrain } from '@/lib/ai-brain' 即可使用
 */

// 通过 Cloudflare Tunnel 暴露的地址，或直接 localhost（本地开发）
// NOTE: 'http://localhost:8787' fallback is for local development only; set AI_MCP_URL in production
const MCP_BASE = process.env.NEXT_PUBLIC_AI_MCP_URL || process.env.AI_MCP_URL || 'http://localhost:8787';
const MCP_SECRET = process.env.AI_MCP_SECRET || '';

interface AskOptions {
  handler?: string;      // 'copilot' | 'minimax' | 'qwen'
  taskType?: string;     // TASK_ROUTING key, e.g. 'xiaohongshu'
  model?: string;        // specific model, e.g. 'gpt-5.4'
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIResult {
  success: boolean;
  content?: string;
  model?: string;
  worker?: string;
  elapsed?: number;
  error?: string;
}

interface BatchTask {
  label: string;
  prompt: string;
  taskType?: string;
  handler?: string;
  model?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

interface BatchResult {
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: Array<AIResult & { task: string }>;
}

interface GeneratePageOptions {
  type: 'seo' | 'product';
  topic?: string;
  productName?: string;
  category?: string;
  ingredients?: string[];
  targetWords?: number;
  keywords?: string[];
}

async function mcpFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (MCP_SECRET) headers['Authorization'] = `Bearer ${MCP_SECRET}`;

  const res = await fetch(`${MCP_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`Error calling ${path}: ${(err as { error?: string }).error || `HTTP ${res.status}`}`);
  }

  return res.json() as Promise<T>;
}

/**
 * 通用 AI 调用 — 根据 handler/taskType/model 智能路由到最优模型
 *
 * @example
 * // 小红书文案（走 MiniMax）
 * const result = await askBrain('写一篇关于NMN的小红书笔记', { taskType: 'xiaohongshu' });
 *
 * // GPT-5.4 长文（走 Copilot Pro）
 * const result = await askBrain('Write SEO article about CoQ10', { handler: 'copilot', model: 'gpt-5.4' });
 *
 * // 本地代码生成（走 Qwen3）
 * const result = await askBrain('生成产品卡片组件 HTML', { handler: 'qwen' });
 */
export async function askBrain(prompt: string, options: AskOptions = {}): Promise<AIResult> {
  return mcpFetch<AIResult>('/ask', { prompt, ...options });
}

/**
 * 批量内容生产 — 并行调用多个 AI 模型
 *
 * @example
 * const result = await batchContent([
 *   { label: '小红书1', prompt: 'NMN抗衰老笔记', taskType: 'xiaohongshu' },
 *   { label: '小红书2', prompt: '辅酶Q10心脏保护', taskType: 'xiaohongshu' },
 *   { label: '公众号', prompt: '荣旺品牌故事', taskType: 'wechat-article' },
 * ]);
 */
export async function batchContent(tasks: BatchTask[]): Promise<BatchResult> {
  return mcpFetch<BatchResult>('/batch_content', { tasks });
}

/**
 * 页面生成流水线 — SEO文章或产品描述，多模型流水线自动输出
 */
export async function generatePage(options: GeneratePageOptions): Promise<Record<string, unknown>> {
  return mcpFetch<Record<string, unknown>>('/generate_page', options);
}

/**
 * 健康检查 — 确认一辉智能体 HTTP 服务在线
 */
export async function checkBrainHealth(): Promise<{ status: string; models: string[] }> {
  const headers: Record<string, string> = {};
  if (MCP_SECRET) headers['Authorization'] = `Bearer ${MCP_SECRET}`;

  const res = await fetch(`${MCP_BASE}/health`, { headers });
  return res.json() as Promise<{ status: string; models: string[] }>;
}
