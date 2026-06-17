"use client";

import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/analytics";

export default function HomeFinalCta() {
  return (
    <section className="section-container py-14 md:py-18">
      <div className="rounded-lg border border-[var(--clinical-border)] bg-[var(--clinical-primary-soft)] px-5 py-7 md:px-7">
        <span className="badge-teal">Start Assessment</span>
        <h2 className="mt-4 max-w-3xl text-balance text-2xl font-semibold leading-tight text-[var(--text-primary)] md:text-3xl">
          先完成健康风险分层，再判断是否适合营养支持
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
          评估结果仅用于健康教育与购买前自查；如出现高风险信号，系统会优先提示咨询医生或药师。
        </p>
        <Link
          href="/assessment?scenario=unknown"
          className="btn-primary mt-6 inline-flex"
          onClick={() =>
            trackAnalyticsEvent({
              name: "final_cta_click",
              source: "homepage_final_cta",
              metadata: { target: "/assessment?scenario=unknown" },
            })
          }
        >
          开始免费健康分层
        </Link>
      </div>
    </section>
  );
}
