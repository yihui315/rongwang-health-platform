"use client";

import type { RiskLevel } from "@/schemas/ai-result";
import type { ConsultationResponse } from "@/schemas/consultation-response";

interface RiskCardProps {
  response: ConsultationResponse;
}

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  medium: "bg-amber-50 text-amber-700 ring-amber-200/70",
  high: "bg-orange-50 text-orange-700 ring-orange-200/70",
  urgent: "bg-red-50 text-red-700 ring-red-200/70",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "低风险",
  medium: "中等风险",
  high: "较高风险",
  urgent: "紧急风险",
};

export default function RiskCard({ response }: RiskCardProps) {
  const { result, safety } = response;

  return (
    <div className="card-elevated">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--text-muted)]">AI报告</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
            健康评估结果
          </h2>
        </div>
        <span className={`badge ring-1 ${riskStyles[result.riskLevel]}`}>
          风险等级：{riskLabels[result.riskLevel]}
        </span>
      </div>

      <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">{result.summary}</p>

      {safety.cautionFlags.length > 0 ? (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">谨慎提示</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
            {safety.cautionFlags.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
