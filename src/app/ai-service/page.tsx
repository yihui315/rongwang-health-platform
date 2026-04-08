"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage as ChatMessageType, ConsultationState } from "@/types/chat";
import {
  quickReplies,
  consultationQuestions,
  knowledgeCategories,
} from "@/data/health-knowledge";
import { buildProfileSummary, consultationPhases } from "@/data/consultation-flow";
import {
  WELCOME_MESSAGE,
  generateMessageId,
  getLocalResponse,
  createInitialConsultation,
  processConsultationStep,
  processGenderStep,
} from "@/lib/ai-chat";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import Link from "next/link";

/**
 * AI 健康客服专业咨询页面
 * 专业的健康咨询界面 — 结构化问询流程 + 知识库 + 智能推荐
 */
export default function AIServicePage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    WELCOME_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [consultation, setConsultation] = useState<ConsultationState>(
    createInitialConsultation()
  );
  const [showConsultationOptions, setShowConsultationOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileSummary = buildProfileSummary(consultation.profile);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 获取当前阶段在进度中的索引
  const currentPhaseIndex = consultationPhases.findIndex(
    (p) => p.id === consultation.phase
  );

  /** 处理结构化咨询流程的选项点击 */
  function handleConsultationOption(value: string) {
    handleSend(value);
  }

  /** 开始结构化咨询 */
  function startConsultation() {
    setShowQuickReplies(false);
    setShowConsultationOptions(true);
    const result = processConsultationStep("开始健康咨询", consultation);
    setConsultation(result.newState);

    const aiMsg: ChatMessageType = {
      id: generateMessageId(),
      role: "assistant",
      content: result.response,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, aiMsg]);
  }

  function restartConsultation() {
    setMessages([WELCOME_MESSAGE]);
    setIsLoading(false);
    setShowQuickReplies(true);
    setShowConsultationOptions(false);
    setConsultation(createInitialConsultation());
  }

  /** 发送消息（支持自由对话 + 结构化流程） */
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

    // 如果在结构化咨询流程中
    if (
      showConsultationOptions &&
      consultation.phase !== "recommendation" &&
      consultation.phase !== "welcome"
    ) {
      let result: { response: string; newState: ConsultationState };

      // 判断是否在收集性别信息
      if (
        consultation.phase === "basic-info" &&
        consultation.profile.ageRange &&
        !consultation.profile.gender
      ) {
        result = processGenderStep(text, consultation);
      } else {
        result = processConsultationStep(text, consultation);
      }

      setConsultation(result.newState);

      if (result.response) {
        const aiMsg: ChatMessageType = {
          id: generateMessageId(),
          role: "assistant",
          content: result.response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }

      setIsLoading(false);
      return;
    }

    // 自由对话模式 — 通过 API 调用 AI
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

  /** 获取当前阶段的选项按钮 */
  function renderConsultationOptions() {
    if (!showConsultationOptions || isLoading) return null;

    const { phase, profile } = consultation;

    // basic-info 阶段：先年龄后性别
    if (phase === "basic-info") {
      if (!profile.ageRange) {
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            {consultationQuestions["basic-info"].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleConsultationOption(opt.value)}
                className="consultation-option-btn"
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      }
      if (!profile.gender) {
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            {consultationQuestions.gender.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleConsultationOption(opt.value)}
                className="consultation-option-btn"
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      }
    }

    // symptoms 阶段
    if (phase === "symptoms") {
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {consultationQuestions.concerns.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleConsultationOption(opt.label)}
              className="consultation-option-btn"
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    // lifestyle 阶段
    if (phase === "lifestyle") {
      if (!profile.sleepQuality) {
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            {consultationQuestions.sleep.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleConsultationOption(opt.label)}
                className="consultation-option-btn"
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      }
      if (!profile.exerciseLevel) {
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            {consultationQuestions.exercise.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleConsultationOption(opt.label)}
                className="consultation-option-btn"
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      }
      if (!profile.stressLevel) {
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            {consultationQuestions.stress.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleConsultationOption(opt.label)}
                className="consultation-option-btn"
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      }
    }

    if (phase === "history") {
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {consultationQuestions.history.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleConsultationOption(opt.label)}
              className="consultation-option-btn"
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    return null;
  }

  return (
    <main className="consultation-page min-h-[calc(100vh-80px)]">
      {/* 页面标题区域 */}
      <div className="consultation-header">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-300" />
            AI健康顾问在线
          </div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            荣旺健康 · 专业AI健康咨询
          </h1>
          <p className="mt-2 text-sm text-white/80">
            专业问询流程 · 深度了解您的身体状况 · 个性化健康方案推荐
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* ── 左侧面板 ── */}
        <aside className="w-full shrink-0 space-y-4 lg:w-80">
          {/* 咨询进度 */}
          {showConsultationOptions && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                📊 咨询进度
              </h3>
              <div className="space-y-3">
                {consultationPhases.map((phase, idx) => {
                  const isCompleted = consultation.completedSteps.includes(
                    phase.id
                  );
                  const isCurrent = idx === currentPhaseIndex;

                  return (
                    <div key={phase.id} className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isCompleted
                            ? "bg-teal text-white"
                            : isCurrent
                              ? "bg-teal/20 text-teal ring-2 ring-teal/30"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isCompleted ? "✓" : phase.icon}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            isCompleted || isCurrent
                              ? "text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          {phase.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {profileSummary.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  🧾 本次问询摘要
                </h3>
                <button
                  onClick={restartConsultation}
                  className="text-xs font-medium text-teal hover:text-teal-dark"
                >
                  重新开始
                </button>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                {profileSummary.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl bg-slate-50 px-3 py-2 leading-relaxed"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(consultation.profile.redFlags?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-red-700">
                🚨 风险分流提醒
              </h3>
              <p className="text-xs leading-relaxed text-red-600">
                已检测到
                {consultation.profile.redFlags?.join("、")}
                相关描述，建议优先线下医疗评估，当前页面将暂停套餐推荐优先级。
              </p>
            </div>
          )}

          {/* 小旺介绍 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="consultation-avatar flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                旺
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  AI健康顾问 · 小旺
                </h2>
                <p className="text-xs text-slate-500">
                  专业营养学背景 · 全天候服务
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="mt-0.5">🩺</span>
                <div>
                  <p className="font-medium text-slate-700">专业问询流程</p>
                  <p className="text-xs text-slate-500">
                    先了解您的情况，再给出针对性建议
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5">💊</span>
                <div>
                  <p className="font-medium text-slate-700">保健品成分专家</p>
                  <p className="text-xs text-slate-500">
                    {knowledgeCategories[0].description}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5">🌿</span>
                <div>
                  <p className="font-medium text-slate-700">中医养生智慧</p>
                  <p className="text-xs text-slate-500">
                    药食同源 · 四季养生 · 体质调理
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5">📋</span>
                <div>
                  <p className="font-medium text-slate-700">个性化方案推荐</p>
                  <p className="text-xs text-slate-500">
                    根据您的画像推荐专属方案
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
              ⚠️ AI
              建议仅供参考，不构成医疗诊断。如有严重不适，请及时就医。
            </div>
          </div>

          {/* 知识库入口 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              📚 健康知识库
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              涵盖50+专业知识条目，7大分类
            </p>
            <div className="grid grid-cols-2 gap-2">
              {knowledgeCategories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/knowledge?category=${cat.id}`}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600 transition-colors hover:bg-teal-bg hover:text-teal-dark"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              ))}
            </div>
            <Link
              href="/knowledge"
              className="mt-3 block text-center text-xs font-medium text-teal hover:text-teal-dark"
            >
              查看全部知识库 →
            </Link>
          </div>

          {/* 热门咨询 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-700">
              🔥 热门咨询
            </h3>
            <div className="space-y-1.5">
              {[
                "NMN到底有什么功效？",
                "长期加班怎么补充营养？",
                "家里老人适合什么保健品？",
                "失眠和缺镁有关系吗？",
                "中医体质怎么辨别？",
                "孕期能吃哪些营养品？",
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

        {/* ── 聊天主区域 ── */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* 聊天头部 */}
          <div className="consultation-chat-header flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="text-sm font-medium text-white">
                在线咨询中
              </span>
              <span className="text-xs text-white/70">· 小旺为您服务</span>
            </div>
            <div className="flex items-center gap-2">
              {showConsultationOptions && (
                <button
                  onClick={restartConsultation}
                  className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  重新问询
                </button>
              )}
              {!showConsultationOptions && (
                <button
                  onClick={startConsultation}
                  className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/30"
                >
                  🩺 开始健康咨询
                </button>
              )}
            </div>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 px-5 py-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* 加载指示器 */}
            {isLoading && (
              <div className="mb-3 flex items-start">
                <div className="consultation-avatar mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-white">
                  旺
                </div>
                <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal/60" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-teal/60"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-teal/60"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 快捷回复（初始状态） */}
            {showQuickReplies && !isLoading && !showConsultationOptions && (
              <div className="mt-3">
                <button
                  onClick={startConsultation}
                  className="mb-3 w-full rounded-xl bg-gradient-to-r from-teal to-teal-dark px-4 py-3 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
                >
                  🩺 开始专业健康咨询（推荐）
                </button>
                <p className="mb-2 text-xs text-slate-400">
                  或选择快捷问题直接咨询：
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => handleSend(qr.message)}
                      className="consultation-option-btn"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                  若存在胸痛、呼吸困难、意识异常等急症，请优先立即就医。
                </div>
              </div>
            )}

            {/* 结构化咨询选项 */}
            {renderConsultationOptions()}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder="输入您的健康问题，我来为您专业解答..."
          />

          {/* 底部声明 */}
          <div className="border-t border-slate-100 bg-white px-5 py-2 text-center text-[11px] text-slate-400">
            AI建议仅供参考，不代替医生诊断 · 荣旺健康 © 2026 · 香港直邮 ·
            品质保障
          </div>
        </div>
      </div>
    </main>
  );
}
