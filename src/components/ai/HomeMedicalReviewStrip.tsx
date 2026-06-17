"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

const reviewFields = [
  {
    label: "内容依据",
    value: "参考公开循证资料、营养学指南与产品成分资料建立评估问题集。",
  },
  {
    label: "复核机制",
    value: "专业复核机制建设中；后续将公开顾问角色、复核范围与更新时间。",
  },
  {
    label: "审核范围",
    value: "健康内容、评估问题、风险提示、产品适配边界、不适用人群说明。",
  },
  {
    label: "数据边界",
    value: "用户数据仅用于生成本次健康分层结果；未经单独同意，不用于商业营销推送。",
  },
  {
    label: "非诊断声明",
    value: "本评估不提供诊断、治疗或处方建议。",
  },
];

export default function HomeMedicalReviewStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    let tracked = false;

    const trackView = () => {
      if (tracked) {
        return;
      }

      tracked = true;
      trackAnalyticsEvent({
        name: "medical_review_strip_view",
        source: "homepage_medical_review_strip",
        metadata: { fieldCount: reviewFields.length },
      });
    };

    if (!node || !("IntersectionObserver" in window)) {
      trackView();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackView();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]"
      aria-labelledby="medical-review-strip-title"
    >
      <div className="section-container py-8 md:py-10">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="badge-slate">Review Boundary</span>
            <h2
              id="medical-review-strip-title"
              className="mt-3 text-balance text-2xl font-semibold leading-tight text-[var(--text-primary)] md:text-3xl"
            >
              健康内容与评估规则如何建立信任？
            </h2>
          </div>
          <Link
            href="/health-review-standard"
            className="inline-flex w-fit text-sm font-semibold text-[var(--clinical-primary)] hover:text-[var(--clinical-primary-hover)]"
            onClick={() =>
              trackAnalyticsEvent({
                name: "health_review_standard_click",
                source: "homepage_medical_review_strip",
              })
            }
          >
            查看健康内容复核标准 →
          </Link>
        </div>

        <div className="grid gap-3 lg:grid-cols-5">
          {reviewFields.map((field) => (
            <article
              key={field.label}
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-4 shadow-[var(--shadow-xs)]"
            >
              <h3 className="text-sm font-semibold text-[var(--clinical-primary)]">
                {field.label}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {field.value}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
