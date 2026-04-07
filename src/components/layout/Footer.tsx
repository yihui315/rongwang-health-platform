import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-6 pb-0 pt-16">
        <div className="mb-12 grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-3 text-xl font-bold text-white">荣旺健康</div>
            <p className="text-sm leading-relaxed">
              香港荣旺健康科技有限公司
              <br />
              AI驱动 · 全球精选保健品与OTC跨境直购平台
            </p>
            <div className="mt-5 flex gap-3">
              {["💬", "📱", "📕", "🎵"].map((icon) => (
                <span
                  key={icon}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-sm transition hover:bg-teal hover:text-white"
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">健康方案</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/plans/fatigue" className="transition hover:text-white hover:pl-1">抗疲劳组合</Link>
              <Link href="/plans/immune" className="transition hover:text-white hover:pl-1">免疫增强组合</Link>
              <Link href="/plans/sleep" className="transition hover:text-white hover:pl-1">睡眠改善组合</Link>
              <Link href="/plans/stress" className="transition hover:text-white hover:pl-1">压力缓解全套</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-white">关于荣旺</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/about" className="transition hover:text-white hover:pl-1">品牌故事</Link>
              <Link href="/quality" className="transition hover:text-white hover:pl-1">品质溯源</Link>
              <Link href="/reports" className="transition hover:text-white hover:pl-1">检测报告</Link>
              <Link href="/careers" className="transition hover:text-white hover:pl-1">加入我们</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-white">客户服务</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/quiz" className="transition hover:text-white hover:pl-1">AI健康顾问</Link>
              <Link href="/shipping" className="transition hover:text-white hover:pl-1">配送说明</Link>
              <Link href="/returns" className="transition hover:text-white hover:pl-1">退换货政策</Link>
              <Link href="/privacy" className="transition hover:text-white hover:pl-1">隐私政策</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 py-5 text-xs">
          <span>© 荣旺健康 2026 · 香港直邮 · 专注AI营养健康</span>
          <div className="flex flex-wrap gap-2">
            {["💳 Visa", "💳 Master", "🅿️ PayPal", "🍎 Apple Pay", "支付宝", "微信支付"].map(
              (pay) => (
                <span
                  key={pay}
                  className="rounded bg-white/5 px-2.5 py-1 text-xs"
                >
                  {pay}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
