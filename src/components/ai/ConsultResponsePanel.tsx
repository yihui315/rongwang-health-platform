"use client";

import ConsultResult from "@/components/ai/ConsultResult";
import ConsultStream from "@/components/ai/ConsultStream";
import type { ConsultationResponse } from "@/schemas/consultation-response";

interface ConsultResponsePanelProps {
  response: ConsultationResponse | null;
  error?: string;
  isSubmitting: boolean;
}

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
        <h2 className="text-xl font-semibold text-slate-900">
          {isSubmitting ? "AI 正在分析..." : error ? "本次评估未成功完成" : "结果面板"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {isSubmitting
            ? "正在进行风险分层、建议生成和规则推荐，请稍候。"
            : error
              ? "你可以检查资料后重新提交，或先清空当前结果，再开始一轮新的评估。"
              : "提交后，这里会展示风险等级、关键因素、生活方式建议，以及对应问题方案与购买入口。"}
        </p>
        {error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
            <p className="text-sm font-medium text-rose-800">错误提示</p>
            <p className="mt-2 text-sm leading-6 text-rose-700">{error}</p>
          </div>
        )}
        {isSubmitting && <ConsultStream activeIndex={1} />}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["风险分层", "生活建议", "补充剂方向", "购买入口"].map((item) => (
            <div
              key={item}
              className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 ${
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
