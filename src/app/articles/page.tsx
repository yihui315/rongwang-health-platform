import Link from "next/link";

export default function ArticlesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-bold">健康百科</h1>
      <p className="mt-4 text-slate-500">内容中心首页占位。</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Link href="/articles/why-fatigue" className="rounded-2xl border bg-white p-5">
          为什么你总是疲劳？
        </Link>
        <Link href="/articles/why-sleep-bad" className="rounded-2xl border bg-white p-5">
          为什么你总是睡不好？
        </Link>
      </div>
    </main>
  );
}
