import Link from "next/link";
import AssessmentOverviewVideo from "@/components/media/AssessmentOverviewVideo";
import TrustSection from "@/components/sections/TrustSection";
import { solutionGuides } from "@/lib/health/solutions";
import { MEDICAL_DISCLAIMER } from "@/lib/health/safety";
import { listFreeTools } from "@/lib/marketing/free-tools";

const heroPoints = [
  "先做 3 分钟 AI 评估，再进入方案与购买入口",
  "结果包含风险等级、生活建议、补充剂方向与 OTC 方向",
  "高风险情况不展示购买按钮，优先建议及时就医",
];

const steps = [
  {
    title: "填写资料",
    description: "填写年龄、性别、主要困扰、持续时间和生活方式。",
  },
  {
    title: "获取报告",
    description: "系统先做风险分层，再生成生活方式和方向性建议。",
  },
  {
    title: "进入方案",
    description: "根据问题类型查看解决方案页，再进入购买中转页。",
  },
];

const featuredFreeTools = listFreeTools().filter((tool) =>
  ["sleep-score", "female-health-check", "fatigue-check"].includes(tool.slug),
);

export default function HomeAssessmentLanding() {
  return (
    <main className="bg-[var(--bg)]">
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.18),transparent_28%)]" />
        <div className="section-container relative py-20 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="max-w-3xl">
              <span className="badge bg-white/10 text-teal-100 ring-1 ring-white/15">
                AI 健康评估入口
              </span>
              <h1 className="mt-6 max-w-3xl text-balance text-[clamp(2.6rem,6vw,4.8rem)] font-bold leading-[1.02] tracking-tight">
                3 分钟 AI 健康评估
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                根据你的症状、年龄、生活习惯，生成个性化健康调理建议。先评估，再看方案，再进入购买入口。
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/ai-consult" className="btn-primary">
                  立即开始 AI 评估
                </Link>
                <Link href="/solutions/sleep" className="btn-ghost">
                  先看健康方案
                </Link>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {heroPoints.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200 backdrop-blur">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <AssessmentOverviewVideo
                src="/videos/home-assessment-overview.mp4"
                poster="/videos/home-assessment-first-frame.jpg"
                label="荣旺 AI 健康评估流程视频"
                className="border-white/15 bg-slate-900/40 shadow-2xl"
              />

              <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-teal-100">示例报告</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">疲劳恢复评估</h2>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-100 ring-1 ring-amber-200/20">
                    风险等级: 中
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-slate-950/40 p-4">
                    <p className="text-sm text-slate-300">AI 结论</p>
                    <p className="mt-2 text-sm leading-6 text-slate-100">
                      当前更像是恢复不足叠加睡眠债，建议先稳住作息和应酬节奏，再看精力支持方向。
                    </p>
                  </div>
                  <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-300">
                    {MEDICAL_DISCLAIMER}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-16 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="badge-teal">Free Tools</span>
            <h2 className="mt-4 text-balance text-slate-900">先做 1 分钟免费自测，再进入完整 AI 评估</h2>
            <p className="mt-3 text-lg text-slate-500">
              免费工具帮助你快速分层睡眠、疲劳和女性健康信号。结果只做健康教育，不直接导向购买。
            </p>
          </div>
          <Link href="/tools/health-check" className="btn-secondary">
            查看全部免费工具
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredFreeTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-3xl border border-teal-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
            >
              <p className="text-sm font-medium text-teal-700">{tool.shortTitle}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{tool.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{tool.hero}</p>
              <p className="mt-5 text-sm font-semibold text-slate-800 group-hover:text-teal-700">
                开始免费自测 →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-container py-16 md:py-20">
        <div className="mb-8 max-w-2xl">
          <span className="badge-teal">Health Guides</span>
          <h2 className="mt-4 text-balance text-slate-900">从健康问题进入，不先推商品</h2>
          <p className="mt-3 text-lg text-slate-500">
            先进入对应场景页或直接做 AI 评估，确认风险等级和支持方向后，再查看推荐入口。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {solutionGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/assessment/${guide.slug}`}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              <p className="text-sm font-medium text-teal-700">{guide.shortTitle}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{guide.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{guide.eyebrow}</p>
              <p className="mt-5 text-sm font-medium text-slate-800 group-hover:text-teal-700">
                进入自测 →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="section-container py-16 md:py-20">
          <div className="mb-8 max-w-2xl">
          <span className="badge-orange">Health Plans</span>
            <h2 className="mt-4 text-balance text-slate-900">每个健康方案页都围绕“问题解决”设计</h2>
            <p className="mt-3 text-lg text-slate-500">
              方案页会覆盖问题描述、常见原因、就医信号、AI 自测入口、基础调理方案与购买入口。
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {solutionGuides.map((guide) => (
              <div key={guide.slug} className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-teal-700">{guide.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">{guide.title}</h3>
                  </div>
                  <span className="badge-slate">健康方案页</span>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">{guide.summary}</p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-medium text-slate-900">常见原因</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {guide.commonCauses.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-medium text-slate-900">就医信号</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {guide.seekCareSignals.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/solutions/${guide.slug}`} className="btn-secondary">
                    查看方案页
                  </Link>
                  <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
                    从这里开始评估
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container py-16 md:py-20">
        <div className="mb-8 max-w-2xl">
          <span className="badge-teal">How It Works</span>
          <h2 className="mt-4 text-slate-900">核心路径</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700 ring-1 ring-teal-200/60">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <TrustSection />

      <section className="section-container py-16">
        <div className="rounded-3xl border border-orange-200 bg-orange-50 px-6 py-8">
          <span className="badge-orange">免责声明</span>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-orange-900">{MEDICAL_DISCLAIMER}</p>
        </div>
      </section>
    </main>
  );
}
