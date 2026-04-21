#!/usr/bin/env node
/**
 * 一辉智能体 MCP Server v5.1 — 自动驾驶版
 *
 * 取消token限制，引擎离线自动拉起，全力支撑荣旺商城构建
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  createClients, callAI, callAISmart, callMultiAI, callPacky,
  checkHealth, COPILOT_MODELS, TASK_ROUTING,
  logTask, saveOutput,
} from './orchestrator.js';
import { loadTask, listTasks } from './task-loader.js';
import { ensureAllEngines, getEngineStatus, resetRetries } from './engine-manager.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const clients = createClients(process.env);

const server = new Server(
  { name: 'yihui-agent', version: '5.1.0' },
  { capabilities: { tools: {} } }
);

// 启动时自动拉起所有引擎
ensureAllEngines({
  copilotUrl: clients.copilot.baseUrl,
  ollamaUrl: clients.qwen.baseUrl,
  model: clients.qwen.model,
}).catch(e => console.error('[启动] 引擎预热失败:', e.message));

// ─── 工具定义 ────────────────────────────────────────────

const copilotModelEnum = Object.keys(COPILOT_MODELS);

const TOOLS = [
  // ══════════ 1. 直接调用各引擎 ══════════
  {
    name: 'ask_minimax',
    description: '🇨🇳 MiniMax M2.7: 中国市场内容。小红书、微信、抖音、中文电商文案。已连接可用。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: '任务描述' },
        system: { type: 'string', description: '系统角色' },
        temperature: { type: 'number' },
        maxTokens: { type: 'number' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_copilot',
    description: `💪 Copilot Pro: 内容生产引擎。可选模型: ${copilotModelEnum.join(', ')}。需本地启动copilot-api。`,
    inputSchema: {
      type: 'object',
      properties: {
        model: { type: 'string', description: '模型名', enum: copilotModelEnum },
        prompt: { type: 'string', description: '任务描述' },
        system: { type: 'string' },
        temperature: { type: 'number' },
        maxTokens: { type: 'number' },
      },
      required: ['model', 'prompt'],
    },
  },
  {
    name: 'ask_qwen',
    description: '🏠 Qwen3-Coder 30B (本地): 离线代码生成。HTML/CSS/JS组件。免费无限。需本地Ollama。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: '代码任务' },
        system: { type: 'string' },
        temperature: { type: 'number' },
        maxTokens: { type: 'number' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_brain',
    description: '🧠 备用大脑 (PackyAPI Opus): 复杂分析、策略。分组需启用。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        system: { type: 'string' },
        temperature: { type: 'number' },
        maxTokens: { type: 'number' },
      },
      required: ['prompt'],
    },
  },

  // ══════════ 2. 智能路由 ══════════
  {
    name: 'smart_route',
    description: `智能路由: 按任务类型自动选最优模型+自动降级。支持: ${Object.keys(TASK_ROUTING).join(', ')}`,
    inputSchema: {
      type: 'object',
      properties: {
        taskType: { type: 'string', enum: Object.keys(TASK_ROUTING) },
        prompt: { type: 'string' },
        system: { type: 'string' },
        maxTokens: { type: 'number' },
      },
      required: ['taskType', 'prompt'],
    },
  },
  {
    name: 'multi_ai',
    description: '并行多模型: 多个子任务同时执行。A/B对比或多视角分析。',
    inputSchema: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              model: { type: 'string', description: '模型标识或任务类型' },
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

  // ══════════ 3. 电商内容流水线 ══════════
  {
    name: 'write_seo',
    description: '📝 SEO文章流水线: 写英文→翻中文→生成HTML。全自动3步完成。',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: '文章主题' },
        targetWords: { type: 'number', description: '目标字数(默认1500)' },
        keywords: { type: 'array', items: { type: 'string' } },
      },
      required: ['topic'],
    },
  },
  {
    name: 'write_product',
    description: '🛍️ 产品描述: 英文+中文双语。自动生成卖点、成分、FAQ。',
    inputSchema: {
      type: 'object',
      properties: {
        productName: { type: 'string' },
        category: { type: 'string' },
        ingredients: { type: 'array', items: { type: 'string' } },
        price: { type: 'number' },
      },
      required: ['productName', 'category'],
    },
  },
  {
    name: 'write_xiaohongshu',
    description: '📕 小红书种草文: MiniMax生成爆款笔记，含标题、正文、标签。',
    inputSchema: {
      type: 'object',
      properties: {
        product: { type: 'string', description: '产品名' },
        angle: { type: 'string', description: '种草角度(如:打工人续命/睡眠自由)' },
        style: { type: 'string', description: '风格(真诚分享/科普/测评)', enum: ['真诚分享', '科普', '测评', '体验日记'] },
      },
      required: ['product'],
    },
  },
  {
    name: 'write_wechat',
    description: '📱 微信公众号文章: 健康科普+产品植入。MiniMax生成。',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: '主题' },
        productMention: { type: 'string', description: '植入的产品名' },
        targetWords: { type: 'number', description: '目标字数(默认1200)' },
      },
      required: ['topic'],
    },
  },
  {
    name: 'competitor_scan',
    description: '🔍 竞品分析: 情报收集+分析报告。自动双步骤。',
    inputSchema: {
      type: 'object',
      properties: {
        competitors: { type: 'array', items: { type: 'string' } },
        focus: { type: 'string', description: '关注点(定价/成分/营销/渠道)' },
      },
      required: ['competitors'],
    },
  },

  // ══════════ 4. 页面生成器 ══════════
  {
    name: 'generate_page',
    description: '🏗️ 生成Next.js页面: 输入需求，输出完整的TSX页面代码。可直接写入项目。',
    inputSchema: {
      type: 'object',
      properties: {
        pageType: {
          type: 'string',
          description: '页面类型',
          enum: ['product', 'article', 'landing', 'dashboard', 'form', 'list', 'custom'],
        },
        pageName: { type: 'string', description: '页面名称(如: sleep, articles)' },
        requirements: { type: 'string', description: '页面需求描述' },
        writeToProject: { type: 'boolean', description: '是否直接写入项目文件(默认false)' },
        targetPath: { type: 'string', description: '写入路径(如: src/app/articles/page.tsx)' },
      },
      required: ['pageType', 'pageName', 'requirements'],
    },
  },
  {
    name: 'generate_component',
    description: '🧩 生成React组件: 输出可复用的TSX组件代码。',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: { type: 'string', description: '组件名(PascalCase)' },
        requirements: { type: 'string', description: '组件需求' },
        writeToProject: { type: 'boolean' },
        targetPath: { type: 'string' },
      },
      required: ['componentName', 'requirements'],
    },
  },
  {
    name: 'generate_api',
    description: '⚡ 生成API Route: Next.js App Router API端点。',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string', description: '端点路径(如: /api/products)' },
        methods: { type: 'array', items: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] } },
        requirements: { type: 'string' },
        writeToProject: { type: 'boolean' },
      },
      required: ['endpoint', 'requirements'],
    },
  },

  // ══════════ 5. 批量生产 ══════════
  {
    name: 'batch_content',
    description: '🏭 批量内容生产: 一次生成多篇文章/文案。指定数量和主题列表。',
    inputSchema: {
      type: 'object',
      properties: {
        contentType: { type: 'string', enum: ['seo-article', 'xiaohongshu', 'wechat', 'product-desc', 'email'] },
        topics: { type: 'array', items: { type: 'string' }, description: '主题列表' },
        commonSystem: { type: 'string', description: '通用系统提示(可选)' },
      },
      required: ['contentType', 'topics'],
    },
  },

  // ══════════ 6. 系统管理 ══════════
  {
    name: 'health_check',
    description: '🏥 系统健康检查: 测试所有AI引擎连接状态。',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_models',
    description: '📋 列出所有可用模型',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'run_task',
    description: '📦 运行预定义任务模板',
    inputSchema: {
      type: 'object',
      properties: {
        taskName: { type: 'string' },
        variables: { type: 'object' },
      },
      required: ['taskName'],
    },
  },
  {
    name: 'list_tasks',
    description: '📋 列出所有任务模板',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'system_status',
    description: '📊 一辉智能体系统状态总览',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'start_engines',
    description: '🚀 自动启动所有离线引擎 (Copilot + Ollama/Qwen3)。检测→启动→等待就绪。',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reset_engine',
    description: '🔄 重置引擎重试计数。手动修复后用此工具恢复自动启动能力。',
    inputSchema: {
      type: 'object',
      properties: {
        engine: { type: 'string', enum: ['copilot', 'ollama', 'all'], description: '要重置的引擎' },
      },
      required: ['engine'],
    },
  },
];

// ─── 辅助函数 ────────────────────────────────────────────

function buildMessages(system, prompt) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });
  return messages;
}

function formatResult(label, result) {
  if (!result.success) return `❌ ${label} 失败: ${result.error}`;
  const fb = result.fallbackFrom ? ` (降级自${result.fallbackFrom})` : '';
  return `✅ [${result.model || result.worker}] ${label}${fb} (${result.elapsed}ms)\n\n${result.content}`;
}

const PROJECT_ROOT = join(__dirname, '..');

async function writeToProject(targetPath, content) {
  const fullPath = join(PROJECT_ROOT, targetPath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, 'utf-8');
  return fullPath;
}

// ─── Handler ─────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {

      // ── 1. 直接调用 ──
      case 'ask_minimax': {
        const result = await callAISmart(clients, 'minimax', buildMessages(args.system, args.prompt), {
          temperature: args.temperature, maxTokens: args.maxTokens,
        });
        await logTask('minimax', result);
        return { content: [{ type: 'text', text: formatResult('MiniMax', result) }], isError: !result.success };
      }

      case 'ask_copilot': {
        const result = await callAISmart(clients, 'copilot', buildMessages(args.system, args.prompt), {
          model: args.model, temperature: args.temperature, maxTokens: args.maxTokens,
        });
        await logTask(`copilot_${args.model}`, result);
        return { content: [{ type: 'text', text: formatResult(args.model, result) }], isError: !result.success };
      }

      case 'ask_qwen': {
        const result = await callAISmart(clients, 'qwen', buildMessages(args.system, args.prompt), {
          temperature: args.temperature, maxTokens: args.maxTokens,
        });
        await logTask('qwen', result);
        return { content: [{ type: 'text', text: formatResult('Qwen3', result) }], isError: !result.success };
      }

      case 'ask_brain': {
        const result = await callAI(clients, 'packy', buildMessages(args.system, args.prompt), {
          temperature: args.temperature, maxTokens: args.maxTokens,
        });
        await logTask('brain', result);
        if (!result.success) {
          return { content: [{ type: 'text', text: `❌ 备用大脑失败: ${result.error}\n💡 PackyAPI分组可能被禁用` }], isError: true };
        }
        return { content: [{ type: 'text', text: `🧠 [PackyAPI Opus] (${result.elapsed}ms)\n\n${result.content}` }] };
      }

      // ── 2. 智能路由 ──
      case 'smart_route': {
        const result = await callAISmart(clients, args.taskType, buildMessages(args.system, args.prompt), {
          maxTokens: args.maxTokens,
        });
        await logTask(`smart_${args.taskType}`, result);
        return { content: [{ type: 'text', text: formatResult(args.taskType, result) }], isError: !result.success };
      }

      case 'multi_ai': {
        const taskList = args.tasks.map(t => ({
          label: t.label, model: t.model, messages: buildMessages(t.system, t.prompt),
        }));
        const results = await callMultiAI(clients, taskList);
        const output = results.map(r =>
          r.success ? `### ${r.task} ✅ [${r.model || r.worker}] (${r.elapsed}ms)\n${r.content}` : `### ${r.task} ❌ ${r.error}`
        ).join('\n\n---\n\n');
        return { content: [{ type: 'text', text: output }] };
      }

      // ── 3. 电商内容流水线 ──
      case 'write_seo': {
        const { topic, targetWords = 1500, keywords = [] } = args;
        const kw = keywords.length ? `Keywords: ${keywords.join(', ')}` : '';

        const enResult = await callAISmart(clients, 'copilot',
          buildMessages('You are an expert SEO content writer for health supplements. Write engaging, evidence-based articles with proper H2/H3 structure, meta description, and FAQ section.',
            `Write a ${targetWords}-word SEO article about: ${topic}. ${kw}. Include H2/H3 headings, meta description, and FAQ section.`),
          { model: 'gpt-5.4', maxTokens: 8192 });

        const cnResult = await callAISmart(clients, 'minimax',
          buildMessages('你是保健品跨境电商SEO专家。翻译英文SEO文章为自然流畅的中文，保持SEO结构。',
            `将以下英文SEO文章翻译为中文：\n\n${enResult.success ? enResult.content : topic}`),
          { maxTokens: 8192 });

        const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
        if (enResult.success) await saveOutput(`${slug}-en.md`, enResult.content);
        if (cnResult.success) await saveOutput(`${slug}-cn.md`, cnResult.content);

        return { content: [{ type: 'text', text: [
          `✅ SEO文章: "${topic}"`,
          enResult.success ? `📄 英文 (${enResult.model}, ${enResult.elapsed}ms)` : `❌ 英文失败: ${enResult.error}`,
          cnResult.success ? `📄 中文 (${cnResult.model}, ${cnResult.elapsed}ms)` : `❌ 中文失败: ${cnResult.error}`,
          '', '--- 中文版 ---', cnResult.success ? cnResult.content : '(生成失败)',
        ].join('\n') }] };
      }

      case 'write_product': {
        const { productName, category, ingredients = [], price } = args;
        const priceInfo = price ? `Price: ¥${price}` : '';

        const enResult = await callAISmart(clients, 'copilot',
          buildMessages('Health supplement copywriter. Write: headline, 5 key benefits, mechanism of action, trust signals, FAQ.',
            `Product: ${productName} | Category: ${category} | Ingredients: ${ingredients.join(', ')} | ${priceInfo}`),
          { model: 'gpt-5.4' });

        const cnResult = await callAISmart(clients, 'minimax',
          buildMessages('保健品电商文案专家。写出打动人心的中文产品描述：标题、卖点、成分说明、适用人群、FAQ。',
            `为以下产品写中文电商文案：\n产品：${productName}\n类别：${category}\n成分：${ingredients.join('、')}\n${price ? `价格：¥${price}` : ''}\n\n英文参考：\n${enResult.success ? enResult.content : ''}`),
          {});

        const output = [`# ${productName}`, '', '## English', enResult.success ? enResult.content : `❌ ${enResult.error}`,
          '', '## 中文', cnResult.success ? cnResult.content : `❌ ${cnResult.error}`].join('\n');
        await saveOutput(`product-${productName.toLowerCase().replace(/\s+/g, '-')}.md`, output);
        return { content: [{ type: 'text', text: output }] };
      }

      case 'write_xiaohongshu': {
        const { product, angle = '真实体验分享', style = '真诚分享' } = args;
        const result = await callAISmart(clients, 'minimax',
          buildMessages(`你是小红书爆款笔记写手。风格：${style}。要求：
1. 标题要有emoji和数字，吸引点击
2. 正文口语化，有个人体验感
3. 分段清晰，每段2-3句
4. 结尾加话题标签(5-8个)
5. 适当加emoji但不过度`,
            `写一篇关于"${product}"的小红书种草笔记。角度：${angle}。`),
          { maxTokens: 2048 });

        if (result.success) await saveOutput(`xhs-${Date.now()}.md`, result.content);
        return { content: [{ type: 'text', text: formatResult('小红书', result) }], isError: !result.success };
      }

      case 'write_wechat': {
        const { topic, productMention = '', targetWords = 1200 } = args;
        const result = await callAISmart(clients, 'minimax',
          buildMessages(`你是微信公众号健康科普作者。要求：
1. 标题吸引人，有数据或悬念
2. 开头用生活场景引入
3. 正文科普为主，引用研究数据
4. 自然植入产品（不硬广）
5. 结尾呼吁行动
6. 约${targetWords}字`,
            `写一篇关于"${topic}"的微信公众号文章。${productMention ? `自然植入产品：${productMention}` : ''}`),
          { maxTokens: 4096 });

        if (result.success) await saveOutput(`wechat-${Date.now()}.md`, result.content);
        return { content: [{ type: 'text', text: formatResult('微信公众号', result) }], isError: !result.success };
      }

      case 'competitor_scan': {
        const { competitors, focus = '定价、成分、营销策略、渠道' } = args;

        const intelResult = await callAISmart(clients, 'copilot',
          buildMessages('Competitive intelligence analyst for health supplements market.',
            `Analyze these competitors: ${competitors.join(', ')}. Focus: ${focus}. Cover: products, pricing, ingredients, marketing channels, strengths/weaknesses.`),
          { model: 'gemini-2.5-pro', maxTokens: 6144 });

        const reportResult = await callAISmart(clients, 'minimax',
          buildMessages('竞品分析报告专家。输出中文分析报告，包含SWOT和行动建议。',
            `根据以下竞品情报，写一份中文分析报告：\n\n${intelResult.success ? intelResult.content : `竞品：${competitors.join('、')}`}`),
          { maxTokens: 4096 });

        const output = [`# 竞品分析: ${competitors.join(', ')}`,
          '', '## 情报收集', intelResult.success ? intelResult.content : `❌ ${intelResult.error}`,
          '', '## 中文报告', reportResult.success ? reportResult.content : `❌ ${reportResult.error}`,
        ].join('\n');
        await saveOutput(`competitor-${Date.now()}.md`, output);
        return { content: [{ type: 'text', text: output }] };
      }

      // ── 4. 页面生成器 ──
      case 'generate_page': {
        const { pageType, pageName, requirements, writeToProject: write, targetPath } = args;
        const systemPrompt = `You are an expert Next.js 15 + TypeScript + Tailwind CSS developer building a health supplement e-commerce platform.
Generate a COMPLETE, production-ready page component.

Tech stack:
- Next.js 15 App Router (use 'use client' when needed)
- React 19, TypeScript strict mode
- Tailwind CSS (teal primary, orange CTA, slate text)
- Import from @/lib/cart-context for cart functionality
- Import from @/components/ui/ for shared components
- Import from @/data/plans for product data

Design style: Premium health brand (like AG1/Ritual). Clean, modern, lots of whitespace.
- Font: system font stack
- Colors: teal-500 primary, orange-500 CTA, slate-900 headings, slate-600 body
- Border radius: rounded-xl for cards, rounded-full for buttons
- Shadows: shadow-sm for cards

Output ONLY the complete TSX file content, no explanations.`;

        const result = await callAISmart(clients, 'minimax',
          buildMessages(systemPrompt,
            `Generate a ${pageType} page named "${pageName}".\n\nRequirements:\n${requirements}`),
          { maxTokens: 8192 });

        if (!result.success) {
          return { content: [{ type: 'text', text: `❌ 页面生成失败: ${result.error}` }], isError: true };
        }

        if (write && targetPath) {
          const fullPath = await writeToProject(targetPath, result.content);
          return { content: [{ type: 'text', text: `✅ 页面已写入: ${fullPath}\n\n${result.content}` }] };
        }

        return { content: [{ type: 'text', text: `✅ 页面代码 [${pageName}] (${result.elapsed}ms):\n\n${result.content}` }] };
      }

      case 'generate_component': {
        const { componentName, requirements, writeToProject: write, targetPath } = args;

        const result = await callAISmart(clients, 'minimax',
          buildMessages(`Expert React/TypeScript component developer. Output ONLY the complete TSX code.
Style: Tailwind CSS, teal/orange health brand theme. Fully typed props with defaults.`,
            `Create component "${componentName}":\n${requirements}`),
          { maxTokens: 4096 });

        if (!result.success) return { content: [{ type: 'text', text: `❌ 组件生成失败: ${result.error}` }], isError: true };

        if (write && targetPath) {
          const fullPath = await writeToProject(targetPath, result.content);
          return { content: [{ type: 'text', text: `✅ 组件已写入: ${fullPath}\n\n${result.content}` }] };
        }
        return { content: [{ type: 'text', text: `✅ [${componentName}] (${result.elapsed}ms):\n\n${result.content}` }] };
      }

      case 'generate_api': {
        const { endpoint, methods = ['GET'], requirements, writeToProject: write } = args;

        const result = await callAISmart(clients, 'minimax',
          buildMessages(`Expert Next.js API route developer. Output ONLY TypeScript code.
Framework: Next.js 15 App Router (use NextRequest/NextResponse from 'next/server').
Include proper error handling, input validation, and TypeScript types.`,
            `Create API route for ${endpoint}.\nMethods: ${methods.join(', ')}\nRequirements: ${requirements}`),
          { maxTokens: 4096 });

        if (!result.success) return { content: [{ type: 'text', text: `❌ API生成失败: ${result.error}` }], isError: true };

        if (write) {
          const routePath = `src/app${endpoint}/route.ts`;
          const fullPath = await writeToProject(routePath, result.content);
          return { content: [{ type: 'text', text: `✅ API写入: ${fullPath}\n\n${result.content}` }] };
        }
        return { content: [{ type: 'text', text: `✅ [${endpoint}] (${result.elapsed}ms):\n\n${result.content}` }] };
      }

      // ── 5. 批量生产 ──
      case 'batch_content': {
        const { contentType, topics, commonSystem } = args;

        const handlerMap = {
          'seo-article': { handler: 'copilot', model: 'gpt-5.4', system: commonSystem || 'SEO content writer for health supplements.' },
          'xiaohongshu': { handler: 'minimax', model: null, system: commonSystem || '小红书爆款笔记写手。标题有emoji和数字，口语化，结尾加话题标签。' },
          'wechat': { handler: 'minimax', model: null, system: commonSystem || '微信公众号健康科普作者。科普+产品植入。' },
          'product-desc': { handler: 'minimax', model: null, system: commonSystem || '保健品电商文案专家。标题+卖点+成分+适用人群。' },
          'email': { handler: 'copilot', model: 'gpt-4o', system: commonSystem || 'Email marketing specialist for health supplements.' },
        };

        const config = handlerMap[contentType];
        if (!config) return { content: [{ type: 'text', text: `❌ 未知内容类型: ${contentType}` }], isError: true };

        const tasks = topics.map((topic, i) => ({
          label: `${contentType}-${i + 1}`,
          model: config.handler,
          messages: buildMessages(config.system, topic),
          options: config.model ? { model: config.model } : {},
        }));

        const results = await callMultiAI(clients, tasks);

        const output = results.map((r, i) => {
          const header = `## ${i + 1}. ${topics[i]}`;
          if (r.success) {
            saveOutput(`batch-${contentType}-${i + 1}-${Date.now()}.md`, r.content).catch(() => {});
            return `${header}\n✅ [${r.model || r.worker}] (${r.elapsed}ms)\n\n${r.content}`;
          }
          return `${header}\n❌ ${r.error}`;
        }).join('\n\n---\n\n');

        return { content: [{ type: 'text', text: `🏭 批量生产完成: ${contentType} × ${topics.length}\n\n${output}` }] };
      }

      // ── 6. 系统管理 ──
      case 'health_check': {
        const status = await checkHealth(clients);
        const lines = [
          '🏥 一辉智能体 v5.0 — 健康检查',
          '━━━━━━━━━━━━━━━━━━━━━━━━',
          '',
          `🇨🇳 MiniMax M2.7:  ${status.minimax.ok ? `✅ (${status.minimax.model})` : `❌ ${status.minimax.error}`}`,
          `💪 Copilot Pro:   ${status.copilot.ok ? `✅ (${status.copilot.model})` : `❌ ${status.copilot.error}`}`,
          `🏠 Qwen3 (本地):   ${status.qwen.ok ? `✅ (${status.qwen.model})` : `❌ ${status.qwen.error}`}`,
          `🔄 PackyAPI:      ${status.packy.ok ? `✅ (${status.packy.model})` : `❌ ${status.packy.error}`}`,
          '',
          `可用引擎: ${Object.values(status).filter(s => s.ok).length}/4`,
        ];
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      }

      case 'list_models': {
        const lines = Object.entries(COPILOT_MODELS).map(([id, m]) =>
          `• ${id.padEnd(24)} ${m.name.padEnd(18)} [${m.tier}] — ${m.best}`);
        return { content: [{ type: 'text', text: `Copilot Pro 模型:\n\n${lines.join('\n')}\n\n+ MiniMax M2.7 (中文)\n+ Qwen3-Coder 30B (本地)` }] };
      }

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
        if (handler === 'gpt') { handler = 'copilot'; opts.model = 'gpt-5.4'; }

        const messages = buildMessages(template.system, prompt);
        const result = await callAISmart(clients, handler, messages, opts);
        await logTask(`task_${args.taskName}`, result);

        if (result.success && template.outputFile) {
          await saveOutput(template.outputFile.replace('{{timestamp}}', Date.now()), result.content);
        }
        return { content: [{ type: 'text', text: formatResult(args.taskName, result) }], isError: !result.success };
      }

      case 'list_tasks': {
        const tasks = await listTasks();
        return { content: [{ type: 'text', text: tasks.length
          ? tasks.map(t => `• ${t.name} — ${t.description} [${t.model}]`).join('\n')
          : '暂无模板' }] };
      }

      case 'start_engines': {
        console.error('[MCP] 手动触发引擎启动...');
        const result = await ensureAllEngines({
          copilotUrl: clients.copilot.baseUrl,
          ollamaUrl: clients.qwen.baseUrl,
          model: clients.qwen.model,
        });

        const engineState = getEngineStatus();
        const lines = [
          '🚀 引擎自动启动结果',
          '━━━━━━━━━━━━━━━━━━━━━━━━',
          '',
          `💪 Copilot API: ${result.copilot ? '✅ 已启动' : `❌ 启动失败 (重试${engineState.copilot.retries}/${3})`}`,
          `🏠 Ollama/Qwen3: ${result.ollama ? '✅ 已启动' : `❌ 启动失败 (重试${engineState.ollama.retries}/${3})`}`,
          '',
          result.copilot || result.ollama ? '引擎已就绪，可以开始工作！' : '⚠️ 请手动检查引擎安装情况',
        ];

        if (!result.copilot) lines.push('', '💡 Copilot: npm install -g copilot-api && copilot-api start');
        if (!result.ollama) lines.push('💡 Ollama: 从 https://ollama.com 下载安装');

        return { content: [{ type: 'text', text: lines.join('\n') }] };
      }

      case 'reset_engine': {
        if (args.engine === 'all') {
          resetRetries('copilot');
          resetRetries('ollama');
          return { content: [{ type: 'text', text: '✅ 所有引擎重试计数已重置' }] };
        }
        resetRetries(args.engine);
        return { content: [{ type: 'text', text: `✅ ${args.engine} 重试计数已重置` }] };
      }

      case 'system_status': {
        const status = await checkHealth(clients);
        const engines = Object.entries(status);
        const onlineCount = engines.filter(([, s]) => s.ok).length;
        const engineState = getEngineStatus();

        const lines = [
          `🤖 一辉智能体 v5.1 — 系统状态`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ``,
          `🧠 大脑: Claude Pro (本体)`,
          `   分析 / 决策 / 规划 / 审核 / 编排`,
          ``,
          `⚙️ 引擎状态 (${onlineCount}/4 在线):`,
          `   🇨🇳 MiniMax M2.7:  ${status.minimax.ok ? '🟢 在线' : '🔴 离线'}  — 中文内容`,
          `   💪 Copilot Pro:   ${status.copilot.ok ? '🟢 在线' : '🔴 离线'}  — 英文内容/代码`,
          `   🏠 Qwen3 本地:    ${status.qwen.ok ? '🟢 在线' : '🔴 离线'}  — 离线代码`,
          `   🔄 PackyAPI:      ${status.packy.ok ? '🟢 在线' : '🔴 离线'}  — 备用大脑`,
          ``,
          ``,
          `🔧 自动启动:`,
          `   Copilot: ${engineState.copilot.starting ? '⏳ 启动中' : engineState.copilot.online ? '🟢' : `🔴 (重试${engineState.copilot.retries}/3)`}`,
          `   Ollama:  ${engineState.ollama.starting ? '⏳ 启动中' : engineState.ollama.online ? '🟢' : `🔴 (重试${engineState.ollama.retries}/3)`}`,
          ``,
          `🛠️ 工具数量: ${TOOLS.length}`,
          `   直接调用: 4 | 路由: 2 | 内容流水线: 5`,
          `   页面生成: 3 | 批量: 1 | 系统: 6`,
          ``,
          `📁 任务路由: ${Object.keys(TASK_ROUTING).length} 条规则`,
          ``,
          `🏗️ 项目: 荣旺健康跨境电商`,
          `   技术栈: Next.js 15 + React 19 + TypeScript + Tailwind`,
        ];
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      }

      default:
        return { content: [{ type: 'text', text: `❌ 未知工具: ${name}` }], isError: true };
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `💥 执行错误: ${error.message}` }], isError: true };
  }
});

// ─── 启动 ────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('🤖 一辉智能体 MCP Server v5.1 — 自动驾驶模式');
console.error(`📦 工具: ${TOOLS.length} | 路由: ${Object.keys(TASK_ROUTING).length} | 引擎自动启动: ON`);
