"use client";

import Link from "next/link";
import WeChatCTA from "@/components/ui/WeChatCTA";
import { fireCTAClick } from "@/components/analytics/TrackCTAClicks";

interface HeroCTAProps {
  solutionSlug: string;
}

interface AdvisorCTAProps {
  solutionSlug: string;
}

/** Hero section: single primary CTA */
export function SolutionHeroCTA({ solutionSlug }: HeroCTAProps) {
  return (
    <div className="mt-8">
      <Link
        href={`/ai-consult?focus=${solutionSlug}`}
        className="btn-primary text-base"
        onClick={() => fireCTAClick("solution_cta_clicked", { solutionSlug })}
      >
        先做 AI 评估 →
      </Link>
    </div>
  );
}

/** Advisor section: dual CTA (AI评估 + WeChat) */
export function SolutionAdvisorCTA({ solutionSlug }: AdvisorCTAProps) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <Link
        href={`/ai-consult?focus=${solutionSlug}`}
        className="btn-primary"
        onClick={() => fireCTAClick("advisor_cta_clicked", { solutionSlug })}
      >
        先做 AI 评估
      </Link>
      <WeChatCTA
        title="扫码添加健康顾问"
        description="领取專屬方案，1对1指导"
        cardMode={false}
        onClick={() => fireCTAClick("advisor_cta_clicked", { solutionSlug })}
      />
    </div>
  );
}
