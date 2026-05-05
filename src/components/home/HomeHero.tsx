import Link from "next/link";
import HomeIcon from "@/components/home/HomeIcon";
import { heroBadges, heroReportSample } from "@/lib/home/home-content";

/**
 * 首屏 Hero —— 左侧价值主张 + 右侧 AI 评估报告示例卡。
 */
export default function HomeHero() {
  const { riskScore, riskLevel, lifestyleTips, supportDirections, disclaimer } =
    heroReportSample;

  return (
    <section className="relative overflow-hidden bg-white">
      {/* 极淡绿色 radial gradient 装饰 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 30rem at 70% -10%, rgba(16,185,129,0.08), transparent 60%), radial-gradient(40rem 25rem at -10% 30%, rgba(16,185,129,0.05), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* 左侧：标题 + CTA */}
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
              3分钟 AI 健康评估，
              <br />
              找到更适合你的
              <span className="text-emerald-600">营养支持方向</span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-slate-600 md:text-lg">
              先评估、再看方案、再决定是否购买。
              <br className="hidden sm:block" />
              中高风险优先建议就医；内容仅作健康教育参考。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/ai-consult"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
              >
                立即开始 AI 评估
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/solutions/sleep"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                查看健康方案
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              {heroBadges.map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5">
                  <HomeIcon name="shield-check" className="h-4 w-4 text-emerald-600" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧：AI 评估报告示例卡 */}
          <div className="lg:pl-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    AI评估报告
                    <span className="ml-1 text-xs font-normal text-slate-400">(示例)</span>
                  </p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <HomeIcon name="shield-check" className="h-5 w-5" />
                </span>
              </div>

              {/* 综合风险等级 */}
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <p className="text-xs text-slate-500">综合风险等级</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <HomeIcon name="shield-check" className="h-5 w-5" />
                  </span>
                  <span className="text-4xl font-bold text-slate-900">{riskScore}</span>
                  <span className="text-sm text-slate-400">/ 100</span>
                </div>
                <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {riskLevel}
                </span>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  请关注生活方式调整，必要时咨询专业医生。
                </p>
              </div>

              {/* 生活方式建议 */}
              <div className="mt-4 rounded-2xl border border-slate-100 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  生活方式建议
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    ({lifestyleTips.length}项)
                  </span>
                </p>
                <ul className="mt-3 space-y-2">
                  {lifestyleTips.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <HomeIcon
                        name="shield-check"
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
                      />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 营养支持方向 */}
              <div className="mt-4 rounded-2xl border border-slate-100 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  营养支持方向
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    ({supportDirections.length}项)
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {supportDirections.map((dir) => (
                    <span
                      key={dir}
                      className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      {dir}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-5 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
                <HomeIcon name="info" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>{disclaimer}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
