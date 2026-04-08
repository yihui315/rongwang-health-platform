/**
 * AI 健康客服服务模块（增强版）
 *
 * 专业健康咨询能力：
 * - 结构化问询流程：先掌握客户基本情况，再给出专业建议
 * - 通过本地知识库增强 AI 回复的专业性
 * - 整合荣旺产品信息提供个性化方案推荐
 * - 合规过滤敏感医疗声明
 */

import type { ChatMessage, ConsultationState, UserProfile } from "@/types/chat";
import { searchKnowledge } from "@/data/health-knowledge";
import { hasRiskWords } from "@/lib/compliance";
import { askBrain } from "@/lib/ai-brain";
import {
  phaseMessages,
  generateAssessment,
  generateRecommendation,
} from "@/data/consultation-flow";

// ── 系统提示词 ────────────────────────────────────────

const SYSTEM_PROMPT = `你是「荣旺健康」的专业AI健康顾问，名叫"小旺"。你具有专业的医学营养学背景知识。你的职责是：

1. **专业问询**：通过结构化对话了解用户的年龄、性别、主要健康关注点、生活方式（睡眠/运动/饮食/压力水平）
2. **了解客户身体状况**：深入了解用户的健康问题、症状和生活方式
3. **提供专业健康建议**：基于用户完整画像给出科学、专业的健康方向建议
4. **介绍保健品成分与用途**：详细、准确地解答各种保健品成分的功效、作用机制、适用人群和服用建议
5. **推荐合适的健康方案**：根据用户需求精准推荐荣旺健康的相关产品方案

⚠️ 重要规则：
- 你是营养健康顾问，不是医生。始终提醒用户严重问题需就医
- 不使用"治愈""根治""保证有效""立刻见效"等绝对化用语
- 回答要专业但通俗易懂，使用温暖亲切的语气
- 每次回复尽量控制在 200 字以内，重点突出
- 使用适当的emoji增加亲和力
- 回复使用中文
- 在给出建议之前，先了解用户的基本情况（年龄、性别、主要症状、生活习惯）
- 专业术语需附带通俗解释

荣旺健康产品线：
- 「抗疲劳组合」¥299/月 — 活性B族+螯合镁+Omega-3
- 「深度睡眠组合」¥259/月 — GABA+甘氨酸镁+褪黑素
- 「免疫防护组合」¥349/月 — 维C+锌+维D3+接骨木莓
- 「压力缓解组合」¥399/月 — B族+镁+适应原草本
- 「细胞焕活组合」¥599/月 — NMN+白藜芦醇+CoQ10+胶原蛋白
- 「家庭健康套餐」¥699/月 — 复合维矿+Omega-3+益生菌+维D3

你可以基于以下知识库内容来增强你的回答：
{{KNOWLEDGE_CONTEXT}}`;

// ── 欢迎消息 ──────────────────────────────────────────

/** 欢迎消息 */
export const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 您好！我是荣旺健康AI顾问**小旺**。\n\n我拥有专业的营养健康知识，可以帮您：\n\n• 🩺 **专业健康问询** — 深入了解您的身体状况\n• 💊 **成分功效解读** — 各类保健品的专业分析\n• 📋 **个性化方案** — 量身定制健康方案\n• 🌿 **中医养生** — 药食同源的养生建议\n\n💡 为了给您最专业的建议，我会先了解您的基本情况，再提供针对性建议。\n\n请点击「开始健康咨询」进入专业问询流程，或直接输入您的健康问题~",
  timestamp: Date.now(),
};

// ── 工具函数 ──────────────────────────────────────────

/** 生成唯一消息ID */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 初始咨询状态 */
export function createInitialConsultation(): ConsultationState {
  return {
    phase: "welcome",
    profile: {},
    completedSteps: [],
  };
}

// ── 知识库集成 ────────────────────────────────────────

