"use client";

import Link from "next/link";
import type { ConsultationResponse } from "@/schemas/consultation-response";
import { solutionTypeToSlug } from "@/lib/health/solutions";
import RecommendationPanel from "@/components/ai/RecommendationPanel";
import RiskCard from "@/components/ai/RiskCard";

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

      {response.ai ? (
        <div className="card-elevated">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--text-muted)]">分析引擎</p>
              <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                本次AI执行信息
              </h3>
            </div>
            <span className="badge-slate">{response.ai.provider}</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InfoBox label="Model" value={response.ai.model ?? "default"} />
            <InfoBox label="Prompt" value={response.ai.promptVersion} />
            <InfoBox
              label="Status"
              value={`${aiStatusLabels[response.ai.status]}${response.ai.fallbackUsed ? " / 已启用回退" : ""}`}
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <ListCard title="可能因素" emptyText="当前未识别出明确的主导因素。" items={result.possibleFactors} />
        <ListCard
          title="需要就医的信号"
          emptyText="当前未识别出紧急风险信号；若症状持续或加重，请尽快线下咨询。"
          items={result.redFlags}
        />
        <ListCard title="生活方式建议" items={result.lifestyleAdvice} />
        <div className="card-elevated">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">营养支持 / OTC方向</h3>
          <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
            <DirectionList title="营养支持方向" items={result.supplementDirections} emptyText="当前不建议优先考虑补充剂方向。" />
            <DirectionList title="OTC方向" items={result.otcDirections} emptyText="当前不建议优先考虑OTC方向。" />
          </div>
        </div>
      </div>

      <div className="card-elevated">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--text-muted)]">方案页</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
              下一步先看问题方案
            </h3>
          </div>
          {canShowSolutionLink ? (
            <Link href={`/solutions/${solutionSlug}`} className="btn-secondary">
              查看对应方案页
            </Link>
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
          {result.riskLevel === "urgent"
            ? "当前优先根据就医提示尽快线下评估，暂不引导到方案或购买页面。"
            : result.productRecommendationReason}
        </p>
      </div>

      <RecommendationPanel
        response={response}
        solutionSlug={solutionSlug}
        canShowSolutionLink={canShowSolutionLink}
      />

      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-5 py-5 text-sm leading-7 text-[var(--text-secondary)]">
        {result.disclaimer}
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-4">
      <p className="text-xs font-semibold text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function ListCard({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText?: string;
}) {
  return (
    <div className="card-elevated">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>{emptyText}</li>}
      </ul>
    </div>
  );
}

function DirectionList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div>
      <p className="font-medium text-[var(--text-primary)]">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>{emptyText}</li>}
      </ul>
    </div>
  );
}
