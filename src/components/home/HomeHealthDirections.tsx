import Link from "next/link";
import HomeIcon from "@/components/home/HomeIcon";
import {
  homeHealthDirections,
  type HealthDirection,
} from "@/lib/home/home-content";

const accentMap: Record<
  HealthDirection["accent"],
  { gradient: string; chip: string; icon: string; underline: string }
> = {
  purple: {
    gradient: "from-violet-100 via-purple-50 to-white",
    chip: "bg-violet-50 text-violet-700",
    icon: "text-violet-600 bg-violet-50",
    underline: "decoration-violet-300",
  },
  green: {
    gradient: "from-emerald-100 via-emerald-50 to-white",
    chip: "bg-emerald-50 text-emerald-700",
    icon: "text-emerald-600 bg-emerald-50",
    underline: "decoration-emerald-300",
  },
  blue: {
    gradient: "from-sky-100 via-blue-50 to-white",
    chip: "bg-sky-50 text-sky-700",
    icon: "text-sky-600 bg-sky-50",
    underline: "decoration-sky-300",
  },
  pink: {
    gradient: "from-pink-100 via-rose-50 to-white",
    chip: "bg-pink-50 text-pink-700",
    icon: "text-pink-600 bg-pink-50",
    underline: "decoration-pink-300",
  },
};

/**
 * 关注你的健康方向 —— 4 张方向卡片，桌面 4 栏。
 * 上方为渐变 + 图标占位区，下方为标题/描述/CTA。
 */
export default function HomeHealthDirections() {
  return (
    <section className="bg-slate-50/50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          关注你的健康方向
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {homeHealthDirections.map((item) => {
            const accent = accentMap[item.accent];
            return (
              <div
                key={item.title}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`relative h-32 w-full bg-gradient-to-br ${accent.gradient}`}
                  aria-hidden
                >
                  <span
                    className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 ${accent.icon} shadow-sm`}
                  >
                    <HomeIcon name={item.icon} className="h-5 w-5" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-base font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition group-hover:text-emerald-700"
                  >
                    进入评估
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
