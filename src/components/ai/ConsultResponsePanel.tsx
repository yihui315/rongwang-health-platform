"use client";

import ConsultResult from "@/components/ai/ConsultResult";
import ConsultStream from "@/components/ai/ConsultStream";
import type { ConsultationResponse } from "@/schemas/consultation-response";

interface ConsultResponsePanelProps {
  response: ConsultationResponse | null;
  error?: string;
  isSubmitting: boolean;
}

const emptyBlocks = ["风险分层", "生活建议", "营养方向", "购买入口"];

export default function ConsultResponsePanel({
  response,
  error,
  isSubmitting,
}: ConsultResponsePanelProps) {
  if (response) {
    return <ConsultResult response={response} />;
  }

  return (
    <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
      <div className="card-elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          {isSubmitting ? "AI正在分析..." : error ? "本次评估未完成" : "结果面板"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {isSubmitting
            ? "正在进行风险分层、建议生成和规则匹配，请稍候。"
            : error
              ? "你可以检查资料后重新提交，或清空当前结果后开始一轮新的评估。"
              : "提交后，这里会展示风险等级、关键因素、生活方式建议，以及对应问题方案与购买入口。"}
        </p>
        {error ? (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-4">
            <p className="text-sm font-medium text-rose-800">错误提示</p>
            <p className="mt-2 text-sm leading-6 text-rose-700">{error}</p>
          </div>
        ) : null}
        {isSubmitting ? <ConsultStream activeIndex={1} /> : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {emptyBlocks.map((item) => (
            <div
              key={item}
              className={`rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-5 text-sm text-[var(--text-muted)] ${
                isSubmitting ? "animate-pulse" : ""
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
