export type LlmProvider = 'openai' | 'anthropic' | 'qwen' | 'mock';

export function resolveLlmProvider(): LlmProvider {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.QWEN_API_KEY) return 'qwen';
  return 'mock';
}
