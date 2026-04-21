/**
 * 任务模板加载器
 *
 * 从 tasks/ 目录加载 JSON 模板文件
 * 模板格式：
 * {
 *   "name": "task-name",
 *   "description": "任务描述",
 *   "model": "gpt|minimax|grok|qwen",  // 或使用 taskType 智能路由
 *   "system": "系统提示词",
 *   "prompt": "任务提示词，支持 {{variable}} 变量替换",
 *   "temperature": 0.7,
 *   "maxTokens": 4096,
 *   "outputFile": "output-{{timestamp}}.md"
 * }
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TASKS_DIR = join(__dirname, 'tasks');

/**
 * 加载指定任务模板
 */
async function loadTask(taskName) {
  try {
    const filePath = join(TASKS_DIR, `${taskName}.json`);
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * 列出所有可用任务模板
 */
async function listTasks() {
  try {
    const files = await readdir(TASKS_DIR);
    const tasks = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await readFile(join(TASKS_DIR, file), 'utf-8');
        const task = JSON.parse(raw);
        tasks.push({
          name: task.name || file.replace('.json', ''),
          description: task.description || '',
          model: task.model || task.taskType || 'gpt',
        });
      } catch { /* skip invalid files */ }
    }

    return tasks;
  } catch {
    return [];
  }
}

export { loadTask, listTasks };
