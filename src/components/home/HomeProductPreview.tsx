import Link from "next/link";
import { productPreviewItems } from "@/lib/home/home-content";

/**
 * 方案推荐方向（示例） —— 不是商品货架，而是评估方向预览。
 */
export default function HomeProductPreview() {
  return (
    <section className="bg-slate-50/50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            方案推荐方向
            <span className="ml-1 text-base font-normal text-slate-400">
              (示例)
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            完整推荐将在评估后为你展示
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productPreviewItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* 产品占位图：渐变 + 简化瓶身 */}
              <div className="flex h-36 w-full items-center justify-center rounded-xl bg-gradient-to-b from-slate-50 to-white">
                <ProductBottle accent={item.title} />
              </div>

              <p className="mt-5 text-base font-semibold text-slate-900">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {item.description}
              </p>

              <Link
                href={item.href}
                className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                查看详情
                <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          产品示例仅供方向参考，具体推荐以评估结果为准。
        </p>
      </div>
    </section>
  );
}

/**
 * 简化的瓶身 SVG 占位 —— 颜色随品类变化。
 */
function ProductBottle({ accent }: { accent: string }) {
  const colorMap: Record<string, string> = {
    睡眠支持: "#7c3aed",
    日常免疫: "#0d9488",
    疲劳恢复: "#b45309",
  };
  const main = colorMap[accent] ?? "#0d9488";

  return (
    <svg viewBox="0 0 80 110" className="h-28" aria-hidden>
      {/* 瓶盖 */}
      <rect x="22" y="6" width="36" height="14" rx="2" fill="#94a3b8" />
      {/* 瓶身 */}
      <rect
        x="16"
        y="20"
        width="48"
        height="78"
        rx="5"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="1.4"
      />
      {/* 标签色块 */}
      <rect x="20" y="40" width="40" height="42" rx="3" fill={main} opacity="0.85" />
      {/* 标签线 */}
      <rect x="26" y="50" width="28" height="3" rx="1.5" fill="#ffffff" opacity="0.85" />
      <rect x="26" y="58" width="20" height="2" rx="1" fill="#ffffff" opacity="0.65" />
      <rect x="26" y="64" width="24" height="2" rx="1" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}
