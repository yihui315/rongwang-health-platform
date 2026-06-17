const reportRows = [
  {
    label: "协议版本",
    value: "RHTP v1.0",
  },
  {
    label: "风险信号筛查",
    value: "识别是否存在需要优先线下咨询的提示",
  },
  {
    label: "当前主要状态",
    value: "睡眠 / 疲劳 / 应酬 / 免疫 / 女性健康 / 男性精力",
  },
  {
    label: "生活方式影响因素",
    value: "作息、压力、饮食、运动、饮酒频率等",
  },
  {
    label: "营养支持方向",
    value: "仅在低 / 中风险情况下展示相关方向",
  },
  {
    label: "购买前边界",
    value: "高风险信号出现时，不展示购买入口",
  },
  {
    label: "规则来源与复核状态",
    value: "评估规则由循证文献与临床指南迭代，专业复核机制建设中",
  },
];

export default function HomeHeroReportCard() {
  return (
    <div
      id="hero-report-preview"
      className="report-card w-full max-w-[22rem] shadow-[var(--shadow-md)] sm:max-w-xl"
      aria-label="健康分层报告样例"
    >
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <p className="text-sm font-semibold text-[var(--clinical-primary)]">
          健康分层报告样例
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
          Rongwang Health Triage Protocol
        </h2>
        <p className="mt-2 text-sm font-medium text-[var(--text-muted)]">
          非诊断 · 健康教育用途 · 评估后生成
        </p>
      </div>

      <div className="mt-4 evidence-table">
        {reportRows.map((row) => (
          <div key={row.label} className="grid gap-1 border-t border-[var(--border-subtle)] px-4 py-3 first:border-t-0 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">
              {row.label}
            </p>
            <p className="text-sm leading-6 text-[var(--text-primary)]">
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-lg border border-[var(--nutrition-border)] bg-[var(--nutrition-soft)] px-4 py-3 text-xs leading-6 text-[var(--nutrition-teal-dark)]">
        报告先呈现风险边界与生活方式因素，再判断是否进入营养支持方向。
      </p>
    </div>
  );
}
