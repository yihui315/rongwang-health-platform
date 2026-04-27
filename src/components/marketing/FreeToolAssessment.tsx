"use client";

import Link from "next/link";
import { useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { readAttributionCookies } from "@/lib/attribution";
import {
  buildFreeToolCompletionEvent,
  calculateFreeToolResult,
  type FreeHealthTool,
  type FreeToolResult,
} from "@/lib/marketing/free-tools";

interface FreeToolAssessmentProps {
  tool: FreeHealthTool;
}

const answerOptions = [
  { value: 0, key: "lowLabel" as const },
  { value: 1, key: "mediumLabel" as const },
  { value: 2, key: "highLabel" as const },
];

export function FreeToolAssessment({ tool }: FreeToolAssessmentProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<FreeToolResult | null>(null);
  const answeredCount = tool.questions.filter((question) => answers[question.id] !== undefined).length;
  const isComplete = answeredCount === tool.questions.length;

  function updateAnswer(questionId: string, value: number) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setResult(null);
  }

  function calculateResult() {
    const nextResult = calculateFreeToolResult(tool, answers);
    setResult(nextResult);
    const attribution = readAttributionCookies(document.cookie);
    trackAnalyticsEvent(buildFreeToolCompletionEvent(tool, nextResult, {
      source: "tools-page",
      ...attribution,
    }));
  }

  return (
    <section className="card-elevated">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="badge-teal">互动自测</span>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">完成 4 个问题，生成你的初步分层</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            结果只用于健康教育和下一步评估导流，不做诊断，也不会直接推荐购买入口。
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
          已完成 {answeredCount}/{tool.questions.length}
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {tool.questions.map((question, index) => (
          <article key={question.id} className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Question {index + 1}</p>
            <h3 className="mt-2 text-base font-semibold text-slate-900">{question.label}</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {answerOptions.map((option) => {
                const selected = answers[question.id] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateAnswer(question.id, option.value)}
                    className={
                      selected
                        ? "rounded-2xl border border-teal-500 bg-teal-50 px-4 py-3 text-left text-sm font-semibold text-teal-800"
                        : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-teal-200 hover:bg-teal-50"
                    }
                  >
                    {question[option.key]}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={calculateResult}
          disabled={!isComplete}
          className={
            isComplete
              ? "btn-primary"
              : "rounded-full bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-500"
          }
        >
          计算自测结果
        </button>
        {!isComplete ? <p className="text-sm text-slate-500">请先完成所有问题。</p> : null}
      </div>

      {result ? (
        <div className="mt-6 rounded-[2rem] border border-teal-100 bg-teal-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal-800">自测分数：{result.score}</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{result.band.label}</h3>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600">
              {result.band.careFirst ? "优先咨询医生/药师" : "建议继续 AI 评估"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">{result.band.description}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{result.nextStep}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={result.primaryCta.href} className="btn-primary">
              {result.primaryCta.label}
            </Link>
            {tool.solutionHref ? (
              <Link href={tool.solutionHref} className="btn-secondary">
                查看完整健康方案
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
