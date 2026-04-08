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

/** 健康知识条目 */
export interface HealthKnowledge {
  /** 条目唯一标识 */
  id: string;
  /** 分类 */
  category: "supplement" | "symptom" | "lifestyle" | "product";
  /** 关键词列表（用于匹配用户输入） */
  keywords: string[];
  /** 标题 */
  title: string;
  /** 详细内容 */
  content: string;
}

/** 聊天会话状态 */
export interface ChatSession {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
}
