import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-teal-50/20 min-h-[85vh] flex items-center">
      {/* High-quality botanical background */}
      <Image
        src="/images/hero/hero-botanical-bg.png"
        alt=""
        fill
        className="object-cover opacity-[0.07]"
        priority
      />

      {/* Decorative elements */}
      <div className="pointer-events-none absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-teal-100/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-5%] h-[500px] w-[500px] rounded-full bg-orange-100/25 blur-[80px]" />
      <div className="pointer-events-none absolute top-[30%] left-[40%] h-[300px] w-[300px] rounded-full bg-emerald-100/20 blur-[60px]" />
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.025]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28 lg:py-32 w-full">
        <div className="grid gap-12 lg:gap-16 md:grid-cols-2 md:items-center">
          {/* Left — Copy */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-white/80 px-4 py-2 text-[13px] font-medium text-teal-700 backdrop-blur-sm shadow-sm animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
              3分钟 AI 健康检测 · 家庭健康管理
            </div>

            <h1 className="text-[clamp(2.5rem,5.5vw,4rem)] font-bold leading-[1.08] tracking-tight text-slate-900 animate-fade-up" style={{ animationDelay: '80ms' }}>
              把健康管理，
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                变得更简单。
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-500 max-w-lg animate-fade-up" style={{ animationDelay: '160ms' }}>
              3 分钟 AI 检测，为你和家人匹配更适合的日常健康方案。
              覆盖疲劳、睡眠、免疫、压力四大场景。
            </p>

            <div className="mt-10 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
              <Link
                href="/ai-consult"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 px-8 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ boxShadow: '0 4px 16px rgba(13,148,136,0.3), 0 1px 3px rgba(0,0,0,0.08)' }}
              >
                开始 AI 检测
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/solutions/fatigue"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-[15px] font-semibold text-slate-600 transition-all hover:bg-white hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
              >
                了解健康方案
              </Link>
            </div>

            <div className="mt-14 flex items-center gap-8 animate-fade-up" style={{ animationDelay: '320ms' }}>
              <div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">52,847</div>
                <div className="text-[13px] text-slate-400 mt-0.5">完成检测</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">98.7%</div>
                <div className="text-[13px] text-slate-400 mt-0.5">用户满意度</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">HK</div>
                <div className="text-[13px] text-slate-400 mt-0.5">保税直邮</div>
              </div>
            </div>
          </div>

          {/* Right — Product family image + dashboard overlay */}
          <div className="relative animate-fade-up hidden md:block" style={{ animationDelay: '200ms' }}>
            {/* Product family photo */}
            <div className="relative rounded-[28px] overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}>
              <Image
                src="/images/hero/hero-product-family.png"
                alt="荣旺健康产品系列"
                width={640}
                height={480}
                className="w-full h-auto object-cover"
                priority
              />

              {/* Floating dashboard card overlay */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">AI 推荐方案</div>
                    <div className="text-[14px] font-bold text-slate-900">抗疲劳 + 深度睡眠组合</div>
                  </div>
                  <div className="ml-auto">
                    <span className="rounded-full bg-teal-50 ring-1 ring-teal-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                      匹配 94%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '疲劳', value: 72, color: 'from-orange-400 to-red-400' },
                    { label: '睡眠', value: 58, color: 'from-indigo-400 to-violet-500' },
                    { label: '压力', value: 81, color: 'from-rose-400 to-pink-500' },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <div className="text-[11px] text-slate-400 mb-1">{m.label}</div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${m.value}%` }} />
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 mt-0.5 tabular-nums">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating accent */}
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-500 opacity-[0.08] blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