/** 构建带知识库上下文的系统提示词 */
function buildSystemPrompt(userMessage: string): string {
  const relevant = searchKnowledge(userMessage);
  if (relevant.length === 0) {
    return SYSTEM_PROMPT.replace(
      "{{KNOWLEDGE_CONTEXT}}",
      "（当前对话无特定匹配的知识条目，请基于你的专业知识回答）"
    );
  }

  const knowledgeText = relevant
    .slice(0, 4) // 取4条最相关的（增加上下文丰富度）
    .map((k) => `【${k.title}】\n${k.content}`)
    .join("\n\n");

  return SYSTEM_PROMPT.replace("{{KNOWLEDGE_CONTEXT}}", knowledgeText);
}

/** 构建对话历史 */
function buildConversationContext(
  messages: ChatMessage[],
  maxMessages = 12
): string {
  const recent = messages.slice(-maxMessages);
  return recent
    .map((m) => {
      const role = m.role === "user" ? "用户" : "小旺";
      return `${role}：${m.content}`;
    })
    .join("\n\n");
}

/** 合规过滤 */
function complianceFilter(response: string): string {
  if (hasRiskWords(response)) {
    return (
      response +
      "\n\n⚠️ 温馨提示：以上建议仅供健康方向参考，不构成医疗诊断或治疗建议。如有严重不适，请及时就医。"
    );
  }
  return response;
}

// ── 问询流程引擎 ──────────────────────────────────────

/**
 * 处理咨询流程中的用户响应
 * 返回下一条 AI 消息和更新后的咨询状态
 */
export function processConsultationStep(
  userMessage: string,
  state: ConsultationState
): { response: string; newState: ConsultationState } {
  const newState = { ...state, profile: { ...state.profile } };

  switch (state.phase) {
    case "welcome": {
      // 用户选择"开始健康咨询"
      newState.phase = "basic-info";
      newState.completedSteps = [...state.completedSteps, "welcome"];
      return {
        response: phaseMessages["basic-info"],
        newState,
      };
    }

    case "basic-info": {
      // 解析年龄范围
      const agePatterns: Record<string, string> = {
        "18-30": "18-30",
        "31-45": "31-45",
        "46-60": "46-60",
        "60+": "60+",
        "60": "60+",
      };
      const matchedAge =
        Object.entries(agePatterns).find(([key]) =>
          userMessage.includes(key)
        )?.[1] || userMessage.trim();

      newState.profile.ageRange = matchedAge;
      newState.completedSteps = [...state.completedSteps, "basic-info"];

      // 询问性别
      return {
        response:
          "收到！请问您的性别是？",
        newState: { ...newState, phase: "basic-info" }, // 保持在basic-info收集性别
      };
    }

    case "symptoms": {
      // 解析关注点
      const concernKeywords: Record<string, string> = {
        睡眠: "sleep",
        失眠: "sleep",
        疲劳: "fatigue",
        累: "fatigue",
        乏力: "fatigue",
        免疫: "immune",
        感冒: "immune",
        抵抗力: "immune",
        压力: "stress",
        焦虑: "stress",
        紧张: "stress",
        骨骼: "bone",
        关节: "bone",
        心脏: "cardio",
        血压: "cardio",
        心血管: "cardio",
        眼睛: "eye",
        视力: "eye",
        消化: "digestive",
        胃: "digestive",
        肠道: "digestive",
        衰老: "anti-aging",
        抗衰: "anti-aging",
        记忆: "brain",
        健忘: "brain",
      };

      const concerns: string[] = [];
      for (const [keyword, value] of Object.entries(concernKeywords)) {
        if (userMessage.includes(keyword) && !concerns.includes(value)) {
          concerns.push(value);
        }
      }

      if (concerns.length === 0) {
        concerns.push(userMessage.trim());
      }

      newState.profile.mainConcerns = concerns;
      newState.phase = "lifestyle";
      newState.completedSteps = [...state.completedSteps, "symptoms"];

      return {
        response: phaseMessages["lifestyle"],
        newState,
      };
    }

    case "lifestyle": {
      // 根据已收集的信息决定下一步
      if (!newState.profile.sleepQuality) {
        const sleepMap: Record<string, string> = {
          好: "good",
          一般: "fair",
          差: "poor",
          "很差": "very-poor",
          不好: "poor",
          严重: "very-poor",
        };
        const matched = Object.entries(sleepMap).find(([key]) =>
          userMessage.includes(key)
        );
        newState.profile.sleepQuality = matched ? matched[1] : "fair";

        return {
          response: "🏃 请问您的运动习惯如何？",
          newState,
        };
      }

      if (!newState.profile.exerciseLevel) {
        const exerciseMap: Record<string, string> = {
          不运动: "sedentary",
          很少: "sedentary",
          偶尔: "light",
          规律: "moderate",
          每天: "active",
          经常: "moderate",
        };
        const matched = Object.entries(exerciseMap).find(([key]) =>
          userMessage.includes(key)
        );
        newState.profile.exerciseLevel = matched ? matched[1] : "light";

        return {
          response: "😊 最后一个问题：您目前的压力水平如何？",
          newState,
        };
      }

      if (!newState.profile.stressLevel) {
        const stressMap: Record<string, string> = {
          小: "low",
          一般: "medium",
          "较大": "high",
          大: "high",
          "很大": "very-high",
        };
        const matched = Object.entries(stressMap).find(([key]) =>
          userMessage.includes(key)
        );
        newState.profile.stressLevel = matched ? matched[1] : "medium";

        // 所有信息收集完毕，进入评估阶段
        newState.phase = "assessment";
        newState.completedSteps = [...state.completedSteps, "lifestyle"];

        const assessment = generateAssessment(newState.profile);
        const recommendation = generateRecommendation(newState.profile);

        newState.phase = "recommendation";
        newState.completedSteps = [
          ...newState.completedSteps,
          "assessment",
          "recommendation",
        ];

        return {
          response: `${assessment}\n\n---\n\n${recommendation}`,
          newState,
        };
      }

      // 默认fallthrough
      newState.phase = "assessment";
      return {
        response: phaseMessages["assessment"],
        newState,
      };
    }

    default: {
      // 咨询完成后或自由对话阶段
      return {
        response: "",
        newState: state,
      };
    }
  }
}

