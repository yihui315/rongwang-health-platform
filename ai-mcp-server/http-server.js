#!/usr/bin/env node
/**
 * 一辉智能体 HTTP 包装 — 让 Cowork 云端能调用本地 AI 大脑池
 *
 * 原有 stdio MCP (server.js) 不动，这是并行 HTTP 入口
 * 配合 Cloudflare Tunnel 暴露为公网 HTTPS
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createClients, callAI, callMultiAI,
  COPILOT_MODELS, TASK_ROUTING,
  logTask, saveOutput,
} from './orchestrator.js';

dotenv.config();

const app = express();
const PORT = process.env.HTTP_PORT || 8787;
const API_SECRET = process.env.API_SECRET || '';

if (!API_SECRET) {
  console.warn('⚠️  API_SECRET is not set — running without authentication. Set API_SECRET in .env for production.');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── 简单 Bearer Token 认证 ─────────────────────────
if (API_SECRET) {
  app.use((req, res, next) => {
    if (req.path === '/health') return next();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token !== API_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  });
}

const clients = createClients(process.env);

// ─── 健康检查 ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '4.1.0',
    name: 'yihui-agent-http',
    models: Object.keys(COPILOT_MODELS),
    tasks: Object.keys(TASK_ROUTING),
    timestamp: new Date().toISOString(),
  });
});

// ─── POST /ask — 通用 AI 调用 ────────────────────────
// 支持按角色(handler)或按任务类型(taskType)路由
app.post('/ask', async (req, res) => {
  try {
    const { handler, taskType, model, prompt, system, temperature, maxTokens } = req.body;

    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: prompt });

    // 确定路由: taskType > handler > 默认 copilot
    const routeKey = taskType || handler || 'copilot';
    const options = { temperature, maxTokens };
    if (model) options.model = model;

    const result = await callAI(clients, routeKey, messages, options);
    await logTask(`http_${routeKey}`, result, process.env.LOG_DIR);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error, elapsed: result.elapsed });
    }

    res.json({
      success: true,
      content: result.content,
      model: result.model,
      worker: result.worker,
      elapsed: result.elapsed,
      usage: result.usage,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /generate_page — SEO/产品页面生成 ─────────
app.post('/generate_page', async (req, res) => {
  try {
    const { type, topic, productName, category, ingredients, targetWords, keywords } = req.body;

    if (type === 'seo' || topic) {
      // SEO 文章流水线: GPT-5.4 → MiniMax → Qwen3
      const t = topic || productName;
      const kw = keywords?.length ? `Target keywords: ${keywords.join(', ')}` : '';

      const enResult = await callAI(clients, 'copilot', [
        { role: 'system', content: 'You are an expert SEO content writer for health supplements. Write in-depth, evidence-based articles.' },
        { role: 'user', content: `Write a ${targetWords || 1500}-word SEO article about: ${t}\n${kw}\nInclude: H2/H3 headings, meta description, FAQ section.` },
      ], { model: 'gpt-5.4', maxTokens: 8192 });

      const cnResult = await callAI(clients, 'minimax', [
        { role: 'system', content: '你是健康保健品翻译专家。翻译符合中国消费者习惯，保留SEO结构。' },
        { role: 'user', content: `翻译为中文SEO文章：\n\n${enResult.success ? enResult.content : t}` },
      ], { maxTokens: 8192 });

      const htmlResult = await callAI(clients, 'qwen', [
        { role: 'system', content: '前端工程师，生成荣旺健康风格的SEO文章HTML。配色：#FAFAFA背景，#0A8F7F强调色。' },
        { role: 'user', content: `生成完整HTML页面：\n\n${cnResult.success ? cnResult.content : enResult.content || t}` },
      ], { maxTokens: 8192 });

      const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
      const files = {};
      if (enResult.success) files[`${slug}-en.md`] = enResult.content;
      if (cnResult.success) files[`${slug}-cn.md`] = cnResult.content;
      if (htmlResult.success) files[`${slug}.html`] = htmlResult.content;

      res.json({
        success: true,
        type: 'seo',
        topic: t,
        files,
        summary: {
          en: { success: enResult.success, elapsed: enResult.elapsed },
          cn: { success: cnResult.success, elapsed: cnResult.elapsed },
          html: { success: htmlResult.success, elapsed: htmlResult.elapsed },
        },
      });

    } else if (type === 'product' || productName) {
      // 产品描述流水线
      const enResult = await callAI(clients, 'copilot', [
        { role: 'system', content: 'Health supplement product copywriter. Compelling, science-backed descriptions.' },
        { role: 'user', content: `Product: ${productName}\nCategory: ${category || '保健品'}\nIngredients: ${(ingredients || []).join(', ')}\n\nWrite: headline, 5 benefits, how it works, trust signals, FAQ.` },
      ], { model: 'gpt-5.4' });

      const cnResult = await callAI(clients, 'minimax', [
        { role: 'system', content: '保健品电商文案专家，跨境电商风格。' },
        { role: 'user', content: `本地化为中文电商文案：\n\n${enResult.success ? enResult.content : productName}` },
      ]);

      res.json({
        success: true,
        type: 'product',
        productName,
        en: { success: enResult.success, content: enResult.content, elapsed: enResult.elapsed },
        cn: { success: cnResult.success, content: cnResult.content, elapsed: cnResult.elapsed },
      });

    } else {
      res.status(400).json({ error: 'Need topic (for SEO) or productName (for product page)' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /batch_content — 批量内容生产 ──────────────
app.post('/batch_content', async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'tasks array is required' });
    }

    // 并行执行所有任务
    const taskList = tasks.map((t, i) => ({
      label: t.label || `task-${i}`,
      model: t.taskType || t.handler || t.model || 'minimax',
      messages: [
        ...(t.system ? [{ role: 'system', content: t.system }] : []),
        { role: 'user', content: t.prompt },
      ],
      options: { temperature: t.temperature, maxTokens: t.maxTokens },
    }));

    const results = await callMultiAI(clients, taskList);

    res.json({
      success: true,
      total: results.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /models — 列出可用模型 ──────────────────────
app.get('/models', (req, res) => {
  res.json({
    copilot: COPILOT_MODELS,
    local: { minimax: 'MiniMax-Text-01', qwen: 'qwen3-coder:30b' },
    taskRoutes: TASK_ROUTING,
  });
});

// ─── 启动 ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌐 一辉智能体 HTTP 已启动 → http://localhost:${PORT}`);
  console.log(`   配合 cloudflared tunnel --url http://localhost:${PORT}`);
  console.log(`   暴露为公网 HTTPS 后，Cowork 即可直调`);
  console.log(`   ${API_SECRET ? '🔒 已启用 Bearer Token 认证' : '⚠️  无认证（仅限开发）'}`);
});
