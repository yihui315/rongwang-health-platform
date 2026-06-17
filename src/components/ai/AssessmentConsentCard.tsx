"use client";

import Link from "next/link";
import type { AssessmentConsent } from "@/schemas/assessment-consent";

interface AssessmentConsentCardProps {
  consent: AssessmentConsent | null;
  reportConsentChecked: boolean;
  marketingOptIn: boolean;
  error: string;
  onReportConsentChange: (checked: boolean) => void;
  onMarketingOptInChange: (checked: boolean) => void;
  onContinue: () => void;
}

export default function AssessmentConsentCard({
  consent,
  reportConsentChecked,
  marketingOptIn,
  error,
  onReportConsentChange,
  onMarketingOptInChange,
  onContinue,
}: AssessmentConsentCardProps) {
  return (
    <div className="mb-8 rounded-lg border border-[var(--clinical-border)] bg-white p-5 shadow-[var(--shadow-xs)] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <span className="badge-slate">Privacy Boundary</span>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
            开始前确认资料使用边界
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] md:text-base">
            你的健康资料仅用于生成本次健康分层结果与相关服务。未经你单独同意，不用于商业营销推送。
          </p>
        </div>
        {consent ? (
          <div className="rounded-lg border border-[var(--clinical-border)] bg-[var(--surface-muted)] px-4 py-3 text-xs leading-6 text-[var(--text-secondary)]">
            <p>同意时间：{new Date(consent.consent_timestamp).toLocaleString("zh-HK")}</p>
            <p>营销接收：{consent.marketing_opt_in ? "已同意" : "未同意"}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <input
            checked={reportConsentChecked}
            disabled={Boolean(consent)}
            onChange={(event) => onReportConsentChange(event.target.checked)}
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--clinical-primary)] disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium leading-6 text-[var(--text-primary)]">
            我同意荣旺根据我的回答生成本次健康分层结果。
            <span className="ml-2 text-xs font-semibold text-[var(--clinical-primary)]">
              必选
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <input
            checked={marketingOptIn}
            disabled={Boolean(consent)}
            onChange={(event) => onMarketingOptInChange(event.target.checked)}
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--teal)] disabled:cursor-not-allowed"
          />
          <span className="text-sm leading-6 text-[var(--text-secondary)]">
            我同意接收健康内容、复测提醒和优惠资讯。
            <span className="ml-2 text-xs font-semibold text-[var(--text-muted)]">
              可选
            </span>
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-[var(--border)] pt-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)]">
          <Link className="font-medium text-[var(--clinical-primary)] hover:underline" href="/privacy">
            隐私政策
          </Link>
          <Link className="font-medium text-[var(--clinical-primary)] hover:underline" href="/terms">
            健康免责声明
          </Link>
          <Link className="font-medium text-[var(--clinical-primary)] hover:underline" href="/health-review-standard">
            健康内容与评估规则标准
          </Link>
        </div>

        {consent ? (
          <p className="rounded-lg border border-[var(--clinical-border)] bg-[var(--clinical-primary-soft)] px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
            已记录本次评估同意，可以继续填写。
          </p>
        ) : (
          <button
            type="button"
            disabled={!reportConsentChecked}
            onClick={onContinue}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            继续填写健康分层问题
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-[var(--risk-high)]/25 bg-red-50 px-4 py-3 text-sm text-[var(--risk-high)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
