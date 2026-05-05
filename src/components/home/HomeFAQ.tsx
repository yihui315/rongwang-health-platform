import HomeIcon from "@/components/home/HomeIcon";
import { complianceDisclaimer, homeFaqItems } from "@/lib/home/home-content";

/**
 * 常见问题 —— 三栏卡片简洁回答，放在 footer 前。
 */
export default function HomeFAQ() {
  return (
    <section className="bg-slate-50/50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          常见问题
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {homeFaqItems.map((item) => (
            <div
              key={item.question}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <HomeIcon name={item.icon} className="h-5 w-5" />
                </span>
                <p className="pt-1.5 text-sm font-semibold text-slate-900">
                  {item.question}
                </p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        {/* 合规免责声明 */}
        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-slate-400">
          {complianceDisclaimer}
        </p>
      </div>
    </section>
  );
}
