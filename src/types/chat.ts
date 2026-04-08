/** AI 客服聊天消息角色 */
export type ChatRole = "user" | "assistant" | "system";

/** 单条聊天消息 */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

/** 快捷回复选项 */
export interface QuickReply {
  label: string;
  message: string;
}

/** 健康知识分类 */
export type KnowledgeCategory =
  | "supplement"
  | "symptom"
  | "lifestyle"
  | "product"
  | "tcm"
  | "demographic"
  | "organ-system";

/** 健康知识条目 */
export interface HealthKnowledge {
  /** 条目唯一标识 */
  id: string;
  /** 分类 */
  category: KnowledgeCategory;
  /** 关键词列表（用于匹配用户输入） */
  keywords: string[];
  /** 标题 */
  title: string;
  /** 详细内容 */
  content: string;
}

/** 知识分类元数据 */
export interface KnowledgeCategoryMeta {
  id: KnowledgeCategory;
  label: string;
  icon: string;
  description: string;
}

// ── 问询流程类型 ──────────────────────────────────────

/** 咨询阶段 */
export type ConsultationPhase =
  | "welcome"
  | "basic-info"
  | "symptoms"
  | "lifestyle"
  | "history"
  | "assessment"
  | "recommendation";

/** 用户基本信息 */
export interface UserProfile {
  ageRange?: string;
  gender?: string;
  mainConcerns?: string[];
  sleepQuality?: string;
  exerciseLevel?: string;
  dietHabits?: string;
  stressLevel?: string;
  medicalHistory?: string;
  medications?: string;
  redFlags?: string[];
}

/** 咨询状态 */
export interface ConsultationState {
  phase: ConsultationPhase;
  profile: UserProfile;
  completedSteps: ConsultationPhase[];
}

/** 聊天会话状态 */
export interface ChatSession {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  consultation: ConsultationState;
}
