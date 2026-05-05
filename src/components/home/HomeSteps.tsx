import HomeIcon from "@/components/home/HomeIcon";
import { homeSteps } from "@/lib/home/home-content";

/**
 * 如何开始 —— 3 步流程，桌面横向，移动纵向。
 */
export default function HomeSteps() {
  const stepIcons = ["edit", "clipboard-check", "shield-check"] as const;

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          如何开始
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-4">
          {homeSteps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="flex h-full flex-col items-start rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-emerald-100 hover:shadow-md">
                <div className="flex w-full items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <HomeIcon name={stepIcons[index]} className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  {step.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>

              {/* 桌面端步骤间的箭头 */}
              {index < homeSteps.length - 1 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-[-22px] top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center text-slate-300 md:inline-flex"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
