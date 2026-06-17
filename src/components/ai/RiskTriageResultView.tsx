import Link from "next/link";
import RiskTriageResultActions from "@/components/ai/RiskTriageResultActions";
import {
  riskTriageCopy,
  toRiskTriageLevel,
  type RiskTriageLevel,
} from "@/lib/health/risk-triage";
import type { AssessmentRouterContext } from "@/schemas/assessment-router";
import type { HealthConsultationResult, RiskLevel } from "@/schemas/ai-result";

interface RiskTriageResultViewProps {
  consultationId: string;
  result: HealthConsultationResult;
  riskLevel: RiskLevel | string;
  solutionSlug: string;
  recommendationsCount: number;
  generatedAt?: string;
  assessment?: AssessmentRouterContext | null;
  fallbackAssessmentVersion: string;
  fallbackRuleVersion: string;
}

function listBlock(title: string, items: string[], emptyText: string) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-secondary)]">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>{emptyText}</li>}
      </ul>
    </section>
  );
}

function boundaryCopy(level: RiskTriageLevel) {
  if (level === "low") {
    return "低风险路径会先展示生活方式建议和营养支持方向；购买决策仍需结合产品证据、不适用人群和个人情况。";
  }

  if (level === "medium") {
    return "中风险路径优先保存报告、观察变化和必要时咨询医生或药师，本页不展示商品购买入口。";
  }

  return "高风险路径不展示商品购买入口、不展示产品推荐，也不进入产品推广自动化。";
}

export default function RiskTriageResultView({
  consultationId,
  result,
  riskLevel,
  solutionSlug,
  recommendationsCount,
  generatedAt,
  assessment,
  fallbackAssessmentVersion,
  fallbackRuleVersion,
}: RiskTriageResultViewProps) {
  const triageLevel = toRiskTriageLevel(riskLevel);
  const copy = riskTriageCopy[triageLevel];
  const assessmentMetadata = {
    assessment_id: assessment?.assessment_id,
    assessment_version: assessment?.assessment_version ?? fallbackAssessmentVersion,
    rule_version: assessment?.rule_version ?? fallbackRuleVersion,
  };
  const safeRecommendationCount = triageLevel === "low" ? recommendationsCount : 0;

  return (
    <article
      className="mx-auto max-w-6xl"
      data-assessment-id={assessmentMetadata.assessment_id}
      data-assessment-version={assessmentMetadata.assessment_version}
      data-rule-version={assessmentMetadata.rule_version}
      data-risk-triage={triageLevel}
    >
      <Link href="/assessment?scenario=unknown" className="btn-secondary">
        重新进行健康分层
      </Link>

      <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-xs)] md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${copy.toneClass}`}>
              {copy.eyebrow} Risk Triage
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)] md:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
              {copy.body}
            </p>
          </div>

          <div className="rounded-lg border border-[var(--clinical-border)] bg-[var(--surface-muted)] px-4 py-3 text-xs leading-6 text-[var(--text-secondary)]">
            <p>评估编号：{consultationId}</p>
            {generatedAt ? <p>生成时间：{new Date(generatedAt).toLocaleString("zh-HK")}</p> : null}
            <p>评估版本：{assessmentMetadata.assessment_version}</p>
            <p>规则版本：{assessmentMetadata.rule_version}</p>
          </div>
        </div>

        <RiskTriageResultActions
          consultationId={consultationId}
          triageLevel={triageLevel}
          solutionSlug={solutionSlug}
          summary={result.summary}
          redFlags={result.redFlags}
          assessmentMetadata={assessmentMetadata}
        />
      </section>

      <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">本次分层摘要</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{result.summary}</p>
        <p className="mt-4 rounded-lg border border-[var(--clinical-border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-7 text-[var(--text-secondary)]">
          {boundaryCopy(triageLevel)}
        </p>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {listBlock("可能影响因素", result.possibleFactors, "当前未识别到明确主导因素。")}
        {listBlock("生活方式建议", result.lifestyleAdvice, "建议先保持规律作息，并观察状态变化。")}
        {listBlock(
          "营养支持方向",
          triageLevel === "high" ? [] : result.supplementDirections,
          triageLevel === "high"
            ? "高风险路径不展示营养支持或产品方向，请优先线下咨询。"
            : "当前暂不展示具体营养支持方向。",
        )}
        {listBlock(
          "需要优先咨询的信号",
          result.redFlags,
          "当前未识别到明显高风险信号；如状态持续或加重，请咨询医生或药师。",
        )}
      </div>

      <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">商品展示边界</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4">
            <p className="text-sm text-[var(--text-muted)]">本页购买入口</p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {triageLevel === "low" ? "可查看支持方向" : "不展示"}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4">
            <p className="text-sm text-[var(--text-muted)]">产品推荐数量</p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {safeRecommendationCount}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4">
            <p className="text-sm text-[var(--text-muted)]">自动化边界</p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {triageLevel === "high" ? "停止产品推广" : "仅使用合规教育路径"}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 rounded-lg border border-[var(--border)] bg-white px-5 py-4 text-sm leading-7 text-[var(--text-secondary)]">
        {result.disclaimer ||
          "本评估不构成诊断、治疗或处方建议，也不替代医生或药师的专业意见。"}
      </p>
    </article>
  );
}
