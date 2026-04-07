const trustItems = [
  { icon: "🚚", title: "香港直邮", desc: "3-5天到家" },
  { icon: "🔬", title: "蓝帽认证", desc: "正品保障" },
  { icon: "🌍", title: "全球品牌", desc: "零添加" },
  { icon: "🔄", title: "30天退货", desc: "无理由" }
];

export default function TrustBar() {
  return (
    <section className="border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          为什么选择荣旺
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-teal hover:shadow-md"
            >
              <span className="flex-shrink-0 text-4xl">{item.icon}</span>
              <div>
                <div className="text-base font-bold">{item.title}</div>
                <div className="text-sm text-slate-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
