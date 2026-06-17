import type { Metadata } from "next";
import ConsultExperience from "@/components/ai/ConsultExperience";
import {
  normalizeAssessmentEntrySource,
  normalizeAssessmentScenario,
} from "@/schemas/assessment-router";

export const metadata: Metadata = {
  title: "荣旺健康分层评估",
  description:
    "进入荣旺健康分层协议，先完成健康教育用途的风险分层，再判断是否适合营养支持方向。",
};

interface AssessmentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AssessmentPage({ searchParams }: AssessmentPageProps) {
  const params = await searchParams;
  const entryScenario = normalizeAssessmentScenario(firstSearchParam(params.scenario));
  const entrySource = normalizeAssessmentEntrySource(firstSearchParam(params.source));

  return (
    <ConsultExperience
      assessmentRouter={{
        entryScenario,
        entrySource,
      }}
    />
  );
}
