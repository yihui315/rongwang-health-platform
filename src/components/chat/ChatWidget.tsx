"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { quickReplies } from "@/data/health-knowledge";
import {
  WELCOME_MESSAGE,
  generateMessageId,
  getLocalResponse,
} from "@/lib/ai-chat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

/**
 * AI 健康客服浮动聊天组件
 *
 * 全局挂载在页面右下角，点击展开聊天窗口。
 * - 支持快捷回复引导
 * - 支持远程 AI 调用（降级到本地知识库）
 * - 自动滚动到最新消息
 * - 打字动画效果
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([
    WELCOME_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /** 发送消息 */
  async function handleSend(text: string) {
    // 添加用户消息
    const userMsg: ChatMessageType = {
      id: generateMessageId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      // 尝试通过 Next.js API 路由调用 AI
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      let aiContent: string;
      if (res.ok) {
        const data = (await res.json()) as { reply: string };
        aiContent = data.reply;
      } else {
        // API 不可用时降级到客户端本地知识库
        aiContent = getLocalResponse(text);
      }

      const aiMsg: ChatMessageType = {
        id: generateMessageId(),
        role: "assistant",
        content: aiContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // 网络错误降级到本地知识库
      const fallback = getLocalResponse(text);
      const aiMsg: ChatMessageType = {
        id: generateMessageId(),
        role: "assistant",
        content: fallback,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  /** 快捷回复点击 */
  function handleQuickReply(message: string) {
    handleSend(message);
  }

  return (
    <>
      {/* ── 浮动按钮 ─────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white shadow-lg transition-transform hover:scale-110 hover:bg-teal-dark active:scale-95"
          aria-label="打开AI健康客服"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-7 w-7"
          >
            <path
              fillRule="evenodd"
              d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.29 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.68-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
              clipRule="evenodd"
            />
          </svg>
          {/* 脉冲提示点 */}
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-orange" />
          </span>
        </button>
      )}

      {/* ── 聊天窗口 ─────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl sm:bottom-6 sm:right-6 chat-widget-enter">
          {/* 头部 */}
          <div className="flex items-center justify-between bg-teal px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                旺
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  AI健康顾问 · 小旺
                </h3>
                <p className="text-xs text-white/80">专业健康咨询为您服务</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* 跳转到完整页面 */}
              <a
                href="/ai-service"
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="打开完整客服页面"
                title="完整页面"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.217-1.395a.75.75 0 0 1 .286-.042L15 4.018a.75.75 0 0 1 .783.57l.478 2.14a.75.75 0 0 1-1.462.327l-.157-.7-3.96 3.96a.75.75 0 0 1-1.06-1.06l3.96-3.96-.7-.158a.75.75 0 0 1-.37-1.232Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              {/* 关闭按钮 */}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="关闭聊天"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* 打字中指示器 */}
            {isLoading && (
              <div className="mb-3 flex items-start">
                <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm text-white">
                  旺
                </div>
                <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            )}

             {/* 快捷回复 */}
             {showQuickReplies && !isLoading && (
              <div className="mt-2">
                <a
                  href="/ai-service"
                  className="mb-3 block rounded-xl bg-gradient-to-r from-teal to-teal-dark px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
                >
                  🩺 开始完整健康评估
                </a>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => handleQuickReply(qr.message)}
                      className="rounded-full border border-teal/30 bg-teal-bg px-3 py-1.5 text-xs text-teal-dark transition-colors hover:bg-teal hover:text-white"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] leading-relaxed text-red-600">
                  若出现胸痛、呼吸困难、意识异常等急症，请优先立即就医。
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <ChatInput onSend={handleSend} disabled={isLoading} />

          {/* 底部免责声明 */}
          <div className="border-t border-slate-100 bg-white px-4 py-1.5 text-center text-[10px] text-slate-400">
            AI建议仅供参考，不代替医生诊断
          </div>
        </div>
      )}
    </>
  );
}
