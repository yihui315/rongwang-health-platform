import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import AssessmentOverviewVideo from "@/components/media/AssessmentOverviewVideo";
import TrustSection from "@/components/sections/TrustSection";
import { MEDICAL_DISCLAIMER } from "@/lib/health/safety";
import { listFreeTools } from "@/lib/marketing/free-tools";

const heroPoints = [
  "先看风险分层，再看生活方式和营养支持方向",
  "中高风险结果优先提示就医或药师咨询，不直接导向购买",
  "商品入口通过规则匹配和点击记录，避免让AI自由推荐具体商品",
];

const reportHighlights = [
  { label: "评估时间", value: "约3分钟" },
  { label: "输出内容", value: "风险 / 建议 / 方案" },
  { label: "购买策略", value: "低风险才展示" },
];

const assessmentCards = [
  {
    slug: "fatigue",
    title: "持续疲劳",
    desc: "下午犯困、恢复慢、熬夜后状态下滑。",
    image: "/images/visual-v2/scene-fatigue.webp",
  },
  {
    slug: "sleep",
    title: "睡眠不稳",
    desc: "入睡慢、夜醒、睡醒仍然觉得累。",
    image: "/images/visual-v2/scene-sleep.webp",
  },
  {
    slug: "immune",
    title: "换季防护",
    desc: "近期容易不适、恢复周期变长。",
    image: "/images/visual-v2/scene-immune.webp",
  },
  {
    slug: "stress",
    title: "压力紧绷",
    desc: "长期高压、情绪波动、注意力下降。",
    image: "/images/visual-v2/scene-stress.webp",
  },
];

const steps = [
  {
    title: "填写基础信息",
    desc: "年龄、主要困扰、持续时间、睡眠和运动情况。",
  },
  {
    title: "生成教育报告",
    desc: "先做风险提示，再给出生活方式和支持方向。",
  },
  {
    title: "进入对应方案",
    desc: "低风险结果可继续查看方案页和可控购买入口。",
  },
];

const featuredTools = listFreeTools()
  .filter((tool) => ["sleep-score", "female-health-check", "fatigue-check"].includes(tool.slug))
  .slice(0, 3);

const assessmentVideoPath = join(process.cwd(), "public/videos/home-assessment-overview.mp4");
const assessmentVideoWebmPath = join(process.cwd(), "public/videos/home-assessment-overview.webm");
const assessmentVideoSrc = existsSync(assessmentVideoPath) ? "/videos/home-assessment-overview.mp4" : undefined;
const assessmentVideoWebmSrc = existsSync(assessmentVideoWebmPath) ? "/videos/home-assessment-overview.webm" : undefined;

export default function HomeAssessmentLanding() {
  return (
    <main className="bg-[var(--bg)]">
      <section className="bg-gradient-hero">
        <div className="section-container grid min-h-[calc(100vh-4rem)] gap-10 py-14 md:grid-cols-[1.02fr_0.98fr] md:items-center lg:py-18">
          <div className="max-w-2xl">
            <span className="badge-teal">AI健康评估入口</span>
            <h1 className="mt-5 text-balance text-[var(--text-primary)]">
              先做3分钟评估，再选择适合的健康支持方向
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
              荣旺健康从你的症状、年龄和生活方式开始，生成教育型健康报告。我们先帮你看风险和方向，再谨慎进入方案与购买入口。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ai-consult" className="btn-primary">
                开始3分钟评估
              </Link>
              <Link href="/solutions/sleep" className="btn-secondary">
                查看健康方案
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroPoints.map((item) => (
                <div key={item} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
              <Image
                src="/images/visual-v2/home-hero-assessment.webp"
                alt="用户查看AI健康评估摘要"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#183531]/40 via-transparent to-transparent" />
              <div className="clinical-panel absolute bottom-4 left-4 right-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--teal-dark)]">示例报告</p>
                    <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                      疲劳恢复评估
                    </h2>
                  </div>
                  <span className="badge-clay">中等风险</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  当前更像是恢复不足叠加压力输出。建议先稳定作息和恢复节奏，再查看营养支持方向。
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {reportHighlights.map((item) => (
                    <div key={item.label} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2">
                      <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <span className="badge-teal">常用评估</span>
            <h2 className="mt-4 text-balance text-[var(--text-primary)]">
              从你最关心的问题开始
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
              不确定该买什么时，先不要从商品开始。选择一个最接近的状态，系统会优先帮你判断风险和下一步方向。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {assessmentCards.map((card) => (
              <Link
                key={card.slug}
                href={`/assessment/${card.slug}`}
                className="group overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{card.desc}</p>
                  <p className="mt-4 text-sm font-semibold text-[var(--teal-dark)]">进入自测</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="warm-band border-y border-[var(--border-subtle)]">
        <div className="section-container grid gap-8 py-14 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-18">
          <AssessmentOverviewVideo
            src={assessmentVideoSrc}
            webmSrc={assessmentVideoWebmSrc}
            poster="/videos/home-assessment-first-frame.jpg"
            label="AI健康评估流程预览"
          />
          <div>
            <span className="badge-clay">评估流程</span>
            <h2 className="mt-4 text-balance text-[var(--text-primary)]">
              让用户感觉被认真理解，而不是被急着成交
            </h2>
            <div className="mt-6 grid gap-4">
              {steps.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[44px_1fr] gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f5f1] text-sm font-bold text-[var(--teal-dark)]">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/ai-consult" className="btn-primary mt-6">
              现在开始评估
            </Link>
          </div>
        </div>
      </section>

      {featuredTools.length > 0 && (
        <section className="section-container py-14 md:py-18">
          <div className="mb-8 max-w-2xl">
            <span className="badge-teal">免费工具</span>
            <h2 className="mt-4 text-[var(--text-primary)]">
              先做1分钟免费自测
            </h2>
            <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
              轻量工具帮助用户快速确认睡眠、疲劳或女性健康信号。结果只做健康教育，不直接导向购买。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--border)]"
              >
                <p className="text-sm font-semibold text-[var(--teal-dark)]">{tool.shortTitle}</p>
                <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{tool.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{tool.hero}</p>
                <p className="mt-5 text-sm font-semibold text-[var(--teal-dark)]">开始免费自测</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <TrustSection />

      <section className="section-container py-14">
        <div className="rounded-lg border border-[#ead7c6] bg-[#fff7ed] px-5 py-6 md:px-8">
          <span className="badge-clay">免责声明</span>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#70442f]">{MEDICAL_DISCLAIMER}</p>
        </div>
      </section>
    </main>
  );
}
