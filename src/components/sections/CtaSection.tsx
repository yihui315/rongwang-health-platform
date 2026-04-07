import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-24">
      {/* Glow effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,200,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          别再猜了
          <br />
          让AI告诉你缺什么
        </h2>
        <p className="mt-4 text-base text-white/50">
          加入52,847位用户，获取专属营养方案
        </p>
        <Link
          href="/quiz"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-teal/30 transition hover:-translate-y-1 hover:bg-teal-dark"
        >
          🧬 免费AI检测 →
        </Link>
        <p className="mt-5 text-xs text-white/25">
          🔒 绝不发送垃圾邮件 · 随时退订
        </p>
      </div>
    </section>
  );
}
