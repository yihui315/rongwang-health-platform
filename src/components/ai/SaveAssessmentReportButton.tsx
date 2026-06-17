"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

interface SaveAssessmentReportButtonProps {
  consultationId: string;
  label?: string;
  variant?: "card" | "button";
  analyticsMetadata?: Record<string, unknown>;
  reminderIntervalDays?: number;
}

export default function SaveAssessmentReportButton({
  consultationId,
  label = "保存报告",
  variant = "card",
  analyticsMetadata,
  reminderIntervalDays,
}: SaveAssessmentReportButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function saveReport() {
    setStatus("saving");
    setMessage("");
    trackAnalyticsEvent({
      name: "result_report_save_click",
      consultationId,
      source: "assessment_result",
      metadata: analyticsMetadata,
    });
    if (typeof reminderIntervalDays === "number") {
      const reminderAt = new Date(
        Date.now() + reminderIntervalDays * 24 * 60 * 60 * 1000,
      ).toISOString();
      try {
        window.localStorage.setItem(
          `rongwang_reassessment_reminder:${consultationId}`,
          JSON.stringify({
            consultation_id: consultationId,
            reminder_at: reminderAt,
            reminder_interval_days: reminderIntervalDays,
            ...analyticsMetadata,
          }),
        );
      } catch {
        // Local reminder persistence is best-effort.
      }
      trackAnalyticsEvent({
        name: "reassessment_reminder_requested",
        consultationId,
        source: "assessment_result",
        metadata: {
          ...analyticsMetadata,
          reminder_interval_days: reminderIntervalDays,
        },
      });
    }

    try {
      const response = await fetch("/api/assessment-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId }),
      });
      const payload = await response.json();

      if (response.status === 401) {
        window.localStorage.setItem("rw_pending_consultation_id", consultationId);
        router.push(`/auth/login?next=${encodeURIComponent(`/dashboard?saveReport=${consultationId}`)}`);
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error ?? "保存失败，请稍后重试");
        return;
      }

      setStatus("saved");
      setMessage("报告已保存到你的健康档案");
    } catch {
      setStatus("error");
      setMessage("网络异常，请稍后重试");
    }
  }

  if (variant === "button") {
    return (
      <div>
        <button
          type="button"
          onClick={saveReport}
          disabled={status === "saving" || status === "saved"}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "保存中..." : status === "saved" ? "已保存" : label}
        </button>
        {message ? (
          <p className={`mt-2 text-sm ${status === "error" ? "text-rose-700" : "text-[var(--text-secondary)]"}`}>
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-900">保存本次健康分层报告</p>
          <p className="mt-1 text-sm leading-6 text-teal-700">
            保存后可在 Dashboard 回看风险等级、建议和当时的报告快照。
          </p>
        </div>
        <button
          type="button"
          onClick={saveReport}
          disabled={status === "saving" || status === "saved"}
          className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "保存中..." : status === "saved" ? "已保存" : label}
        </button>
      </div>
      {message ? (
        <p className={`mt-3 text-sm ${status === "error" ? "text-rose-700" : "text-teal-700"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
