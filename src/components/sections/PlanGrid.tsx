import Link from "next/link";

const plans = [
  {
    title: "抗疲劳组合",
    desc: "B族 + 镁 + Omega-3",
    href: "/plans/fatigue",
    price: 299,
    originalPrice: 459,
    badge: "订阅享20% off",
    badgeColor: "bg-orange",
    icon: "⚡",
    gradient: "from-orange-100 to-amber-50"
  },
  {
    title: "免疫增强组合",
    desc: "维生素D + 锌 + 益生菌",
    href: "/plans/immune",
    price: 349,
    originalPrice: 529,
    badge: "今日特价",
    badgeColor: "bg-red-500",
    icon: "🛡️",
    gradient: "from-teal-bg to-emerald-50"
  },
  {
    title: "睡眠改善组合",
    desc: "镁 + GABA + 褪黑素",
    href: "/plans/sleep",
    price: 259,
    originalPrice: 389,
    badge: "高复购",
    badgeColor: "bg-purple-500",
    icon: "😴",
    gradient: "from-purple-50 to-violet-50"
  },
  {
    title: "压力缓解全套",
    desc: "全营养支持",
    href: "/plans/stress",
    price: 399,
    originalPrice: 598,
    badge: "限时",
    badgeColor: "bg-orange",
    icon: "😣",
    gradient: "from-red-50 to-pink-50"
  }
];

export default function PlanGrid() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <Link
          key={plan.title}
          href={plan.href}
          className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-2 hover:shadow-xl"
        >
          {/* Badge */}
          <span
            className={`absolute left-4 top-4 z-10 rounded-full ${plan.badgeColor} px-3.5 py-1.5 text-xs font-bold text-white`}
          >
            {plan.badge}
          </span>

          {/* Image area */}
          <div
            className={`flex aspect-[3/2] items-center justify-center bg-gradient-to-br ${plan.gradient} text-6xl`}
          >
            {plan.icon}
          </div>

          {/* Body */}
          <div className="p-6">
            <h3 className="text-lg font-bold">{plan.title}</h3>
            <div className="mt-1 text-sm text-slate-400">{plan.desc}</div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-2xl font-extrabold text-teal">
                  ¥{plan.price}
                </span>
                <span className="ml-2 text-sm text-slate-400 line-through">
                  ¥{plan.originalPrice}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                ¥{(plan.price / 30).toFixed(2)}/天
              </span>
            </div>
            <div className="mt-4 rounded-xl bg-teal py-3.5 text-center text-sm font-bold text-white transition group-hover:bg-teal-dark">
              查看方案详情
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
