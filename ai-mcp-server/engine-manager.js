/**
 * 一辉智能体 — 引擎自动管理器
 *
 * 检测离线引擎 → 自动启动 → 等待就绪 → 重试调用
 * 支持: Copilot Pro (copilot-api) / Ollama Qwen3 / PackyAPI
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 引擎进程引用 — 防止重复启动
const engineProcesses = {
  copilot: null,
  ollama: null,
};

// 引擎状态
const engineStatus = {
  copilot: { online: false, starting: false, lastCheck: 0, retries: 0 },
  ollama: { online: false, starting: false, lastCheck: 0, retries: 0 },
};

const MAX_RETRIES = 3;
const HEALTH_CHECK_INTERVAL = 30000; // 30秒

/**
 * 检测引擎是否在线
 */
async function isEngineOnline(engine, baseUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let checkUrl;
    switch (engine) {
      case 'copilot':
        checkUrl = `${baseUrl}/v1/models`;
        break;
      case 'ollama':
        checkUrl = `${baseUrl}/api/tags`;
        break;
      default:
        return false;
    }

    const response = await fetch(checkUrl, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 自动启动 Copilot API
 */
async function startCopilot() {
  const status = engineStatus.copilot;
  if (status.starting) {
    console.error('[EngineManager] Copilot 正在启动中，跳过...');
    return false;
  }
  if (status.retries >= MAX_RETRIES) {
    console.error('[EngineManager] Copilot 启动失败次数过多，跳过');
    return false;
  }

  status.starting = true;
  status.retries++;
  console.error('[EngineManager] 🚀 正在启动 copilot-api...');

  try {
    // 检查 copilot-api 是否已安装
    try {
      await execAsync('where copilot-api 2>nul || which copilot-api 2>/dev/null');
    } catch {
      console.error('[EngineManager] ❌ copilot-api 未安装，请运行: npm install -g copilot-api');
      status.starting = false;
      return false;
    }

    // 启动 copilot-api 作为后台进程
    const child = spawn('copilot-api', ['start'], {
      stdio: 'ignore',
      detached: true,
      shell: true,
    });

    child.unref();
    engineProcesses.copilot = child;

    child.on('error', (err) => {
      console.error('[EngineManager] Copilot 启动错误:', err.message);
      status.starting = false;
      status.online = false;
    });

    child.on('exit', (code) => {
      console.error(`[EngineManager] Copilot 进程退出 (code: ${code})`);
      status.online = false;
      status.starting = false;
      engineProcesses.copilot = null;
    });

    // 等待就绪 (最多60秒)
    const ready = await waitForEngine('copilot', 'http://localhost:4141', 60000);
    status.starting = false;

    if (ready) {
      status.online = true;
      status.retries = 0;
      console.error('[EngineManager] ✅ Copilot API 已就绪');
      return true;
    } else {
      console.error('[EngineManager] ⏳ Copilot 启动超时');
      return false;
    }
  } catch (e) {
    console.error('[EngineManager] Copilot 启动失败:', e.message);
    status.starting = false;
    return false;
  }
}

/**
 * 自动启动 Ollama
 */
async function startOllama(modelName = 'qwen3-coder:30b') {
  const status = engineStatus.ollama;
  if (status.starting) {
    console.error('[EngineManager] Ollama 正在启动中，跳过...');
    return false;
  }
  if (status.retries >= MAX_RETRIES) {
    console.error('[EngineManager] Ollama 启动失败次数过多，跳过');
    return false;
  }

  status.starting = true;
  status.retries++;
  console.error('[EngineManager] 🚀 正在启动 Ollama...');

  try {
    // 检查 ollama 是否已安装
    try {
      await execAsync('where ollama 2>nul || which ollama 2>/dev/null');
    } catch {
      console.error('[EngineManager] ❌ Ollama 未安装，请从 https://ollama.com 下载');
      status.starting = false;
      return false;
    }

    // 启动 ollama serve
    const child = spawn('ollama', ['serve'], {
      stdio: 'ignore',
      detached: true,
      shell: true,
    });

    child.unref();
    engineProcesses.ollama = child;

    child.on('error', (err) => {
      console.error('[EngineManager] Ollama 启动错误:', err.message);
      status.starting = false;
      status.online = false;
    });

    child.on('exit', (code) => {
      // code=1 可能是已经在运行
      if (code !== 0 && code !== null) {
        console.error(`[EngineManager] Ollama 进程退出 (code: ${code}), 可能已在运行`);
      }
      engineProcesses.ollama = null;
    });

    // 等待 Ollama 服务就绪 (最多30秒)
    const ready = await waitForEngine('ollama', 'http://localhost:11434', 30000);

    if (ready) {
      status.online = true;
      status.starting = false;
      console.error('[EngineManager] ✅ Ollama 已就绪');

      // 检查模型是否已下载
      try {
        const tagsResp = await fetch('http://localhost:11434/api/tags');
        const tagsData = await tagsResp.json();
        const models = tagsData.models?.map(m => m.name) || [];
        const hasModel = models.some(m => m.includes('qwen3'));

        if (!hasModel) {
          console.error(`[EngineManager] 📥 模型 ${modelName} 未下载，正在拉取...`);
          // 异步拉取模型，不阻塞
          const pullChild = spawn('ollama', ['pull', modelName], {
            stdio: 'ignore',
            detached: true,
            shell: true,
          });
          pullChild.unref();
          pullChild.on('exit', (code) => {
            if (code === 0) {
              console.error(`[EngineManager] ✅ 模型 ${modelName} 下载完成`);
            } else {
              console.error(`[EngineManager] ❌ 模型下载失败 (code: ${code})`);
            }
          });
          console.error('[EngineManager] ⏳ 模型正在后台下载，首次调用可能需要等待...');
        } else {
          console.error(`[EngineManager] ✅ 模型 ${modelName} 已就绪`);
        }
      } catch {
        // 忽略检查错误
      }

      status.retries = 0;
      return true;
    } else {
      console.error('[EngineManager] ⏳ Ollama 启动超时');
      status.starting = false;
      return false;
    }
  } catch (e) {
    console.error('[EngineManager] Ollama 启动失败:', e.message);
    status.starting = false;
    return false;
  }
}

/**
 * 等待引擎就绪
 */
async function waitForEngine(engine, baseUrl, timeoutMs = 30000) {
  const start = Date.now();
  const interval = 2000; // 每2秒检查一次

  while (Date.now() - start < timeoutMs) {
    if (await isEngineOnline(engine, baseUrl)) return true;
    await sleep(interval);
  }
  return false;
}

/**
 * 确保引擎在线 — 不在线就自动启动
 * 返回: true=在线可用, false=无法启动
 */
async function ensureEngine(engine, config = {}) {
  const baseUrlMap = {
    copilot: config.copilotUrl || 'http://localhost:4141',
    ollama: config.ollamaUrl || 'http://localhost:11434',
  };

  const baseUrl = baseUrlMap[engine];
  if (!baseUrl) return false;

  // 先检查是否在线
  if (await isEngineOnline(engine, baseUrl)) {
    engineStatus[engine].online = true;
    return true;
  }

  // 离线 → 自动启动
  console.error(`[EngineManager] ⚠️ ${engine} 离线，尝试自动启动...`);

  switch (engine) {
    case 'copilot':
      return await startCopilot();
    case 'ollama':
      return await startOllama(config.model || 'qwen3-coder:30b');
    default:
      return false;
  }
}

/**
 * 确保所有引擎在线
 */
async function ensureAllEngines(config = {}) {
  const results = {};

  // 并行启动所有引擎
  const [copilotOk, ollamaOk] = await Promise.all([
    ensureEngine('copilot', config),
    ensureEngine('ollama', config),
  ]);

  results.copilot = copilotOk;
  results.ollama = ollamaOk;

  const total = Object.values(results).filter(Boolean).length;
  console.error(`[EngineManager] 引擎状态: ${total}/2 在线`);

  return results;
}

/**
 * 获取所有引擎状态
 */
function getEngineStatus() {
  return { ...engineStatus };
}

/**
 * 重置重试计数 (手动修复后调用)
 */
function resetRetries(engine) {
  if (engineStatus[engine]) {
    engineStatus[engine].retries = 0;
    console.error(`[EngineManager] ${engine} 重试计数已重置`);
  }
}

/**
 * 停止所有引擎进程
 */
function stopAll() {
  for (const [name, proc] of Object.entries(engineProcesses)) {
    if (proc) {
      try {
        process.kill(-proc.pid); // kill进程组
        console.error(`[EngineManager] 已停止 ${name}`);
      } catch {
        // 进程可能已退出
      }
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 进程退出时清理
process.on('exit', stopAll);
process.on('SIGINT', () => { stopAll(); process.exit(0); });
process.on('SIGTERM', () => { stopAll(); process.exit(0); });

export {
  isEngineOnline,
  ensureEngine,
  ensureAllEngines,
  startCopilot,
  startOllama,
  getEngineStatus,
  resetRetries,
  stopAll,
};
