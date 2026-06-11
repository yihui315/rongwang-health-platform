"use client";

import Link from "next/link";
import type { ConsultationResponse } from "@/schemas/consultation-response";
import { solutionTypeToSlug } from "@/lib/health/solutions";
import RecommendationPanel from "@/components/ai/RecommendationPanel";
import RiskCard from "@/components/ai/RiskCard";
import SaveAssessmentReportButton from "@/components/ai/SaveAssessmentReportButton";

interface ConsultResultProps {
  response: ConsultationResponse;
}

const aiStatusLabels = {
  success: "成功",
  fallback: "已回退",
  provider_error: "模型异常",
  parse_error: "解析异常",
  validation_error: "校验异常",
} as const;

export default function ConsultResult({ response }: ConsultResultProps) {
  const result = response.result;
  const solutionSlug = solutionTypeToSlug(result.recommendedSolutionType);
  const canShowSolutionLink = result.riskLevel !== "urgent";

  return (
    <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
      <RiskCard response={response} />

      <SaveAssessmentReportButton consultationId={response.consultationId} />

      {result.riskLevel === "urgent" && (
        <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="text-lg font-bold text-red-800">紧急风险提示</h3>
              <p className="mt-2 text-sm leading-7 text-red-700">
                当前评估结果显示症状存在紧急风险，请立即前往线下医疗机构进行面诊评估。
                切勿仅依赖线上评估结果延误就医时机。
              </p>
              <a
                href="/ai-consult"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-300 text-red-700 hover:bg-red-100 px-6 py-2.5 text-sm font-semibold transition"
              >
                🔄 重新评估
              </a>
            </div>
          </div>
        </div>
      )}

      {response.ai && (
        <div className="card-elevated">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">分析引擎</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                本次 AI 执行信息
              </h3>
            </div>
            <span className="badge-slate">{response.ai.provider}</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Model
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {response.ai.model ?? "default"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Prompt
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {response.ai.promptVersion}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Status
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {aiStatusLabels[response.ai.status]}
                {response.ai.fallbackUsed ? " · 已启用回退" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="card-elevated">
          <h3 className="text-lg font-semibold text-slate-900">可能因素</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {result.possibleFactors.length > 0 ? (
              result.possibleFactors.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>当前未识别出明确的主导因素。</li>
            )}
          </ul>
        </div>
        <div className={`card-elevated ${result.riskLevel === "high" || result.riskLevel === "urgent" ? "border-red-300 bg-red-50/50" : ""}`}>
          <h3 className={`text-lg font-semibold ${result.riskLevel === "high" || result.riskLevel === "urgent" ? "text-red-700" : "text-slate-900"}`}>
            {result.riskLevel === "high" || result.riskLevel === "urgent" ? "⚠️ 需要就医的信号" : "需要就医的信号"}
          </h3>
          <ul className={`mt-4 space-y-3 text-sm leading-7 ${result.riskLevel === "high" || result.riskLevel === "urgent" ? "text-red-800 font-medium" : "text-slate-600"}`}>
            {result.redFlags.length > 0 ? (
              result.redFlags.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>当前未识别出紧急风险信号；若症状持续或加重，请尽快线下咨询。</li>
            )}
          </ul>
        </div>
        <div className="card-elevated">
          <h3 className="text-lg font-semibold text-slate-900">生活方式建议</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {result.lifestyleAdvice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card-elevated">
          <h3 className="text-lg font-semibold text-slate-900">补充剂 / OTC 方向</h3>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            <div>
              <p className="font-medium text-slate-900">补充剂方向</p>
              <ul className="mt-2 space-y-2">
                {result.supplementDirections.length > 0 ? (
                  result.supplementDirections.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>当前不建议优先考虑补充剂方向。</li>
                )}
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-900">OTC 方向</p>
              <ul className="mt-2 space-y-2">
                {result.otcDirections.length > 0 ? (
                  result.otcDirections.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>当前不建议优先考虑 OTC 方向。</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {result.riskLevel !== "urgent" && (
        <div className="card-elevated">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">方案页</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                下一步先看问题方案
              </h3>
            </div>
            <Link href={`/solutions/${solutionSlug}`} className="btn-primary">
              查看对应方案页
            </Link>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {result.productRecommendationReason}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {result.riskLevel === "low" || result.riskLevel === "medium" ? (
              <>
                <a
                  href="/shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 text-sm font-semibold transition"
                >
                  🛒 进店购买正品
                </a>
                <a
                  href="/ai-consult"
                  className="inline-flex items-center gap-2 rounded-full border border-teal-300 text-teal-700 hover:bg-teal-50 px-6 py-2.5 text-sm font-semibold transition"
                >
                  🔄 重新评估
                </a>
              </>
            ) : (
              <a
                href="/ai-consult"
                className="inline-flex items-center gap-2 rounded-full border border-teal-300 text-teal-700 hover:bg-teal-50 px-6 py-2.5 text-sm font-semibold transition"
              >
                🔄 重新评估
              </a>
            )}
          </div>
        </div>
      )}

      {result.riskLevel !== "urgent" && (
        <RecommendationPanel
          response={response}
          solutionSlug={solutionSlug ?? ''}
          canShowSolutionLink={canShowSolutionLink}
        />
      )}

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm leading-7 text-slate-500">
        {result.disclaimer}
      </div>
    </div>
  );
}
