"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { quickReplies } from "@/data/health-knowledge";
import {
  WELCOME_MESSAGE,
  generateMessageId,
  getLocalResponse,
} from "@/lib/ai-chat";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

/**
 * AI 健康客服完整页面
 * 提供更大的聊天界面和更丰富的功能展示
 */
export default function AIServicePage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    WELCOME_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend(text: string) {
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

  function handleQuickReply(message: string) {
    handleSend(message);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col px-4 py-8 md:flex-row md:gap-8">
      {/* 左侧：功能介绍 */}
      <aside className="mb-6 w-full shrink-0 md:mb-0 md:w-72">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-lg font-bold text-white">
              旺
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                AI健康顾问 · 小旺
              </h1>
              <p className="text-xs text-slate-500">
                专业健康咨询 · 全天候服务
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-teal">🔍</span>
              <div>
                <p className="font-medium text-slate-700">了解身体状况</p>
                <p className="text-xs text-slate-500">
                  通过对话分析您的健康问题
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-teal">💊</span>
              <div>
                <p className="font-medium text-slate-700">保健品专业咨询</p>
                <p className="text-xs text-slate-500">
                  成分功效、适用人群、搭配建议
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-teal">📋</span>
              <div>
                <p className="font-medium text-slate-700">个性化方案推荐</p>
                <p className="text-xs text-slate-500">
                  根据您的需求推荐健康方案
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-teal">🛡️</span>
              <div>
                <p className="font-medium text-slate-700">健康方向指引</p>
                <p className="text-xs text-slate-500">
                  科学建议，守护家人健康
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-teal-bg p-3 text-xs text-teal-dark">
            ⚠️ AI 建议仅供参考，不构成医疗诊断。如有严重不适，请及时就医。
          </div>
        </div>

        {/* 热门话题 */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            🔥 热门咨询
          </h3>
          <div className="space-y-2">
            {[
              "NMN到底有什么功效？",
              "长期加班怎么补充营养？",
              "家里老人适合什么保健品？",
              "失眠和缺镁有关系吗？",
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => handleSend(topic)}
                className="block w-full rounded-lg bg-slate-50 px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:bg-teal-bg hover:text-teal-dark"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 右侧：聊天区域 */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        {/* 聊天头部 */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-5 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="text-sm font-medium text-slate-700">
            在线咨询中
          </span>
          <span className="text-xs text-slate-400">· 小旺为您服务</span>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

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

          {showQuickReplies && !isLoading && (
            <div className="mt-3 flex flex-wrap gap-2">
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
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder="输入您的健康问题，我来为您解答..."
        />

        {/* 底部声明 */}
        <div className="border-t border-slate-100 bg-white px-5 py-2 text-center text-[11px] text-slate-400">
          AI建议仅供参考，不代替医生诊断 · 荣旺健康 © 2026
        </div>
      </div>
    </main>
  );
}
