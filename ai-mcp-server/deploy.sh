#!/bin/bash
# ============================================================
# 一辉智能体 HTTP 网关 — 一键部署脚本
# 适用：腾讯云轻量服务器（新加坡，宝塔 Linux，2核2G）
#
# 用法：bash deploy.sh
# 幂等设计：重复运行不报错（已存在则跳过/更新）
# ============================================================

set -e

# ─── 颜色 ───────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

# ─── 变量 ───────────────────────────────────────────────────
DEPLOY_DIR="/www/rongwang-health-platform"
REPO_URL="https://github.com/yihui315/rongwang-health-platform.git"
APP_DIR="$DEPLOY_DIR/ai-mcp-server"
HTTP_PORT=8787
PM2_APP_NAME="yihui-agent"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   一辉智能体 HTTP 网关 — 一键部署             ║${NC}"
echo -e "${CYAN}║   腾讯云新加坡轻量服务器 (宝塔 Linux)         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ─── 步骤 1：检查 & 安装 Node.js 20 ─────────────────────────
echo -e "${BLUE}── 步骤 1/7：检查 Node.js ──${NC}"

NODE_OK=false
if command -v node &>/dev/null; then
  NODE_VER=$(node -e "process.exit(parseInt(process.versions.node.split('.')[0]) < 18 ? 1 : 0)" 2>/dev/null && echo "ok" || echo "old")
  CURRENT_VER=$(node -v)
  if [ "$NODE_VER" = "ok" ]; then
    log "Node.js 已安装: $CURRENT_VER"
    NODE_OK=true
  else
    warn "Node.js 版本过低: $CURRENT_VER，需要 >= 18，将自动升级..."
  fi
else
  warn "Node.js 未安装，将自动安装..."
fi

if [ "$NODE_OK" = "false" ]; then
  info "正在安装 Node.js 20..."
  if command -v apt &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
  elif command -v yum &>/dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  else
    err "无法自动安装 Node.js，请手动安装后重试"
    exit 1
  fi
  log "Node.js $(node -v) 安装完成"
fi

# ─── 步骤 2：克隆 / 更新仓库 ────────────────────────────────
echo ""
echo -e "${BLUE}── 步骤 2/7：代码仓库 ──${NC}"

if [ -d "$DEPLOY_DIR/.git" ]; then
  info "仓库已存在，执行 git pull..."
  cd "$DEPLOY_DIR"
  git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || warn "git pull 失败，使用现有代码继续"
  log "代码已更新"
else
  info "克隆仓库到 $DEPLOY_DIR..."
  mkdir -p "$(dirname "$DEPLOY_DIR")"
  git clone "$REPO_URL" "$DEPLOY_DIR"
  log "仓库克隆完成"
fi

cd "$APP_DIR"

# ─── 步骤 3：安装依赖 ────────────────────────────────────────
echo ""
echo -e "${BLUE}── 步骤 3/7：安装依赖 ──${NC}"

info "运行 npm install（包含 express、cors）..."
npm install
log "依赖安装完成"

# ─── 步骤 4：交互式配置 .env ─────────────────────────────────
echo ""
echo -e "${BLUE}── 步骤 4/7：配置环境变量 ──${NC}"

ENV_FILE="$APP_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  warn ".env 文件已存在"
  read -r -p "  是否重新配置？(y/N): " RECONFIGURE
  RECONFIGURE="${RECONFIGURE:-N}"
else
  RECONFIGURE="y"
fi

