"use client";

import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { useTrackOnce } from "@/lib/use-track-once";

const unifiedAssessmentHref = "/assessment?scenario=unknown";

function trackHeroEvent(
  name:
    | "protocol_hero_primary_click"
    | "protocol_hero_report_sample_click"
    | "protocol_hero_unknown_click",
) {
  trackAnalyticsEvent({
    name,
    source: "homepage_hero",
  });
}

export default function HomeHeroCtas() {
  useTrackOnce(
    {
      name: "protocol_hero_view",
      source: "homepage_hero",
      metadata: { protocol: "rongwang_health_triage" },
    },
    "homepage:protocol_hero_view",
  );

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <Link
          href={unifiedAssessmentHref}
          className="btn-primary"
          onClick={() => trackHeroEvent("protocol_hero_primary_click")}
        >
          开始免费健康分层
        </Link>
        <Link
          href="#hero-report-preview"
          className="btn-secondary"
          onClick={() => trackHeroEvent("protocol_hero_report_sample_click")}
        >
          查看报告样例
        </Link>
      </div>
      <Link
        href={unifiedAssessmentHref}
        className="mt-4 inline-flex text-sm font-semibold text-[var(--clinical-primary)] hover:text-[var(--clinical-primary-hover)]"
        onClick={() => trackHeroEvent("protocol_hero_unknown_click")}
      >
        不确定？AI 先帮我判断
      </Link>
    </div>
  );
}
