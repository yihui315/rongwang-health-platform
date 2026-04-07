import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-teal-bg py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center">
        {/* Left text */}
        <div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            <span className="text-teal">90%中国人</span>缺关键营养
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-700 md:text-xl">
            你的疲劳、免疫差、睡不好
            <br className="hidden md:block" />
            可能不是压力，而是营养缺口
          </p>
          <p className="mt-4 leading-7 text-slate-500">
            🧬 <strong className="text-slate-700">3分钟AI检测</strong> ·
            生成专属补充方案
            <br />
            香港正品直邮 · 医学级配方
          </p>
          <div className="mt-8">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-full bg-teal px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-teal/25 transition hover:-translate-y-1 hover:bg-teal-dark hover:shadow-xl"
            >
              立即免费AI检测 →
            </Link>
          </div>
          <div className="mt-10 flex gap-10 border-t-2 border-slate-200 pt-8">
            <div>
              <div className="text-3xl font-extrabold text-teal">52,847+</div>
              <div className="text-sm text-slate-500">完成检测</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-teal">98.7%</div>
              <div className="text-sm text-slate-500">满意度</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-teal">48H</div>
              <div className="text-sm text-slate-500">香港极速达</div>
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div className="hidden md:block">
          <div className="relative mx-auto max-w-[580px] overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-bg to-emerald-100 shadow-2xl shadow-teal/20">
            <span className="absolute left-6 top-6 z-10 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white">
              已帮助 50,000+ 用户
            </span>
            <div className="flex aspect-[3/2.6] flex-col items-center justify-center p-10 text-center">
              <div className="animate-float text-7xl">🧬</div>
              <div className="mt-5 text-xl font-bold text-teal-dark">
                AI智能营养检测
              </div>
              <div className="mt-2 text-sm text-slate-500">
                基于30万+临床文献
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
