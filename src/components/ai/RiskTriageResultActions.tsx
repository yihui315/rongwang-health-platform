"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SaveAssessmentReportButton from "@/components/ai/SaveAssessmentReportButton";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { persistProductSuitabilityAssessment } from "@/lib/product-suitability";
import { useTrackOnce } from "@/lib/use-track-once";
import type { RiskTriageLevel } from "@/lib/health/risk-triage";

interface RiskTriageResultActionsProps {
  consultationId: string;
  triageLevel: RiskTriageLevel;
  solutionSlug: string;
  summary: string;
  redFlags: string[];
  assessmentMetadata: {
    assessment_id?: string;
    assessment_version: string;
    rule_version: string;
  };
}

function viewEventName(level: RiskTriageLevel) {
  if (level === "low") {
    return "result_low_view" as const;
  }

  if (level === "medium") {
    return "result_medium_view" as const;
  }

  return "result_high_view" as const;
}

function supportMetadata(input: RiskTriageResultActionsProps) {
  return {
    risk_level: input.triageLevel,
    assessment_id: input.assessmentMetadata.assessment_id,
    assessment_version: input.assessmentMetadata.assessment_version,
    rule_version: input.assessmentMetadata.rule_version,
  };
}

function buildCareGuideText({
  consultationId,
  summary,
  redFlags,
  assessmentMetadata,
}: RiskTriageResultActionsProps) {
  const lines = [
    "荣旺健康分层协议 - 就医沟通清单",
    "",
    `评估编号：${consultationId}`,
    `评估版本：${assessmentMetadata.assessment_version}`,
    `规则版本：${assessmentMetadata.rule_version}`,
    "",
    "健康分层摘要：",
    summary,
    "",
    "建议线下沟通时主动说明：",
    ...(redFlags.length > 0
      ? redFlags.map((item) => `- ${item}`)
      : ["- 本次评估提示需要优先线下咨询，建议补充说明症状持续时间、正在用药和过敏史。"]),
    "",
    "边界说明：本清单仅用于健康教育和沟通辅助，不构成诊断、治疗或处方建议。",
  ];

  return lines.join("\n");
}

function requestReminder(props: RiskTriageResultActionsProps) {
  const reminderAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    window.localStorage.setItem(
      `rongwang_reassessment_reminder:${props.consultationId}`,
      JSON.stringify({
        consultation_id: props.consultationId,
        reminder_at: reminderAt,
        risk_level: props.triageLevel,
        ...props.assessmentMetadata,
      }),
    );
  } catch {
    // Local reminder persistence is best-effort.
  }

  trackAnalyticsEvent({
    name: "reassessment_reminder_requested",
    consultationId: props.consultationId,
    source: "assessment_result",
    solutionSlug: props.solutionSlug,
    metadata: {
      ...supportMetadata(props),
      reminder_interval_days: 7,
    },
  });

  return reminderAt;
}

export default function RiskTriageResultActions(props: RiskTriageResultActionsProps) {
  const [reminderMessage, setReminderMessage] = useState("");
  const metadata = supportMetadata(props);

  useTrackOnce(
    () => ({
      name: viewEventName(props.triageLevel),
      consultationId: props.consultationId,
      source: "assessment_result",
      solutionSlug: props.solutionSlug,
      metadata,
    }),
    `assessment_result:${props.consultationId}:${props.triageLevel}:view`,
  );

  useEffect(() => {
    persistProductSuitabilityAssessment({
      assessment_id: props.assessmentMetadata.assessment_id,
      consultation_id: props.consultationId,
      assessment_version: props.assessmentMetadata.assessment_version,
      rule_version: props.assessmentMetadata.rule_version,
      risk_level: props.triageLevel,
      recommended_solution_type: props.solutionSlug,
      completed_at: new Date().toISOString(),
    });
  }, [
    metadata.assessment_id,
    metadata.assessment_version,
    metadata.rule_version,
    metadata.risk_level,
    props.consultationId,
    props.solutionSlug,
    props.triageLevel,
  ]);

  if (props.triageLevel === "low") {
    return (
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={`/solutions/${props.solutionSlug}`}
          className="btn-primary"
          onClick={() =>
            trackAnalyticsEvent({
              name: "result_solution_click",
              consultationId: props.consultationId,
              source: "assessment_result",
              solutionSlug: props.solutionSlug,
              metadata,
            })
          }
        >
          查看我的支持方向
        </Link>
        <SaveAssessmentReportButton
          consultationId={props.consultationId}
          label="保存完整报告"
          variant="button"
          analyticsMetadata={metadata}
        />
      </div>
    );
  }

  if (props.triageLevel === "medium") {
    return (
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <SaveAssessmentReportButton
          consultationId={props.consultationId}
          label="保存报告并 7 天后复测"
          variant="button"
          analyticsMetadata={metadata}
          reminderIntervalDays={7}
        />
        <a
          href={`mailto:support@rongwang.health?subject=${encodeURIComponent("健康分层结果谨慎确认")}&body=${encodeURIComponent(`请协助确认本次健康分层下一步。评估编号：${props.consultationId}`)}`}
          className="btn-secondary"
        >
          咨询客服 / 药师确认
        </a>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a
        href={`mailto:?subject=${encodeURIComponent("荣旺健康分层风险提示摘要")}&body=${encodeURIComponent(buildCareGuideText(props))}`}
        className="btn-secondary"
        onClick={() =>
          trackAnalyticsEvent({
            name: "high_risk_summary_email_click",
            consultationId: props.consultationId,
            source: "assessment_result",
            metadata,
          })
        }
      >
        发送风险提示摘要到邮箱
      </a>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          const blob = new Blob([buildCareGuideText(props)], {
            type: "text/plain;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `rongwang-care-guide-${props.consultationId}.txt`;
          link.click();
          URL.revokeObjectURL(url);
          trackAnalyticsEvent({
            name: "high_risk_care_guide_download",
            consultationId: props.consultationId,
            source: "assessment_result",
            metadata,
          });
        }}
      >
        下载就医沟通清单
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          const reminderAt = requestReminder(props);
          setReminderMessage(
            `已记录 7 天后复测提醒：${new Date(reminderAt).toLocaleDateString("zh-HK")}`,
          );
        }}
      >
        7 天后提醒我复测
      </button>
      <a
        href={`https://wa.me/85212345678?text=${encodeURIComponent(`你好，我刚完成荣旺健康分层，结果建议优先线下咨询。评估编号：${props.consultationId}。请问下一步如何处理？`)}`}
        className="btn-secondary"
        target="_blank"
        rel="noreferrer"
      >
        联系人工客服了解下一步
      </a>
      {reminderMessage ? (
        <p className="w-full text-sm text-[var(--text-secondary)]">{reminderMessage}</p>
      ) : null}
    </div>
  );
}
