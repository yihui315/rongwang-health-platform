import Link from "next/link";

const plans = [
  {
    title: "抗疲劳组合",
    desc: "适合长期忙碌、精力容易透支的人群",
    href: "/plans/fatigue"
  },
  {
    title: "深度睡眠组合",
    desc: "适合入睡困难、浅睡、夜醒频繁的人群",
    href: "/plans/sleep"
  },
  {
    title: "免疫防护组合",
    desc: "适合换季易感冒、身体防御力偏弱的人群",
    href: "/plans/immune"
  },
  {
    title: "压力缓解组合",
    desc: "适合长期紧绷、焦虑、状态不稳定的人群",
    href: "/plans/stress"
  }
];

export default function PlanGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <Link
          key={plan.title}
          href={plan.href}
          className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="text-xl font-bold">{plan.title}</div>
          <div className="mt-3 text-sm leading-6 text-slate-500">{plan.desc}</div>
          <div className="mt-6 text-sm font-semibold text-teal">查看方案详情 →</div>
        </Link>
      ))}
    </div>
  );
}
