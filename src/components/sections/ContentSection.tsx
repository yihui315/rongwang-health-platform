import Link from "next/link";

const articles = [
  { title: "为什么你总是疲劳？", slug: "why-fatigue" },
  { title: "为什么你总是睡不好？", slug: "why-sleep-bad" },
  { title: "换季为什么总容易不舒服？", slug: "why-immune-low" },
  { title: "压力大时，身体会发生什么？", slug: "why-stress-body" }
];

export default function ContentSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">科学解答你的健康困扰</h2>
          <p className="mt-3 text-slate-500">
            基于临床文献和营养学研究，帮助你更好理解健康问题
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-lg font-semibold">{article.title}</div>
              <div className="mt-4 text-sm text-teal">阅读全文 →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
