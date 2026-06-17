"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type ChiefComplaintScenario =
  | "unknown"
  | "sleep"
  | "fatigue"
  | "alcohol"
  | "immunity"
  | "female"
  | "male";

type ChiefComplaintClickEvent =
  | "chief_complaint_unknown_click"
  | "chief_complaint_sleep_click"
  | "chief_complaint_fatigue_click"
  | "chief_complaint_alcohol_click"
  | "chief_complaint_immunity_click"
  | "chief_complaint_female_click"
  | "chief_complaint_male_click";

const stateOptions: Array<{
  title: string;
  helper: string;
  href: string;
  scenario: ChiefComplaintScenario;
  eventName: ChiefComplaintClickEvent;
  priority?: boolean;
}> = [
  {
    title: "不确定，AI 帮我判断",
    helper: "最适合混合症状或首次使用",
    href: "/assessment?scenario=unknown",
    scenario: "unknown",
    eventName: "chief_complaint_unknown_click",
    priority: true,
  },
  {
    title: "睡眠不好",
    helper: "入睡难 / 睡浅",
    href: "/assessment?scenario=sleep",
    scenario: "sleep",
    eventName: "chief_complaint_sleep_click",
  },
  {
    title: "总是疲劳",
    helper: "恢复慢 / 没精神",
    href: "/assessment?scenario=fatigue",
    scenario: "fatigue",
    eventName: "chief_complaint_fatigue_click",
  },
  {
    title: "应酬恢复慢",
    helper: "饮酒 / 熬夜后负担",
    href: "/assessment?scenario=alcohol",
    scenario: "alcohol",
    eventName: "chief_complaint_alcohol_click",
  },
  {
    title: "免疫状态低",
    helper: "换季 / 状态波动",
    href: "/assessment?scenario=immunity",
    scenario: "immunity",
    eventName: "chief_complaint_immunity_click",
  },
  {
    title: "女性健康",
    helper: "周期 / 气色 / 压力",
    href: "/assessment?scenario=female",
    scenario: "female",
    eventName: "chief_complaint_female_click",
  },
  {
    title: "男性精力",
    helper: "应酬 / 压力 / 体力",
    href: "/assessment?scenario=male",
    scenario: "male",
    eventName: "chief_complaint_male_click",
  },
];

function trackStateClick(option: (typeof stateOptions)[number]) {
  trackAnalyticsEvent({
    name: option.eventName,
    source: "homepage_chief_complaint_selector",
    metadata: { scenario: option.scenario },
  });
}

export default function HomeStateSelector() {
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
        name: "chief_complaint_selector_view",
        source: "homepage_chief_complaint_selector",
        metadata: { optionCount: stateOptions.length },
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

  const priorityOption = stateOptions[0]!;
  const standardOptions = stateOptions.slice(1);

  return (
    <section
      ref={sectionRef}
      className="section-container py-12 md:py-14"
      aria-labelledby="state-selector-title"
    >
      <div className="mb-6 max-w-3xl">
        <span className="badge-teal">Chief Complaint Selector</span>
        <h2 id="state-selector-title" className="mt-4 text-balance text-[var(--text-primary)]">
          你主要想先判断哪类状态？
        </h2>
        <p className="mt-3 text-base leading-8 text-[var(--text-secondary)] md:text-lg">
          只需选择一个最接近的状态；如果症状混合或首次使用，建议选择 AI 帮我判断。所有选项都会进入同一个健康分层流程。
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.05fr_2fr]">
        <Link
          href={priorityOption.href}
          className="group flex min-h-[116px] flex-col justify-between rounded-lg border border-[var(--clinical-primary)] bg-[var(--clinical-primary-soft)] px-4 py-4 shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          onClick={() => trackStateClick(priorityOption)}
        >
          <div>
            <span className="text-xs font-semibold uppercase text-[var(--clinical-primary)]">
              建议优先
            </span>
            <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)]">
              {priorityOption.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {priorityOption.helper}
            </p>
          </div>
          <span className="mt-4 text-sm font-semibold text-[var(--clinical-primary)] group-hover:text-[var(--clinical-primary-hover)]">
            进入统一分层 →
          </span>
        </Link>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {standardOptions.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group flex min-h-[86px] items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:border-[var(--clinical-border)] hover:shadow-[var(--shadow-md)]"
              onClick={() => trackStateClick(option)}
            >
              <span className="min-w-0">
                <span className="block text-base font-semibold text-[var(--text-primary)]">
                  {option.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[var(--text-secondary)]">
                  {option.helper}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-sm font-semibold text-[var(--clinical-primary)] transition group-hover:bg-[var(--clinical-primary-soft)]"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
