import type { Metadata } from "next";
import Link from "next/link";
import { createCanonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "健康内容与评估规则标准",
  description:
    "了解荣旺健康分层协议的内容依据、评估规则、复核机制建设状态、用户数据边界、AI 使用边界与高风险分流原则。",
  alternates: {
    canonical: createCanonicalUrl("/health-review-standard"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const reviewSections = [
  {
    title: "1. 本页面的目的",
    body: [
      "本页面用于说明荣旺健康内容、评估问题集与分层规则如何建立、更新和限定边界，帮助用户在开始评估前理解平台的使用范围。",
      "荣旺健康分层协议参考公开营养学资料、健康教育资料与产品成分安全边界建立。具体内容将随循证资料与专业复核机制持续迭代。",
    ],
  },
  {
    title: "2. 评估规则如何建立",
    body: [
      "评估规则先围绕主诉入口、风险信号、生活方式影响因素和营养支持适配边界拆分问题，再将睡眠、疲劳、应酬、免疫、女性健康和男性健康等入口统一到同一套分层逻辑中。",
      "规则输出只用于 LOW / MEDIUM / HIGH 风险分流、健康教育提示和下一步行动建议；高风险优先提示线下咨询，不进入商品推荐路径。",
    ],
  },
  {
    title: "3. 参考资料类型",
    body: [
      "当前参考资料类型包括公开营养学资料、一般健康教育资料、产品成分资料、标签说明、适用与不适用人群边界、跨境履约与售后说明。",
      "资料使用时优先保留安全边界、注意事项和不适用人群说明，避免把成分信息表达成健康结果承诺。",
    ],
  },
  {
    title: "4. 专业复核机制建设状态",
    body: [
      "专业复核机制建设中；当前页面不声称已有医生、药师或营养师对全部内容进行公开署名复核。",
      "在真实顾问资料、复核范围、复核日期和责任边界完成整理前，荣旺不会以具体资质或姓名作为内容背书。",
    ],
  },
  {
    title: "5. 后续顾问团队公开计划",
    body: [
      "后续计划公开顾问角色、专业背景、参与范围、复核内容类型、更新时间和利益关系说明。",
      "公开信息会优先说明顾问参与的是健康教育内容、规则边界或成分安全边界复核，而不是对用户个人情况作出诊断结论。",
    ],
  },
  {
    title: "6. 用户数据如何使用",
    body: [
      "用户数据仅用于生成本次健康分层结果及相关服务；未经单独同意，不用于商业营销推送。",
      "分析事件只记录页面、入口、粗粒度风险等级、主诉类别等非敏感信息，不记录原始健康答案、联系方式或自由文本健康描述。",
    ],
  },
  {
    title: "7. AI 使用边界",
    body: [
      "AI 用于整理用户输入、辅助生成健康教育解释、提示风险边界和生活方式方向，不用于独立决定具体商品选择。",
      "营养支持方向需要经过规则化边界控制；中高风险或不适用信号出现时，应优先保存报告、复核信息并咨询医生或药师。",
    ],
  },
  {
    title: "8. 高风险分流原则",
    body: [
      "如评估中出现需要优先线下咨询的风险信号，结果页应停止展示购买入口和产品推荐，改为提示用户关注风险边界、保存报告并咨询医生或药师。",
      "高风险分流不是最终医学判断，而是为了减少用户在不确定情况下直接进入营养支持或购买决策。",
    ],
  },
  {
    title: "9. 非诊断声明",
    body: [
      "本评估不构成诊断、治疗或处方建议，也不替代医生或药师的专业意见。",
      "如症状严重、持续、反复出现，或用户正在用药、孕期、哺乳期、有已知健康状况，应优先咨询医生或药师。",
    ],
  },
  {
    title: "10. 版本更新记录",
    body: [
      "RHTP v1.0 · 2026-05-03：建立健康内容与评估规则标准页，公开内容依据、复核机制建设状态、数据边界、AI 使用边界与高风险分流原则。",
      "后续版本将补充公开参考资料清单、复核范围、更新时间和顾问团队说明。",
    ],
  },
];

const summaryItems = [
  "内容先解释风险边界，再进入营养支持方向",
  "未公开真实顾问资料前，不使用具体资质背书",
  "高风险结果不展示购买入口或产品推荐",
  "营销同意保持单独、可选、非预勾选",
];

export default function HealthReviewStandardPage() {
  return (
    <main className="overflow-x-hidden bg-[var(--bg)]">
      <section className="border-b border-[var(--border)] bg-gradient-hero">
        <div className="section-container overflow-hidden py-14 md:py-18">
          <span className="badge-teal">Health Review Standard</span>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div className="min-w-0 max-w-3xl">
              <h1 className="max-w-[calc(100vw-2.5rem)] break-words text-balance text-[2rem] font-bold leading-[1.14] text-[var(--text-primary)] [overflow-wrap:anywhere] sm:text-4xl md:text-5xl lg:max-w-3xl lg:text-[3.5rem]">
                健康内容与评估规则标准
              </h1>
              <p className="mt-5 max-w-[calc(100vw-2.5rem)] break-words text-base leading-8 text-[var(--text-secondary)] [overflow-wrap:anywhere] md:max-w-3xl md:text-lg">
                荣旺健康分层协议参考公开营养学资料、健康教育资料与产品成分安全边界建立。具体内容将随循证资料与专业复核机制持续迭代。
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-[var(--clinical-border)] bg-white px-5 py-5 shadow-[var(--shadow-xs)]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                标准页覆盖范围
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                {summaryItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--nutrition-teal)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-12 md:py-14">
        <div className="grid gap-4">
          {reviewSections.map((section) => (
            <section key={section.title} className="report-card min-w-0 overflow-hidden">
              <h2 className="break-words text-xl font-semibold text-[var(--text-primary)] [overflow-wrap:anywhere]">
                {section.title}
              </h2>
              <div className="mt-4 grid gap-3">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="break-words text-sm leading-7 text-[var(--text-secondary)] [overflow-wrap:anywhere] md:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-[var(--risk-medium-border)] bg-[var(--risk-medium-soft)] px-5 py-6">
          <h2 className="text-lg font-semibold text-[var(--risk-medium)]">
            使用前请先理解边界
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--risk-medium)]">
            本评估不构成诊断、治疗或处方建议，也不替代医生或药师的专业意见。
            如评估提示高风险，请优先线下咨询，并避免直接进入购买决策。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/assessment?scenario=unknown" className="btn-primary">
              开始健康分层
            </Link>
            <Link href="/" className="btn-secondary">
              返回首页
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
