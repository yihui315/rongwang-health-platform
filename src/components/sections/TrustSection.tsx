export default function TrustSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">为什么选择荣旺健康</h2>
          <p className="mt-3 text-slate-500">
            我们更重视科学、合规与长期服务，而不是短期营销
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["香港直邮", "稳定配送，清晰可追踪"],
            ["正品保障", "坚持来源透明与品质可溯源"],
            ["科学方案", "基于健康类型和使用逻辑设计"],
            ["灵活订阅", "可暂停、可调整、可取消"],
            ["AI建议", "帮助你更清楚地理解自己"]
          ].map(([title, desc]) => (
            <div key={title} className="rounded-3xl border border-slate-200 p-6">
              <div className="text-lg font-semibold">{title}</div>
              <div className="mt-2 text-sm text-slate-500">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
