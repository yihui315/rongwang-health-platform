import HomeIcon from "@/components/home/HomeIcon";
import { expertChecklist, expertHighlights } from "@/lib/home/home-content";

/**
 * 专业团队 + 科学逻辑模块
 * 左：3 个能力点；中：插画占位；右：checklist。
 */
export default function HomeExpertTrust() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-3 lg:gap-8">
          {/* 左：标题 + 能力点 */}
          <div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
              专业团队 + 科学逻辑，
              <br />
              提供更可靠的健康建议
            </h2>

            <ul className="mt-8 space-y-5">
              {expertHighlights.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <HomeIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 中：插画占位 (SVG / 渐变) */}
          <div className="flex items-center justify-center">
            <div className="relative h-72 w-full max-w-xs overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white shadow-sm">
              <svg
                viewBox="0 0 200 220"
                className="absolute inset-0 h-full w-full"
                aria-hidden
              >
                {/* 极简插画：一位营养顾问轮廓 */}
                <defs>
                  <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ecfdf5" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
                <rect width="200" height="220" fill="url(#bg-grad)" />
                {/* 头 */}
                <circle cx="100" cy="80" r="28" fill="#fde7d4" />
                <path
                  d="M72 80 Q72 50 100 50 Q128 50 128 80 L128 78 Q128 60 100 60 Q72 60 72 78 Z"
                  fill="#1f2937"
                />
                {/* 白大褂 */}
                <path
                  d="M55 220 Q55 140 100 130 Q145 140 145 220 Z"
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                />
                {/* 领口 */}
                <path
                  d="M88 130 L100 160 L112 130 Z"
                  fill="#10b981"
                  opacity="0.7"
                />
                {/* 听诊器 */}
                <path
                  d="M82 145 Q78 170 95 175 Q112 180 110 195"
                  stroke="#0f766e"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="110" cy="197" r="4" fill="#0f766e" />
              </svg>
            </div>
          </div>

          {/* 右：checklist */}
          <div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <ul className="space-y-4">
                {expertChecklist.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
