import Link from "next/link";

const articles = [
  { title: "为什么你总是疲劳？", slug: "why-fatigue", category: "抗疲劳", gradient: "from-amber-400 to-orange-500" },
  { title: "为什么你总是睡不好？", slug: "why-sleep-bad", category: "深度睡眠", gradient: "from-indigo-400 to-violet-600" },
  { title: "换季为什么总容易不舒服？", slug: "why-immune-low", category: "免疫防护", gradient: "from-emerald-400 to-teal-600" },
  { title: "压力大时，身体会发生什么？", slug: "why-stress-body", category: "压力缓解", gradient: "from-rose-400 to-pink-600" },
];

export default function ContentSection() {
  return (
    <section className="py-20 md:py-24 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            科学解答你的健康困扰
          </h2>
          <p className="mt-3 text-lg text-slate-500">
            基于临床文献和营养学研究的深度科普
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {articles.map((article, idx) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group rounded-2xl bg-white border border-slate-200/80 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${idx * 80}ms`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              {/* Color header */}
              <div className={`h-2 bg-gradient-to-r ${article.gradient}`} />
              <div className="p-5">
                <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 mb-3">
                  {article.category}
                </span>
                <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-teal-600 transition-colors tracking-tight leading-snug">
                  {article.title}
                </h3>
                <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  阅读全文
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-600 hover:text-teal-600 transition-colors"
          >
            查看全部文章
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
