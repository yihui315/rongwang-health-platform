"use client";

import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * 单条聊天消息气泡组件
 * 用户消息靠右显示（橙色），AI消息靠左显示（白色）
 */
export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {/* AI 头像 */}
      {!isUser && (
        <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm text-white">
          旺
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-orange text-white rounded-br-md"
            : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md"
        }`}
      >
        {/* 渲染消息内容，支持简单的换行和加粗 */}
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-1.5" : ""}>
            {line.split(/(\*\*[^*]+\*\*)/).map((seg, j) =>
              seg.startsWith("**") && seg.endsWith("**") ? (
                <strong key={j} className="font-semibold">
                  {seg.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{seg}</span>
              )
            )}
          </p>
        ))}
      </div>

      {/* 用户头像 */}
      {isUser && (
        <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm text-slate-600">
          我
        </div>
      )}
    </div>
  );
}
