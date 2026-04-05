import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-teal-bg py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-teal/20 bg-white px-4 py-2 text-sm font-medium text-teal-dark">
            3分钟AI健康检测 · 家庭健康管理
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            把健康管理，变得更简单
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            3分钟AI检测，帮你和家人找到更适合的日常健康方案。
            从疲劳、睡眠、免疫、压力，到家庭成员健康管理，形成完整闭环。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/quiz"
              className="rounded-full bg-teal px-8 py-4 font-semibold text-white shadow-lg shadow-teal/20"
            >
              开始AI检测
            </Link>
            <Link
              href="/plans/fatigue"
              className="rounded-full border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700"
            >
              了解健康方案
            </Link>
          </div>
          <div className="mt-10 flex gap-8 text-sm text-slate-500">
            <div>
              <div className="text-2xl font-bold text-slate-900">52,847+</div>
              <div>完成检测</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">98.7%</div>
              <div>用户满意度</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">HK</div>
              <div>直邮保障</div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-teal/10">
          <div className="rounded-3xl bg-slate-50 p-6">
            <div className="text-sm font-medium text-slate-500">AI健康仪表盘</div>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">当前健康类型</div>
                <div className="mt-1 text-xl font-bold">高压力 + 营养流失型</div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">优先改善项</div>
                <div className="mt-1 text-xl font-bold">疲劳 / 睡眠 / 压力</div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">推荐方案</div>
                <div className="mt-1 text-xl font-bold">抗疲劳组合</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