if [[ "$RECONFIGURE" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${CYAN}请输入以下配置（直接回车使用默认值）：${NC}"
  echo ""

  read -r -p "  MINIMAX_API_KEY (MiniMax API 密钥): " INPUT_MINIMAX_KEY
  read -r -p "  MINIMAX_GROUP_ID (MiniMax Group ID): " INPUT_MINIMAX_GROUP
  read -r -p "  API_SECRET (HTTP 接口鉴权密钥，建议设置强密码): " INPUT_API_SECRET
  read -r -p "  HTTP_PORT [默认: $HTTP_PORT]: " INPUT_PORT
  INPUT_PORT="${INPUT_PORT:-$HTTP_PORT}"

  # 可选：copilot-api（当你本机开电脑并通过 frp 打通时才需要）
  read -r -p "  COPILOT_API_URL [可选，默认: http://localhost:4141]: " INPUT_COPILOT_URL
  INPUT_COPILOT_URL="${INPUT_COPILOT_URL:-http://localhost:4141}"

  # 可选：Ollama（服务器 2G 内存跑不了，留空即可）
  read -r -p "  OLLAMA_BASE_URL [可选，2G 服务器建议留空]: " INPUT_OLLAMA_URL
  INPUT_OLLAMA_URL="${INPUT_OLLAMA_URL:-}"

  cat > "$ENV_FILE" << ENVEOF
# ============================================
# 一辉智能体 HTTP 网关 — 环境配置
# 生成时间：$(date '+%Y-%m-%d %H:%M:%S')
# ============================================

# MiniMax（中国市场内容，服务器直连云端 API — 最高优先级）
MINIMAX_API_KEY=${INPUT_MINIMAX_KEY}
MINIMAX_GROUP_ID=${INPUT_MINIMAX_GROUP}
MINIMAX_MODEL=MiniMax-Text-01

# HTTP 网关配置
HTTP_PORT=${INPUT_PORT}
API_SECRET=${INPUT_API_SECRET}

# Copilot Pro（可选，需要本机 copilot-api 通过 frp 打通）
COPILOT_API_URL=${INPUT_COPILOT_URL}

# Ollama Qwen3（可选，2G 服务器内存不足，可通过 frp 指向本机）
OLLAMA_BASE_URL=${INPUT_OLLAMA_URL}
OLLAMA_MODEL=qwen3-coder:30b

OUTPUT_DIR=./output
LOG_DIR=./logs
ENVEOF

  log ".env 配置完成"
else
  info "保留现有 .env 配置"
fi

# ─── 步骤 5：内联生成 http-server.js ──────────────────────────
echo ""
echo -e "${BLUE}── 步骤 5/7：生成 http-server.js ──${NC}"

cat > "$APP_DIR/http-server.js" << 'SERVEREOF'
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
SERVEREOF

log "http-server.js 生成完成"

# ─── 步骤 6：配置防火墙 ────────────────────────────────────────
echo ""
echo -e "${BLUE}── 步骤 6/7：配置防火墙 ──${NC}"

# ufw（Ubuntu/Debian 系）
if command -v ufw &>/dev/null; then
  ufw allow "$HTTP_PORT"/tcp 2>/dev/null && log "ufw: 已放行 $HTTP_PORT 端口" || warn "ufw 放行失败，请手动检查"
fi

# firewall-cmd（CentOS/RHEL 系）
if command -v firewall-cmd &>/dev/null; then
  firewall-cmd --permanent --add-port="$HTTP_PORT/tcp" 2>/dev/null && \
  firewall-cmd --reload 2>/dev/null && \
  log "firewalld: 已放行 $HTTP_PORT 端口" || warn "firewalld 放行失败，请手动检查"
fi

# iptables（通用兜底）
if command -v iptables &>/dev/null; then
  # 检查规则是否已存在
  if ! iptables -C INPUT -p tcp --dport "$HTTP_PORT" -j ACCEPT 2>/dev/null; then
    iptables -I INPUT -p tcp --dport "$HTTP_PORT" -j ACCEPT 2>/dev/null && \
    log "iptables: 已放行 $HTTP_PORT 端口" || warn "iptables 放行失败，请手动检查"
  else
    info "iptables: $HTTP_PORT 端口已放行"
  fi
fi

warn "提醒：腾讯云控制台防火墙也需手动放行 $HTTP_PORT 端口"
warn "路径：腾讯云控制台 → 轻量应用服务器 → 防火墙 → 添加规则 → TCP:$HTTP_PORT"

# ─── 步骤 7：安装 pm2 并启动服务 ─────────────────────────────
echo ""
echo -e "${BLUE}── 步骤 7/7：pm2 守护进程 ──${NC}"

# 安装 pm2
if ! command -v pm2 &>/dev/null; then
  info "安装 pm2..."
  npm install -g pm2
  log "pm2 安装完成"
else
  log "pm2 已安装: $(pm2 -v)"
fi

# 停止旧进程（如果存在）
pm2 delete "$PM2_APP_NAME" 2>/dev/null || true

# 启动新进程
cd "$APP_DIR"
pm2 start http-server.js \
  --name "$PM2_APP_NAME" \
  --interpreter node \
  --log "$APP_DIR/logs/pm2.log" \
  --time

# 设置开机自启
pm2 save
pm2 startup 2>/dev/null | tail -1 | bash 2>/dev/null || true

log "pm2 启动完成，服务名: $PM2_APP_NAME"

# ─── 输出成功信息 ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎉 部署成功！                                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
# 动态获取服务器公网 IP
SERVER_IP=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || \
            curl -s --max-time 3 api.ipify.org 2>/dev/null || \
            echo 'YOUR_SERVER_IP')

echo ""
echo -e "  服务地址：${CYAN}http://${SERVER_IP}:${HTTP_PORT}${NC}"
echo ""
echo -e "${YELLOW}── Cowork 配置指引 ──${NC}"
echo ""
echo "  在你的项目 .env.local 里添加："
echo ""
echo -e "  ${CYAN}NEXT_PUBLIC_AI_MCP_URL=http://${SERVER_IP}:${HTTP_PORT}${NC}"
echo -e "  ${CYAN}AI_MCP_URL=http://${SERVER_IP}:${HTTP_PORT}${NC}"
echo -e "  ${CYAN}AI_MCP_SECRET=<你在步骤4设置的 API_SECRET>${NC}"
echo ""
echo -e "${YELLOW}── 验证命令 ──${NC}"
echo ""
echo "  # 健康检查"
echo -e "  ${CYAN}curl http://${SERVER_IP}:${HTTP_PORT}/health${NC}"
echo ""
echo "  # 测试 MiniMax 小红书生成"
echo -e "  ${CYAN}curl -X POST http://${SERVER_IP}:${HTTP_PORT}/ask \\${NC}"
echo -e "  ${CYAN}    -H 'Content-Type: application/json' \\${NC}"
echo -e "  ${CYAN}    -H 'Authorization: Bearer <你的API_SECRET>' \\${NC}"
echo -e "  ${CYAN}    -d '{\"prompt\":\"写一篇NMN小红书笔记\",\"taskType\":\"xiaohongshu\"}'${NC}"
echo ""
echo -e "${YELLOW}── 常用 pm2 命令 ──${NC}"
echo ""
echo "  pm2 status             # 查看服务状态"
echo "  pm2 logs $PM2_APP_NAME   # 查看实时日志"
echo "  pm2 restart $PM2_APP_NAME # 重启服务"
echo ""
