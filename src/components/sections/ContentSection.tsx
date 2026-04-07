import Link from "next/link";

const articles = [
  {
    title: "为什么你总是疲劳？90%的人不知道的营养真相",
    slug: "why-fatigue",
    tag: "疲劳 · 成分解析",
    desc: "持续性疲劳不是因为你懒，而是细胞能量工厂缺乏关键辅酶。本文从根源解读疲劳机制。",
    icon: "😫",
    gradient: "from-amber-100 to-yellow-50",
    date: "2026-03-28",
    views: "12,380"
  },
  {
    title: "维生素D缺乏怎么办？正确补充方式全解析",
    slug: "vitamin-d-guide",
    tag: "选购指南",
    desc: "全球超10亿人缺乏维D。缺乏维D与免疫下降、情绪低落直接相关，但90%的人补充方式是错的。",
    icon: "💊",
    gradient: "from-blue-100 to-blue-50",
    date: "2026-03-25",
    views: "8,920"
  },
  {
    title: "肠道菌群与免疫力：益生菌选错了等于白吃",
    slug: "gut-immune",
    tag: "免疫 · 专家专栏",
    desc: "70%免疫细胞在肠道，但市面80%的益生菌活菌到达率不足1%。如何选到真正有效的？",
    icon: "🧬",
    gradient: "from-pink-100 to-pink-50",
    date: "2026-03-20",
    views: "6,540"
  }
];

export default function ContentSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            健康百科 · 科学解答你的困扰
          </h2>
          <p className="mt-3 text-slate-500">基于临床文献，每周更新</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div
                className={`flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${article.gradient} text-5xl`}
              >
                {article.icon}
              </div>
              <div className="p-6">
                <div className="mb-2 text-xs font-bold text-teal">
                  {article.tag}
                </div>
                <h3 className="text-base font-bold leading-snug">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {article.desc}
                </p>
                <div className="mt-4 flex gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
                  <span>{article.date}</span>
                  <span>{article.views} 阅读</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
