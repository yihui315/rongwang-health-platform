#!/usr/bin/env node
/**
 * 命令行任务运行器
 *
 * 用法:
 *   node run-task.js seo-article topic="Vitamin D Benefits" keywords="vitamin d,health" wordCount=1500
 *   node run-task.js xiaohongshu-post productName="B族复合维生素" benefit="抗疲劳提神" audience="996打工人"
 *   node run-task.js competitor-analysis brandName="AG1"
 */

import dotenv from 'dotenv';
import { createClients, callAI, saveOutput, logTask } from './orchestrator.js';
import { loadTask } from './task-loader.js';

dotenv.config();

async function main() {
  const [,, taskName, ...varArgs] = process.argv;

  if (!taskName) {
    console.log('用法: node run-task.js <task-name> [key=value ...]');
    console.log('');
    console.log('示例:');
    console.log('  node run-task.js seo-article topic="Vitamin D" keywords="vitamin d" wordCount=1500');
    console.log('  node run-task.js xiaohongshu-post productName="B族维生素" benefit="抗疲劳"');
    console.log('  node run-task.js competitor-analysis brandName="AG1"');
    console.log('  node run-task.js html-component componentName="产品卡片" requirements="响应式3列网格"');
    process.exit(1);
  }

  // 解析变量
  const variables = {};
  for (const arg of varArgs) {
    const eqIdx = arg.indexOf('=');
    if (eqIdx > 0) {
      variables[arg.slice(0, eqIdx)] = arg.slice(eqIdx + 1);
    }
  }

  // 加载模板
  const template = await loadTask(taskName);
  if (!template) {
    console.error(`❌ 未找到任务模板: ${taskName}`);
    console.error('   请确认 tasks/ 目录下存在 ' + taskName + '.json');
    process.exit(1);
  }

  console.log(`🚀 执行任务: ${template.name || taskName}`);
  console.log(`   模型: ${template.model || 'gpt'}`);
  console.log(`   变量: ${JSON.stringify(variables)}`);
  console.log('');

  // 替换模板变量
  let prompt = template.prompt;
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  // 检查未替换的变量
  const unreplaced = prompt.match(/{{(\w+)}}/g);
  if (unreplaced) {
    console.warn(`⚠️  未替换的变量: ${unreplaced.join(', ')}`);
    console.warn('   任务将继续执行，未替换变量保持原样');
    console.log('');
  }

  // 执行
  const clients = createClients(process.env);
  const messages = [];
  if (template.system) messages.push({ role: 'system', content: template.system });
  messages.push({ role: 'user', content: prompt });

  const startTime = Date.now();
  const result = await callAI(clients, template.model || 'gpt', messages, {
    temperature: template.temperature,
    maxTokens: template.maxTokens,
  });

  // 日志
  await logTask(taskName, result, process.env.LOG_DIR);

  if (!result.success) {
    console.error(`❌ 任务失败: ${result.error}`);
    process.exit(1);
  }

  // 输出
  console.log(`✅ 完成 (${result.elapsed}ms, ${result.worker})`);
  console.log('─'.repeat(50));
  console.log(result.content);
  console.log('─'.repeat(50));

  // 保存文件
  if (template.outputFile) {
    const filename = template.outputFile.replace('{{timestamp}}', Date.now());
    const filePath = await saveOutput(filename, result.content);
    console.log(`\n📄 已保存: ${filePath}`);
  }
}

main().catch(e => {
  console.error('执行错误:', e.message);
  process.exit(1);
});
