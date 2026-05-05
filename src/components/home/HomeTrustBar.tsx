import HomeIcon from "@/components/home/HomeIcon";
import { homeTrustPoints } from "@/lib/home/home-content";

/**
 * 4 个信任点 —— Hero 下方紧贴一行展示，桌面 4 栏，移动 2 栏。
 */
export default function HomeTrustBar() {
  return (
    <section className="border-y border-slate-100 bg-white py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {homeTrustPoints.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition hover:border-emerald-100 hover:shadow-md md:flex-row md:items-start md:text-left"
            >
              <span className="mb-3 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 md:mb-0 md:mr-3">
                <HomeIcon name={item.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