/**
 * 处理 basic-info 阶段的性别响应
 * 需要在 ChatWidget 中判断 profile 是否已有 ageRange 但没有 gender
 */
export function processGenderStep(
  userMessage: string,
  state: ConsultationState
): { response: string; newState: ConsultationState } {
  const newState = { ...state, profile: { ...state.profile } };

  const genderMap: Record<string, string> = {
    男: "male",
    女: "female",
    先生: "male",
    女士: "female",
  };
  const matched = Object.entries(genderMap).find(([key]) =>
    userMessage.includes(key)
  );
  newState.profile.gender = matched ? matched[1] : userMessage.trim();
  newState.phase = "symptoms";

  return {
    response: phaseMessages["symptoms"],
    newState,
  };
}

// ── AI 调用 ──────────────────────────────────────────

/**
 * 发送用户消息到 AI 获取回复（通过远程 AI 服务）
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
      maxTokens: 600,
    });

    if (result.success && result.content) {
      return complianceFilter(result.content);
    }

    return getLocalResponse(userMessage);
  } catch {
    return getLocalResponse(userMessage);
  }
}

/**
 * 本地知识库回复（降级方案）
 */
export function getLocalResponse(userMessage: string): string {
  const matches = searchKnowledge(userMessage);

  if (matches.length === 0) {
    return "感谢您的咨询！🙏\n\n您的问题我已记录。为了给您更准确的建议，您可以：\n• 尝试描述具体的身体症状\n• 点击下方快捷问题获取即时解答\n• 进行我们的 [AI健康检测](/quiz) 获取个性化方案\n• 浏览我们的 [健康知识库](/knowledge) 了解更多\n\n如有紧急健康问题，建议及时就医。";
  }

  const top = matches[0];
  let reply = `关于**${top.title}**：\n\n${top.content}`;

  if (matches.length > 1) {
    const related = matches
      .slice(1, 4)
      .map((m) => m.title)
      .join("、");
    reply += `\n\n📖 相关知识：${related}，需要了解更多可以继续问我~`;
  }

  reply += "\n\n💡 以上为健康方向参考，具体情况建议结合专业医生意见。";

  return reply;
}
