import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RiskTriageResultView from "@/components/ai/RiskTriageResultView";
import { getConsultationLogDetail } from "@/lib/data/consultations";
import { solutionTypeToSlug } from "@/lib/health/solutions";
import {
  ASSESSMENT_RULE_VERSION,
  ASSESSMENT_VERSION,
} from "@/schemas/assessment-router";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "健康分层结果 | 荣旺健康",
  description: "荣旺健康分层协议个人结果页，仅用于健康教育与风险分流。",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

interface AssessmentResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentResultPage({
  params,
}: AssessmentResultPageProps) {
  const { id } = await params;
  const detail = await getConsultationLogDetail(id);

  if (!detail?.result) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-12">
      <RiskTriageResultView
        consultationId={detail.id}
        result={detail.result}
        riskLevel={detail.riskLevel}
        solutionSlug={solutionTypeToSlug(detail.result.recommendedSolutionType)}
        recommendationsCount={detail.recommendations.length}
        generatedAt={detail.resultTracking?.generated_at ?? detail.createdAt}
        assessment={detail.assessment ?? null}
        fallbackAssessmentVersion={
          detail.resultTracking?.assessment_version ?? ASSESSMENT_VERSION
        }
        fallbackRuleVersion={detail.resultTracking?.rule_version ?? ASSESSMENT_RULE_VERSION}
      />
    </main>
  );
}
