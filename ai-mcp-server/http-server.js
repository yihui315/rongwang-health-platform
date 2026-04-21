/**
 * 一辉智能体 — HTTP 网关服务器 v4
 *
 * 功能：
 *   GET  /health          — 健康检查
 *   POST /ask             — 通用 AI 调用
 *   POST /generate_page   — SEO 文章 / 产品描述流水线
 *   POST /batch_content   — 批量并行内容生产
 *   POST /run_task        — 执行预定义任务模板
 *   GET  /models          — 列出可用模型和任务路由
 *
 * 鉴权：Bearer Token（API_SECRET 环境变量）
 * 端口：HTTP_PORT 环境变量（默认 8787）
 */

import express from 'express';
import cors from 'cors';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 加载 .env
try {
  const envPath = join(__dirname, '.env');
  const envContent = await readFile(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
} catch {
  // .env 不存在时继续，依赖系统环境变量
}

// 复用 orchestrator.js 核心调度
import {
  createClients,
  callAI,
  callMultiAI,
  COPILOT_MODELS,
  TASK_ROUTING,
  logTask,
  saveOutput,
} from './orchestrator.js';

// 复用 task-loader.js
import { loadTask, listTasks } from './task-loader.js';

// ─── 初始化 ─────────────────────────────────────────────────

const PORT = parseInt(process.env.HTTP_PORT || '8787', 10);
const API_SECRET = process.env.API_SECRET || '';

// 创建 AI 客户端（优雅降级：缺少配置的客户端不会崩溃）
const clients = createClients(process.env);

const app = express();

// ─── 中间件 ─────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 请求日志中间件
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// Bearer Token 鉴权中间件（/health 路由无需鉴权）
function requireAuth(req, res, next) {
  if (!API_SECRET) {
    // 未配置 API_SECRET 时跳过鉴权（开发/测试用）
    return next();
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== API_SECRET) {
    return res.status(401).json({ error: '未授权：Token 无效或缺失' });
  }
  next();
}

// ─── 路由 ───────────────────────────────────────────────────

/**
 * GET /health — 健康检查（无需鉴权）
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: '一辉智能体 HTTP 网关',
    version: '4.1.0',
    timestamp: new Date().toISOString(),
    minimax: !!process.env.MINIMAX_API_KEY,
    copilot: !!process.env.COPILOT_API_URL,
    ollama: !!process.env.OLLAMA_BASE_URL,
  });
});

/**
 * GET /models — 列出可用模型和任务路由
 */
app.get('/models', requireAuth, (_req, res) => {
  res.json({
    copilotModels: COPILOT_MODELS,
    taskRouting: TASK_ROUTING,
    available: {
      minimax: !!process.env.MINIMAX_API_KEY,
      copilot: !!process.env.COPILOT_API_URL,
      qwen: !!process.env.OLLAMA_BASE_URL,
    },
  });
});

/**
 * POST /ask — 通用 AI 调用
 *
 * 请求体：
 *   prompt      string    用户提问（必填，与 messages 二选一）
 *   messages    array     完整消息数组（与 prompt 二选一）
 *   handler     string    指定处理器: minimax | copilot | qwen
 *   taskType    string    按任务路由: xiaohongshu | seo-article | ...
 *   model       string    指定模型（仅 copilot handler 有效）
 *   system      string    系统提示词
 *   temperature number    创意度（0~1，默认 0.7）
 *   maxTokens   number    最大 token 数（默认 4096）
 *   save        boolean   是否保存输出文件
 *   filename    string    保存文件名
 */
app.post('/ask', requireAuth, async (req, res) => {
  try {
    const {
      prompt,
      messages: rawMessages,
      handler,
      taskType,
      model,
      system,
      temperature,
      maxTokens,
      save = false,
      filename,
    } = req.body;

    if (!prompt && !rawMessages) {
      return res.status(400).json({ error: '缺少 prompt 或 messages 参数' });
    }

    // 构建消息数组
    let messages = rawMessages;
    if (!messages) {
      messages = [];
      if (system) messages.push({ role: 'system', content: system });
      messages.push({ role: 'user', content: prompt });
    }

    // 确定路由目标：handler > taskType > 默认 minimax（服务器直连场景优先）
    const routeTarget = handler || taskType || 'minimax';
    const options = {};
    if (model) options.model = model;
    if (temperature !== undefined) options.temperature = temperature;
    if (maxTokens !== undefined) options.maxTokens = maxTokens;

    const result = await callAI(clients, routeTarget, messages, options);

    // 可选保存输出
    if (save && result.content) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const outFile = filename || `ask-${ts}.md`;
      await saveOutput(outFile, result.content, process.env.OUTPUT_DIR);
    }

    // 记录日志
    await logTask('ask', result, process.env.LOG_DIR).catch(() => {});

    res.json({
      success: result.success,
      content: result.content,
      worker: result.worker,
      model: result.model,
      elapsed: result.elapsed,
      error: result.error || undefined,
    });
  } catch (err) {
    console.error('[/ask 错误]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /generate_page — SEO 文章 / 产品描述多步串联流水线
 *
 * 请求体：
 *   topic       string  文章主题或产品名（必填）
 *   type        string  'seo' | 'product' | 'landing'（默认 seo）
 *   keywords    array   关键词列表
 *   audience    string  目标人群
 *   brand       string  品牌名（默认"荣旺健康"）
 *   language    string  'zh' | 'en'（默认 zh）
 */
app.post('/generate_page', requireAuth, async (req, res) => {
  try {
    const {
      topic,
      type = 'seo',
      keywords = [],
      audience = '健康关注人群',
      brand = '荣旺健康',
      language = 'zh',
    } = req.body;

    if (!topic) {
      return res.status(400).json({ error: '缺少 topic 参数' });
    }

    const keywordsStr = keywords.length > 0 ? keywords.join('、') : topic;

    // 步骤 1：生成大纲（MiniMax 中文 / Copilot 英文）
    const outlineHandler = language === 'en' ? 'seo-article' : 'xiaohongshu';
    const outlinePrompt = language === 'en'
      ? `Create a detailed SEO article outline for: "${topic}"\nKeywords: ${keywordsStr}\nTarget: ${audience}\nBrand: ${brand}`
      : `为以下主题创建详细的内容大纲：\n主题：${topic}\n关键词：${keywordsStr}\n目标人群：${audience}\n品牌：${brand}\n\n请输出：1. 标题方向（3个）2. 内容框架（5-7个章节）3. 核心卖点`;

    const outlineResult = await callAI(clients, outlineHandler, [
      { role: 'user', content: outlinePrompt },
    ]);

    if (!outlineResult.success) {
      return res.status(502).json({
        error: `大纲生成失败: ${outlineResult.error}`,
        step: 'outline',
      });
    }

    // 步骤 2：根据大纲生成完整内容
    const contentTaskType = type === 'product' ? 'cn-product-desc'
      : type === 'landing' ? 'landing-copy'
      : language === 'en' ? 'seo-article' : 'cn-seo';

    const contentPrompt = language === 'en'
      ? `Based on this outline, write a complete SEO article:\n\n${outlineResult.content}\n\nRequirements: 1500+ words, SEO optimized, engaging content`
      : `根据以下大纲，写完整的${type === 'product' ? '产品描述' : type === 'landing' ? '落地页文案' : 'SEO 文章'}：\n\n${outlineResult.content}\n\n要求：内容完整、有说服力、品牌调性统一`;

    const contentResult = await callAI(clients, contentTaskType, [
      { role: 'user', content: contentPrompt },
    ]);

    // 保存输出
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const outFile = `page-${type}-${ts}.md`;
    if (contentResult.content) {
      await saveOutput(outFile, contentResult.content, process.env.OUTPUT_DIR).catch(() => {});
    }

    res.json({
      success: true,
      outline: outlineResult.content,
      content: contentResult.content,
      file: outFile,
      steps: [
        { step: 'outline', worker: outlineResult.worker, model: outlineResult.model, elapsed: outlineResult.elapsed },
        { step: 'content', worker: contentResult.worker, model: contentResult.model, elapsed: contentResult.elapsed },
      ],
    });
  } catch (err) {
    console.error('[/generate_page 错误]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /batch_content — 批量并行内容生产
 *
 * 请求体：
 *   tasks  array  任务列表，每项格式：
 *     { label, prompt, handler, taskType, model, system, temperature, maxTokens }
 */
app.post('/batch_content', requireAuth, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: '缺少 tasks 数组或为空' });
    }

    // 构建多任务调用列表
    const aiTasks = tasks.map((t) => {
      const messages = [];
      if (t.system) messages.push({ role: 'system', content: t.system });
      messages.push({ role: 'user', content: t.prompt });

      return {
        label: t.label || `task-${Math.random().toString(36).slice(2, 7)}`,
        model: t.handler || t.taskType || 'minimax',
        messages,
        options: {
          ...(t.model && { model: t.model }),
          ...(t.temperature !== undefined && { temperature: t.temperature }),
          ...(t.maxTokens !== undefined && { maxTokens: t.maxTokens }),
        },
      };
    });

    const results = await callMultiAI(clients, aiTasks);

    // 统计
    const succeeded = results.filter((r) => r.success).length;
    const failed = results.length - succeeded;

    res.json({
      success: true,
      total: results.length,
      succeeded,
      failed,
      results,
    });
  } catch (err) {
    console.error('[/batch_content 错误]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /run_task — 执行预定义任务模板
 *
 * 请求体：
 *   taskName   string  任务模板名称（tasks/ 目录下的 JSON 文件名）
 *   variables  object  变量替换 { key: value }
 *   save       boolean 是否保存输出
 */
app.post('/run_task', requireAuth, async (req, res) => {
  try {
    const { taskName, variables = {}, save = true } = req.body;

    if (!taskName) {
      return res.status(400).json({ error: '缺少 taskName 参数' });
    }

    const task = await loadTask(taskName);
    if (!task) {
      return res.status(404).json({ error: `任务模板 "${taskName}" 不存在` });
    }

    // 变量替换（支持 {{key}} 格式）
    let prompt = task.prompt || '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const allVars = { timestamp, ...variables };

    for (const [key, value] of Object.entries(allVars)) {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    }

    // 构建消息
    const messages = [];
    if (task.system) messages.push({ role: 'system', content: task.system });
    messages.push({ role: 'user', content: prompt });

    // 路由：task.model (minimax/copilot/qwen) 或 task.taskType
    const routeTarget = task.taskType || task.model || 'minimax';
    const options = {
      ...(task.temperature !== undefined && { temperature: task.temperature }),
      ...(task.maxTokens !== undefined && { maxTokens: task.maxTokens }),
    };

    const result = await callAI(clients, routeTarget, messages, options);

    // 保存输出
    let savedFile = null;
    if (save && result.content) {
      const outFilename = (task.outputFile || `${taskName}-{{timestamp}}.md`)
        .replace('{{timestamp}}', timestamp);
      savedFile = await saveOutput(outFilename, result.content, process.env.OUTPUT_DIR).catch(() => null);
    }

    // 记录日志
    await logTask(taskName, result, process.env.LOG_DIR).catch(() => {});

    res.json({
      success: result.success,
      taskName,
      content: result.content,
      worker: result.worker,
      model: result.model,
      elapsed: result.elapsed,
      file: savedFile,
      error: result.error || undefined,
    });
  } catch (err) {
    console.error('[/run_task 错误]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 404 处理 ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    available: ['GET /health', 'GET /models', 'POST /ask', 'POST /generate_page', 'POST /batch_content', 'POST /run_task'],
  });
});

// ─── 全局错误处理 ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[未捕获错误]', err);
  res.status(500).json({ error: '服务器内部错误', detail: err.message });
});

// ─── 启动 ────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🌐 一辉智能体 HTTP 网关 已启动          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`📡 监听地址: http://0.0.0.0:${PORT}`);
  console.log(`🔑 鉴权模式: ${API_SECRET ? 'Bearer Token' : '⚠️  无鉴权（开发模式）'}`);
  console.log('');
  console.log('可用模型：');
  console.log(`  MiniMax  ${process.env.MINIMAX_API_KEY ? '✅ 已配置（直连云端 API）' : '❌ 未配置（MINIMAX_API_KEY 缺失）'}`);
  console.log(`  Copilot  ${process.env.COPILOT_API_URL ? '✅ 已配置' : '⚠️  未配置（可选）'}`);
  console.log(`  Qwen3    ${process.env.OLLAMA_BASE_URL ? '✅ 已配置' : '⚠️  未配置（可选，2G内存服务器不建议）'}`);
  console.log('');
  console.log('健康检查: curl http://localhost:' + PORT + '/health');
  console.log('');
});
