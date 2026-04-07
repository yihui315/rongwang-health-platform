import Link from "next/link";

export default function FloatingButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <span className="hidden rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-lg md:block">
        免费AI检测
      </span>
      <Link
        href="/quiz"
        className="animate-pulse-slow flex h-14 w-14 items-center justify-center rounded-full bg-orange text-2xl text-white shadow-lg shadow-orange/40 transition hover:scale-110"
        aria-label="免费AI检测"
      >
        🧬
      </Link>
    </div>
  );
}
