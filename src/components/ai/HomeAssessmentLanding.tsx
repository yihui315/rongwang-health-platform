import Link from "next/link";
import HomeHeroCtas from "@/components/ai/HomeHeroCtas";
import HomeHeroReportCard from "@/components/ai/HomeHeroReportCard";
import HomeFaqAndProtocolBasis from "@/components/ai/HomeFaqAndProtocolBasis";
import HomeFinalCta from "@/components/ai/HomeFinalCta";
import HomeFulfillmentMap from "@/components/ai/HomeFulfillmentMap";
import HomeMedicalReviewStrip from "@/components/ai/HomeMedicalReviewStrip";
import HomeProductPassportPreview from "@/components/ai/HomeProductPassportPreview";
import HomeStateSelector from "@/components/ai/HomeStateSelector";
import TrustSection from "@/components/sections/TrustSection";
import { solutionGuides } from "@/lib/health/solutions";
import { MEDICAL_DISCLAIMER } from "@/lib/health/safety";

const heroTrustBullets = [
  "统一评估引擎",
  "LOW / MEDIUM / HIGH 风险分流",
  "高风险不展示产品入口",
  "营养支持方向先教育",
  "Product Passport 证据护照",
  "跨境履约信息透明",
];

const steps = [
  {
    title: "主诉选择",
    description: "先选择睡眠、疲劳、应酬后支持等主诉入口。",
  },
  {
    title: "统一评估",
    description: "所有入口进入同一个健康分层协议，不拆成多个测试。",
  },
  {
    title: "风险分流",
    description: "先判断 LOW / MEDIUM / HIGH，再决定下一步强度。",
  },
  {
    title: "保存报告",
    description: "保存教育报告，并在同意后进入后续服务沟通。",
  },
  {
    title: "证据与履约",
    description: "允许时再查看营养支持方向、产品证据护照和跨境说明。",
  },
];

export default function HomeAssessmentLanding() {
  return (
    <main className="overflow-x-hidden bg-[var(--bg)]">
      <section className="border-b border-[var(--border)] bg-gradient-hero">
        <div className="section-container overflow-hidden py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="min-w-0 max-w-3xl">
              <span className="badge-teal">
                荣旺健康分层协议 · 非诊断 · 健康教育用途 · 高风险先就医
              </span>
              <h1 className="mt-5 max-w-[calc(100vw-2.5rem)] break-words text-balance text-[2.35rem] font-bold leading-[1.12] text-[var(--text-primary)] sm:text-5xl lg:max-w-3xl lg:text-[3.25rem] xl:text-[3.5rem]">
                <span className="block">先完成健康风险分层，</span>
                <span className="block">再判断是否适合</span>
                <span className="block">营养支持</span>
              </h1>
              <p className="mt-5 max-w-[22rem] break-words text-base leading-7 text-[var(--text-secondary)] sm:max-w-xl md:text-lg lg:max-w-2xl">
                3 分钟完成健康分层。评估基于循证问题集与规则化分流逻辑，先识别需要优先线下咨询的风险信号，再根据睡眠、疲劳、应酬、免疫、女性/男性健康等状态，生成生活方式建议与营养支持方向。高风险情况不展示购买入口。
              </p>

              <HomeHeroCtas />

              <div
                className="mt-7 grid max-w-[22rem] gap-2 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3"
                aria-label="平台信任说明"
              >
                {heroTrustBullets.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] shadow-[var(--shadow-xs)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full min-w-0 max-w-[22rem] sm:max-w-xl lg:max-w-none lg:justify-self-end">
              <HomeHeroReportCard />
            </div>
          </div>
        </div>
      </section>

      <HomeMedicalReviewStrip />

      <HomeStateSelector />

      <section className="border-y border-[var(--border-subtle)] bg-white">
        <div className="section-container py-14 md:py-18">
          <div className="mb-7 max-w-2xl">
            <span className="badge-orange">Protocol Paths</span>
            <h2 className="mt-4 text-balance text-[var(--text-primary)]">
              主诉只是入口，评估引擎保持统一
            </h2>
            <p className="mt-3 text-base leading-8 text-[var(--text-secondary)] md:text-lg">
              你可以先阅读对应的健康教育页面，也可以直接进入统一评估。页面内容用于风险分层和营养支持方向判断，不替代医生或药师建议。
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {solutionGuides.map((guide) => (
              <div key={guide.slug} className="report-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--nutrition-teal-dark)]">
                      {guide.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                      {guide.title}
                    </h3>
                  </div>
                  <span className="badge-slate">协议路径</span>
                </div>

                <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                  {guide.summary}
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="evidence-table">
                    <div className="evidence-row bg-[var(--surface-muted)]">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        常见原因
                      </p>
                    </div>
                    {guide.commonCauses.slice(0, 3).map((item) => (
                      <div key={item} className="evidence-row">
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="evidence-table">
                    <div className="evidence-row bg-[var(--surface-muted)]">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        就医信号
                      </p>
                    </div>
                    {guide.seekCareSignals.slice(0, 3).map((item) => (
                      <div key={item} className="evidence-row">
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/solutions/${guide.slug}`} className="btn-secondary">
                    查看教育页面
                  </Link>
                  <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
                    进入统一评估
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container py-14 md:py-18">
        <div className="mb-7 max-w-2xl">
          <span className="badge-teal">Protocol Flow</span>
          <h2 className="mt-4 text-[var(--text-primary)]">保护优先的分层路径</h2>
        </div>

        <div className="process-strip">
          {steps.map((step, index) => (
            <div key={step.title} className="process-step">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--clinical-primary-soft)] text-xs font-semibold text-[var(--clinical-primary)] ring-1 ring-[var(--clinical-border)]">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <HomeProductPassportPreview />

      <HomeFulfillmentMap />

      <TrustSection />

      <HomeFaqAndProtocolBasis />

      <section className="section-container py-14">
        <div className="rounded-lg border border-[var(--risk-medium-border)] bg-[var(--risk-medium-soft)] px-5 py-6">
          <span className="badge-orange">免责声明</span>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--risk-medium)]">
            {MEDICAL_DISCLAIMER}
          </p>
        </div>
      </section>

      <HomeFinalCta />
    </main>
  );
}
