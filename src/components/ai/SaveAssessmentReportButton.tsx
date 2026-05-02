"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SaveAssessmentReportButtonProps {
  consultationId: string;
}

export default function SaveAssessmentReportButton({
  consultationId,
}: SaveAssessmentReportButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function saveReport() {
    setStatus("saving");
    setMessage("");

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

  return (
    <div className="rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-900">保存本次 AI 评估报告</p>
          <p className="mt-1 text-sm leading-6 text-teal-700">
            保存后可在 Dashboard 回看风险等级、建议和当时的推荐快照。
          </p>
        </div>
        <button
          type="button"
          onClick={saveReport}
          disabled={status === "saving" || status === "saved"}
          className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "保存中..." : status === "saved" ? "已保存" : "保存报告"}
        </button>
      </div>
      {message && (
        <p className={`mt-3 text-sm ${status === "error" ? "text-rose-700" : "text-teal-700"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
