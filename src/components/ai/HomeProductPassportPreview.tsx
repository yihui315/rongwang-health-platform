"use client";

import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { productPassportPreviewGroups } from "@/lib/product-passport-preview";
import { useTrackOnce } from "@/lib/use-track-once";

export default function HomeProductPassportPreview() {
  useTrackOnce(
    {
      name: "product_passport_preview_view",
      source: "homepage",
      metadata: {
        section: "product_passport_preview",
      },
    },
    "homepage:product_passport_preview_view",
  );

  return (
    <section
      id="product-passport-preview"
      className="border-y border-[var(--border-subtle)] bg-white"
    >
      <div className="section-container py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <span className="badge-teal">Product Passport Preview</span>
            <h2 className="mt-4 text-balance text-[var(--text-primary)]">
              每个产品都应先看证据，再决定是否适合
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)] md:text-lg">
              完成健康分层后，系统仅在适合的情况下展示相关营养支持方向；产品页会提供成分、适用边界与跨境配送信息。
            </p>

            <div className="mt-6 rounded-lg border border-[var(--clinical-border)] bg-[var(--surface-muted)] px-5 py-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                证据优先原则
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                若某项检测、认证、批次或履约资料尚未接入，页面显示“待补充”，不使用口号替代证明。
              </p>
            </div>

            <Link
              href="/assessment?scenario=unknown"
              className="btn-primary mt-6 inline-flex"
              onClick={() =>
                trackAnalyticsEvent({
                  name: "product_passport_assessment_cta_click",
                  source: "homepage",
                  metadata: {
                    section: "product_passport_preview",
                    target: "/assessment?scenario=unknown",
                  },
                })
              }
            >
              先完成健康分层，再查看适合我的产品证据
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {productPassportPreviewGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]"
              >
                <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {group.title}
                  </h3>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {group.fields.map((field) => (
                    <div
                      key={field.label}
                      className="grid grid-cols-[minmax(6.5rem,0.9fr)_minmax(0,1.1fr)] gap-3 px-4 py-3"
                    >
                      <p className="text-sm font-medium leading-6 text-[var(--text-secondary)]">
                        {field.label}
                      </p>
                      <p
                        className={`text-sm leading-6 ${
                          field.value === "待补充"
                            ? "font-medium text-[var(--text-muted)]"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
