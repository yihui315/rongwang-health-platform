#!/usr/bin/env node
/**
 * 荣旺健康 MCP Server v4 — 全自动多模型调度
 *
 * Copilot Pro 解锁全部顶级模型 + MiniMax中文 + Qwen3本地
 * 零剪贴板，全部API自动化
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import {
  createClients, callAI, callMultiAI,
  COPILOT_MODELS, TASK_ROUTING,
  logTask, saveOutput,
} from './orchestrator.js';
import { loadTask, listTasks } from './task-loader.js';

dotenv.config();

const clients = createClients(process.env);

const server = new Server(
  { name: 'yihui-agent', version: '4.0.0' },
  { capabilities: { tools: {} } }
);

// ─── 工具定义 ────────────────────────────────────────────

const copilotModelEnum = Object.keys(COPILOT_MODELS);

const TOOLS = [
  // === 按角色调用 ===
  {
    name: 'ask_gpt5',
    description: 'GPT-5.4 (Copilot): 最强内容生成。SEO长文、深度产品描述、复杂营销策略。适合需要最高质量的任务。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt:      { type: 'string', description: '任务描述' },
        system:      { type: 'string', description: '系统角色（可选）' },
        temperature: { type: 'number' },
        maxTokens:   { type: 'number' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_gpt4o',
    description: 'GPT-4o (Copilot): 快速通用任务。邮件、翻译、简单文案、摘要。速度快、质量好。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt:      { type: 'string', description: '任务描述' },
        system:      { type: 'string', description: '系统角色（可选）' },
        temperature: { type: 'number' },
        maxTokens:   { type: 'number' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_codex',
    description: 'GPT-5.3 Codex (Copilot): 云端代码生成。复杂代码、架构设计、代码重构。比Qwen3更强但需网络。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt:      { type: 'string', description: '代码任务描述' },
        system:      { type: 'string', description: '系统角色（可选）' },
        temperature: { type: 'number' },
        maxTokens:   { type: 'number' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_gemini',
    description: 'Gemini 2.5 Pro (Copilot): 长文分析、竞品研报、市场趋势。擅长处理大量信息和结构化分析。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt:      { type: 'string', description: '分析任务描述' },
        system:      { type: 'string', description: '系统角色（可选）' },
        temperature: { type: 'number' },
        maxTokens:   { type: 'number' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_minimax',
    description: 'MiniMax 2.7 (API直连): 中国市场专用。小红书、微信公众号、抖音脚本、中文电商文案。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt:      { type: 'string', description: '任务描述' },
        system:      { type: 'string', description: '系统角色（可选）' },
        temperature: { type: 'number' },
        maxTokens:   { type: 'number' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_qwen',
    description: 'Qwen3-Coder 30B (Ollama本地): 离线代码生成。HTML/CSS/JS组件、数据处理。免费无限调用，无需网络。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt:      { type: 'string', description: '代码任务描述' },
        system:      { type: 'string', description: '系统角色（可选）' },
        temperature: { type: 'number' },
        maxTokens:   { type: 'number' },
      },
      required: ['prompt'],
    },
  },

  // === 自由选模型 ===
  {
    name: 'ask_copilot',
    description: `自由选择Copilot Pro模型。可用: ${copilotModelEnum.join(', ')}`,
    inputSchema: {
      type: 'object',
      properties: {
        model:  { type: 'string', description: '模型名', enum: copilotModelEnum },
        prompt: { type: 'string', description: '任务描述' },
        system: { type: 'string' },
        temperature: { type: 'number' },
        maxTokens:   { type: 'number' },
      },
      required: ['model', 'prompt'],
    },
  },

  // === 智能路由 ===
  {
    name: 'smart_route',
    description: `智能路由：根据任务类型自动选最优模型。支持: ${Object.keys(TASK_ROUTING).join(', ')}`,
    inputSchema: {
      type: 'object',
      properties: {
        taskType: { type: 'string', enum: Object.keys(TASK_ROUTING) },
        prompt:   { type: 'string' },
        system:   { type: 'string' },
        temperature: { type: 'number' },
        maxTokens:   { type: 'number' },
      },
      required: ['taskType', 'prompt'],
    },
  },

  // === 多模型并行 ===
  {
    name: 'multi_ai',
    description: '并行调用多个AI模型处理不同子任务，适合A/B对比或多视角分析。',
    inputSchema: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label:  { type: 'string' },
              model:  { type: 'string', description: '模型标识或任务类型' },
              prompt: { type: 'string' },
              system: { type: 'string' },
            },
            required: ['label', 'model', 'prompt'],
          },
        },
      },
      required: ['tasks'],
    },
  },

  // === 业务流水线 ===
  {
    name: 'write_seo',
    description: '全自动SEO文章流水线: GPT-5.4写英文 → MiniMax翻译中文 → Qwen3生成HTML页面。输出3个文件。',
    inputSchema: {
      type: 'object',
      properties: {
        topic:       { type: 'string', description: '文章主题' },
        targetWords: { type: 'number', description: '目标字数，默认1500' },
        keywords:    { type: 'array', items: { type: 'string' } },
      },
      required: ['topic'],
    },
  },
  {
    name: 'write_product',
    description: '产品描述流水线: GPT-5.4写英文 → MiniMax中文化。全自动双语输出。',
    inputSchema: {
      type: 'object',
      properties: {
        productName: { type: 'string' },
        category:    { type: 'string' },
        ingredients: { type: 'array', items: { type: 'string' } },
      },
      required: ['productName', 'category'],
    },
  },
  {
    name: 'competitor_scan',
    description: '全自动竞品分析: Gemini调研情报 → GPT-5.4生成分析报告。',
    inputSchema: {
      type: 'object',
      properties: {
        competitors: { type: 'array', items: { type: 'string' } },
        focus:       { type: 'string' },
      },
      required: ['competitors'],
    },
  },

  // === 模型列表 & 任务模板 ===
  {
    name: 'list_models',
    description: '列出所有可用的Copilot Pro模型',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'run_task',
    description: '运行预定义任务模板',
    inputSchema: {
      type: 'object',
      properties: {
        taskName:  { type: 'string' },
        variables: { type: 'object' },
      },
      required: ['taskName'],
    },
  },
  {
    name: 'list_tasks',
    description: '列出所有任务模板',
    inputSchema: { type: 'object', properties: {} },
  },
];

// ─── 注册 & 执行 ─────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {

      // ── 按角色调用 ──
      case 'ask_gpt5':
      case 'ask_gpt4o':
      case 'ask_codex':
      case 'ask_gemini':
      case 'ask_minimax':
      case 'ask_qwen': {
        const modelMap = {
          ask_gpt5:    { handler: 'copilot', model: 'gpt-5.4' },
          ask_gpt4o:   { handler: 'copilot', model: 'gpt-4o' },
          ask_codex:   { handler: 'copilot', model: 'gpt-5.3-codex' },
          ask_gemini:  { handler: 'copilot', model: 'gemini-2.5-pro' },
          ask_minimax: { handler: 'minimax', model: null },
          ask_qwen:    { handler: 'qwen',    model: null },
        };

        const { handler, model } = modelMap[name];
        const messages = [];
        if (args.system) messages.push({ role: 'system', content: args.system });
        messages.push({ role: 'user', content: args.prompt });

        const result = await callAI(clients, handler, messages, {
          model,
          temperature: args.temperature,
          maxTokens: args.maxTokens,
        });

        await logTask(name, result, process.env.LOG_DIR);

        if (!result.success) {
          return { content: [{ type: 'text', text: `❌ ${name} 失败: ${result.error}` }], isError: true };
        }

        const modelLabel = model || result.model || handler;
        return {
          content: [{
            type: 'text',
            text: `✅ [${modelLabel}] (${result.elapsed}ms)\n\n${result.content}`,
          }],
        };
      }

      // ── 自由选模型 ──
      case 'ask_copilot': {
        const messages = [];
        if (args.system) messages.push({ role: 'system', content: args.system });
        messages.push({ role: 'user', content: args.prompt });

        const result = await callAI(clients, 'copilot', messages, {
          model: args.model,
          temperature: args.temperature,
          maxTokens: args.maxTokens,
        });

        await logTask(`copilot_${args.model}`, result, process.env.LOG_DIR);

        if (!result.success) {
          return { content: [{ type: 'text', text: `❌ ${args.model} 失败: ${result.error}` }], isError: true };
        }

        return {
          content: [{
            type: 'text',
            text: `✅ [${args.model}] (${result.elapsed}ms)\n\n${result.content}`,
          }],
        };
      }

      // ── 智能路由 ──
      case 'smart_route': {
        const messages = [];
        if (args.system) messages.push({ role: 'system', content: args.system });
        messages.push({ role: 'user', content: args.prompt });

        const result = await callAI(clients, args.taskType, messages, {
          temperature: args.temperature,
          maxTokens: args.maxTokens,
        });

        await logTask(`smart_${args.taskType}`, result, process.env.LOG_DIR);

        if (!result.success) {
          return { content: [{ type: 'text', text: `❌ ${args.taskType} 失败: ${result.error}` }], isError: true };
        }

        return {
          content: [{
            type: 'text',
            text: `✅ [${result.model || result.worker}] ${args.taskType} (${result.elapsed}ms)\n\n${result.content}`,
          }],
        };
      }

      // ── 多模型并行 ──
      case 'multi_ai': {
        const taskList = args.tasks.map(t => ({
          label: t.label,
          model: t.model,
          messages: [
            ...(t.system ? [{ role: 'system', content: t.system }] : []),
            { role: 'user', content: t.prompt },
          ],
        }));

        const results = await callMultiAI(clients, taskList);

        const output = results.map(r => {
          if (r.success) {
            return `### ${r.task} ✅ [${r.model || r.worker}] (${r.elapsed}ms)\n${r.content}`;
          }
          return `### ${r.task} ❌ ${r.error}`;
        }).join('\n\n---\n\n');

        return { content: [{ type: 'text', text: output }] };
      }

      // ── SEO流水线 ──
      case 'write_seo': {
        const { topic, targetWords = 1500, keywords = [] } = args;
        const kw = keywords.length ? `Target keywords: ${keywords.join(', ')}` : '';

        const enResult = await callAI(clients, 'copilot', [
          { role: 'system', content: 'You are an expert SEO content writer for health supplements. Write in-depth, evidence-based articles.' },
          { role: 'user', content: `Write a ${targetWords}-word SEO article about: ${topic}\n${kw}\nInclude: H2/H3 headings, meta description, FAQ section.` },
        ], { model: 'gpt-5.4', maxTokens: 8192 });

        if (!enResult.success) return { content: [{ type: 'text', text: `❌ GPT-5.4 失败: ${enResult.error}` }], isError: true };

        const cnResult = await callAI(clients, 'minimax', [
          { role: 'system', content: '你是健康保健品翻译专家。翻译符合中国消费者习惯，保留SEO结构。' },
          { role: 'user', content: `翻译为中文SEO文章：\n\n${enResult.content}` },
        ], { maxTokens: 8192 });

        const htmlResult = await callAI(clients, 'qwen', [
          { role: 'system', content: '前端工程师，生成荣旺健康风格的SEO文章HTML。配色：#FAFAFA背景，#0A8F7F强调色。' },
          { role: 'user', content: `生成完整HTML页面：\n\n${cnResult.success ? cnResult.content : enResult.content}` },
        ], { maxTokens: 8192 });

        const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
        const files = [await saveOutput(`${slug}-en.md`, enResult.content)];
        if (cnResult.success) files.push(await saveOutput(`${slug}-cn.md`, cnResult.content));
        if (htmlResult.success) files.push(await saveOutput(`${slug}.html`, htmlResult.content));

        return { content: [{ type: 'text', text: [
          `✅ SEO文章完成: "${topic}"`,
          `📄 英文 (GPT-5.4, ${enResult.elapsed}ms)`,
          cnResult.success ? `📄 中文 (MiniMax, ${cnResult.elapsed}ms)` : `⚠️ 中文翻译失败`,
          htmlResult.success ? `📄 HTML (Qwen3, ${htmlResult.elapsed}ms)` : `⚠️ HTML生成失败`,
        ].join('\n') }] };
      }

      // ── 产品描述 ──
      case 'write_product': {
        const { productName, category, ingredients = [] } = args;

        const enResult = await callAI(clients, 'copilot', [
          { role: 'system', content: 'Health supplement product copywriter. Compelling, science-backed descriptions.' },
          { role: 'user', content: `Product: ${productName}\nCategory: ${category}\nIngredients: ${ingredients.join(', ')}\n\nWrite: headline, 5 benefits, how it works, trust signals, FAQ.` },
        ], { model: 'gpt-5.4' });

        const cnResult = await callAI(clients, 'minimax', [
          { role: 'system', content: '保健品电商文案专家，跨境电商风格。' },
          { role: 'user', content: `本地化为中文电商文案：\n\n${enResult.success ? enResult.content : `${productName} - ${category}`}` },
        ]);

        const output = [
          `## ${productName}`, '',
          '### English (GPT-5.4)', enResult.success ? enResult.content : `❌ ${enResult.error}`, '',
          '### 中文 (MiniMax)', cnResult.success ? cnResult.content : `❌ ${cnResult.error}`,
        ].join('\n');

        await saveOutput(`product-${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`, output);
        return { content: [{ type: 'text', text: output }] };
      }

      // ── 竞品分析 (全自动) ──
      case 'competitor_scan': {
        const { competitors, focus = '定价、成分、营销策略' } = args;

        const intelResult = await callAI(clients, 'copilot', [
          { role: 'system', content: 'Competitive intelligence analyst for health supplement brands. Provide detailed analysis with specific data.' },
          { role: 'user', content: `Analyze: ${competitors.join(', ')}\nFocus: ${focus}\n\nProvide: product lineup, pricing, ingredients, marketing channels, recent news, strengths/weaknesses.` },
        ], { model: 'gemini-2.5-pro', maxTokens: 6144 });

        const reportResult = await callAI(clients, 'copilot', [
          { role: 'system', content: 'Business analyst. Create structured competitive analysis with comparison matrix.' },
          { role: 'user', content: `Create analysis report from this intel:\n\n${intelResult.success ? intelResult.content : `Competitors: ${competitors.join(', ')}`}` },
        ], { model: 'gpt-5.4', maxTokens: 6144 });

        const output = [
          `# 竞品分析: ${competitors.join(', ')}`,
          '', '## 情报 (Gemini 2.5 Pro)',
          intelResult.success ? intelResult.content : `❌ ${intelResult.error}`,
          '', '## 分析报告 (GPT-5.4)',
          reportResult.success ? reportResult.content : `❌ ${reportResult.error}`,
        ].join('\n');

        await saveOutput(`competitor-${Date.now()}.md`, output);
        return { content: [{ type: 'text', text: output }] };
      }

      // ── 模型列表 ──
      case 'list_models': {
        const lines = Object.entries(COPILOT_MODELS).map(([id, m]) =>
          `• ${id.padEnd(24)} ${m.name.padEnd(18)} [${m.tier}] — ${m.best}`
        );
        return { content: [{ type: 'text', text: `Copilot Pro 可用模型:\n\n${lines.join('\n')}\n\n+ MiniMax 2.7 (中文)\n+ Qwen3-Coder 30B (本地)` }] };
      }

      // ── 任务模板 ──
      case 'run_task': {
        const template = await loadTask(args.taskName);
        if (!template) return { content: [{ type: 'text', text: `❌ 未找到: ${args.taskName}` }], isError: true };

        let prompt = template.prompt;
        if (args.variables) {
          for (const [key, value] of Object.entries(args.variables)) {
            prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }
        }

        let handler = template.model || 'copilot';
        const opts = { temperature: template.temperature, maxTokens: template.maxTokens };

        // 映射旧模型名
        if (handler === 'gpt') { handler = 'copilot'; opts.model = 'gpt-5.4'; }
        if (handler === 'grok') { handler = 'copilot'; opts.model = 'gemini-2.5-pro'; }

        const messages = [];
        if (template.system) messages.push({ role: 'system', content: template.system });
        messages.push({ role: 'user', content: prompt });

        const result = await callAI(clients, handler, messages, opts);
        await logTask(`task_${args.taskName}`, result, process.env.LOG_DIR);

        if (result.success && template.outputFile) {
          await saveOutput(template.outputFile.replace('{{timestamp}}', Date.now()), result.content);
        }

        return {
          content: [{
            type: 'text',
            text: result.success
              ? `✅ [${result.model || result.worker}] ${args.taskName} (${result.elapsed}ms)\n\n${result.content}`
              : `❌ 失败: ${result.error}`,
          }],
        };
      }

      case 'list_tasks': {
        const tasks = await listTasks();
        return { content: [{ type: 'text', text: tasks.length
          ? tasks.map(t => `• ${t.name} — ${t.description} [${t.model}]`).join('\n')
          : '暂无模板' }] };
      }

      default:
        return { content: [{ type: 'text', text: `未知工具: ${name}` }], isError: true };
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `❌ 执行错误: ${error.message}` }], isError: true };
  }
});

// ─── 启动 ────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 一辉智能体 v4 — 全自动多模型调度');
  console.error('   Claude CEO + GPT-5.4 / Codex / Gemini / Grok');
  console.error('   + MiniMax 2.7 (中文) + Qwen3 30B (本地)');
  console.error(`   📦 工具数: ${TOOLS.length} | 零剪贴板全自动`);
}

main().catch(console.error);
