"use client";

import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { ConsultationResponse } from "@/schemas/consultation-response";

interface RecommendationPanelProps {
  response: ConsultationResponse;
  solutionSlug: string;
  canShowSolutionLink: boolean;
}

export default function RecommendationPanel({
  response,
  solutionSlug,
  canShowSolutionLink,
}: RecommendationPanelProps) {
  return (
    <div className="card-elevated">
      <h3 className="text-xl font-semibold text-slate-900">推荐入口</h3>
      {response.recommendations.length === 0 ? (
        <p className="mt-4 text-sm leading-7 text-slate-600">
          当前风险等级较高，暂不展示购买入口。请优先根据上方提示线下咨询医生或药师。
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          {response.recommendations.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-teal-700">{item.brand}</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">
                    {item.name}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.reason}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{item.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">参考价</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    ¥{item.price}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {canShowSolutionLink && (
                  <Link href={`/solutions/${solutionSlug}`} className="btn-secondary">
                    先看方案页
                  </Link>
                )}
                <Link
                  href={`/product-map/${item.id}?consultation=${response.consultationId}&source=ai-consult&solution=${solutionSlug}`}
                  onClick={() =>
                    trackAnalyticsEvent({
                      name: "recommendation_clicked",
                      consultationId: response.consultationId,
                      productId: item.productSlug,
                      source: "ai-consult",
                      solutionSlug,
                    })
                  }
                  className="btn-primary"
                >
                  查看购买入口
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
