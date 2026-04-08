/**
 * AI 健康客服服务模块
 *
 * 提供专业的健康咨询对话能力：
 * - 通过本地知识库增强 AI 回复的专业性
 * - 整合荣旺产品信息提供个性化方案推荐
 * - 合规过滤敏感医疗声明
 */

import type { ChatMessage } from "@/types/chat";
import { searchKnowledge } from "@/data/health-knowledge";
import { hasRiskWords } from "@/lib/compliance";
import { askBrain } from "@/lib/ai-brain";

/** AI 健康客服系统提示词 */
const SYSTEM_PROMPT = `你是「荣旺健康」的专业AI健康顾问，名叫"小旺"。你的职责是：

1. **了解客户身体状况**：通过对话了解用户的健康问题、症状和生活方式
2. **提供专业健康建议**：基于用户情况给出科学、专业的健康方向建议
3. **介绍保健品成分与用途**：详细、准确地解答各种保健品成分的功效与适用人群
4. **推荐合适的健康方案**：根据用户需求推荐荣旺健康的相关产品方案

⚠️ 重要规则：
- 你是营养健康顾问，不是医生。始终提醒用户严重问题需就医
- 不使用"治愈""根治""保证有效""立刻见效"等绝对化用语
- 回答要专业但通俗易懂，使用温暖亲切的语气
- 每次回复尽量控制在 200 字以内，重点突出
- 使用适当的emoji增加亲和力
- 回复使用中文

你可以基于以下知识库内容来增强你的回答：
{{KNOWLEDGE_CONTEXT}}`;

/** 欢迎消息 */
export const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 您好！我是荣旺健康AI顾问小旺。\n\n我可以帮您：\n• 🔍 了解身体状况，提供健康方向建议\n• 💊 解答保健品成分功效\n• 📋 推荐适合您的健康方案\n\n请告诉我您的健康需求，或选择下方快捷问题开始咨询~",
  timestamp: Date.now(),
};

/**
 * 生成唯一消息ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 构建带知识库上下文的系统提示词
 */
function buildSystemPrompt(userMessage: string): string {
  const relevant = searchKnowledge(userMessage);
  if (relevant.length === 0) {
    return SYSTEM_PROMPT.replace(
      "{{KNOWLEDGE_CONTEXT}}",
      "（当前对话无特定匹配的知识条目，请基于你的专业知识回答）"
    );
  }

  const knowledgeText = relevant
    .slice(0, 3) // 最多取3条最相关的
    .map((k) => `【${k.title}】\n${k.content}`)
    .join("\n\n");

  return SYSTEM_PROMPT.replace("{{KNOWLEDGE_CONTEXT}}", knowledgeText);
}

/**
 * 构建发送给 AI 的对话历史
 * 只保留最近的消息以控制 token 消耗
 */
function buildConversationContext(
  messages: ChatMessage[],
  maxMessages = 10
): string {
  const recent = messages.slice(-maxMessages);
  return recent
    .map((m) => {
      const role = m.role === "user" ? "用户" : "小旺";
      return `${role}：${m.content}`;
    })
    .join("\n\n");
}

/**
 * 合规过滤 — 检查 AI 回复是否包含风险用语
 * 如有则添加免责声明
 */
function complianceFilter(response: string): string {
  if (hasRiskWords(response)) {
    return (
      response +
      "\n\n⚠️ 温馨提示：以上建议仅供健康方向参考，不构成医疗诊断或治疗建议。如有严重不适，请及时就医。"
    );
  }
  return response;
}

/**
 * 发送用户消息到 AI 获取回复（通过远程 AI 服务）
 *
 * @param userMessage - 用户发送的消息
 * @param history - 历史对话记录
 * @returns AI 回复文本
 */
export async function getAIResponse(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(userMessage);
  const conversationContext = buildConversationContext(history);

  const fullPrompt = conversationContext
    ? `以下是之前的对话：\n${conversationContext}\n\n用户最新问题：${userMessage}`
    : userMessage;

  try {
    const result = await askBrain(fullPrompt, {
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    if (result.success && result.content) {
      return complianceFilter(result.content);
    }

    // AI 服务不可用时使用本地知识库回复
    return getLocalResponse(userMessage);
  } catch {
    // 网络错误或服务异常时降级到本地回复
    return getLocalResponse(userMessage);
  }
}

/**
 * 本地知识库回复（降级方案）
 * 当远程 AI 服务不可用时，通过关键词匹配本地知识库生成回复
 */
export function getLocalResponse(userMessage: string): string {
  const matches = searchKnowledge(userMessage);

  if (matches.length === 0) {
    return "感谢您的咨询！🙏\n\n您的问题我已记录。为了给您更准确的建议，您可以：\n• 尝试描述具体的身体症状\n• 点击下方快捷问题获取即时解答\n• 进行我们的 [AI健康检测](/quiz) 获取个性化方案\n\n如有紧急健康问题，建议及时就医。";
  }

  const top = matches[0];
  let reply = `关于**${top.title}**：\n\n${top.content}`;

  if (matches.length > 1) {
    const related = matches
      .slice(1, 3)
      .map((m) => m.title)
      .join("、");
    reply += `\n\n📖 相关知识：${related}，需要了解更多可以继续问我~`;
  }

  reply +=
    "\n\n💡 以上为健康方向参考，具体情况建议结合专业医生意见。";

  return reply;
}
