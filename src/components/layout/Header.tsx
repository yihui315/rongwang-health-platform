import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/98 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-teal">
            荣旺健康
          </Link>
          <span className="hidden border-l-2 border-slate-200 pl-4 text-sm text-slate-500 lg:inline">
            香港直邮 · AI营养方案
          </span>
        </div>

        <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="#scenes" className="transition hover:text-teal">
            健康方案
          </Link>
          <Link href="/quiz" className="transition hover:text-teal">
            AI检测
          </Link>
          <Link href="#plans" className="transition hover:text-teal">
            热门产品
          </Link>
          <Link href="/articles" className="transition hover:text-teal">
            健康百科
          </Link>
        </nav>

        <Link
          href="/quiz"
          className="rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange/30 transition hover:-translate-y-0.5 hover:bg-orange-light hover:shadow-xl"
        >
          立即AI检测
        </Link>
      </div>
    </header>
  );
}
