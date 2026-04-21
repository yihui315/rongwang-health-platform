import Link from "next/link";

const subPlans = [
  { label: '30天方案', desc: '适合初次尝试', saving: '', iconPath: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
  { label: '60天方案', desc: '持续改善推荐', saving: '省 8%', iconPath: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
  { label: '90天方案', desc: '最佳性价比', saving: '省 15%', iconPath: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
];

export default function SubscriptionSection() {
  return (
    <section className="py-20 md:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 ring-1 ring-orange-200/60 px-3 py-1 text-[12px] font-semibold text-orange-700 mb-5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              订阅制
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              健康，不该
              <br />
              断断续续
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500 max-w-md">
              订阅制方案让你更省心——自动补货、自动提醒、自动复盘。持续执行才能看到真正的改善。
            </p>
            <Link
              href="/subscription"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3.5 text-[14px] font-semibold text-white hover:-translate-y-0.5 transition-all shadow-sm group"
              style={{ boxShadow: '0 2px 8px rgba(249,115,22,0.25)' }}
            >
              了解订阅计划
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="space-y-3">
            {subPlans.map((plan) => (
              <div key={plan.label} className="group rounded-2xl bg-white border border-slate-200/80 p-5 flex items-center gap-4 hover:shadow-md hover:border-slate-300 transition-all" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 transition-colors">
                  <svg className="h-5 w-5 text-slate-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={plan.iconPath} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-bold text-slate-900">{plan.label}</h3>
                  <p className="text-[12px] text-slate-500">{plan.desc}</p>
                </div>
                {plan.saving && (
                  <span className="rounded-full bg-orange-50 ring-1 ring-orange-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700">
                    {plan.saving}
                  </span>
                )}
                <svg className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
