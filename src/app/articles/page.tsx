'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { articles } from '@/data/articles';

const categories = ['全部', '抗疲劳', '深度睡眠', '免疫防护', '压力缓解', '营养科普'];

const categoryIcon: Record<string, string> = {
  '抗疲劳': '01',
  '深度睡眠': '02',
  '免疫防护': '03',
  '压力缓解': '04',
  '营养科普': '05',
};

const categoryCoverImage: Record<string, string> = {
  '免疫防护': '/images/articles-cover/article-immune.png',
  '深度睡眠': '/images/articles-cover/article-sleep.png',
  '营养科普': '/images/articles-cover/article-wellness.png',
};

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (activeCategory !== '全部') {
      result = result.filter((a) => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const showFeatured = activeCategory === '全部' && !searchQuery && filteredArticles.length > 0;

  return (
    <main className="min-h-screen bg-[#fafbfc]">
      {/* Hero — editorial style */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-teal-50/20 to-white px-6 lg:px-8 py-20 md:py-28">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-teal-100/30 blur-[100px]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-white/80 px-4 py-1.5 text-[13px] font-medium text-teal-700 backdrop-blur-sm shadow-sm mb-6">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            健康知识库
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            科学驱动的
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">健康洞察</span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            基于最新研究的健康科普文章，帮你做出明智的健康选择
          </p>

          {/* Search */}
          <div className="mt-8 mx-auto max-w-md relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-white text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            />
          </div>
        </div>
      </section>

      {/* Category tabs — sticky */}
      <section className="sticky top-16 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-[13px] font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="px-6 lg:px-8 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-24">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg mb-3">没有找到匹配的文章</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('全部'); }}
                className="text-teal-600 text-[14px] font-medium hover:text-teal-700 transition-colors"
              >
                查看全部文章
              </button>
            </div>
          ) : (
            <>
              {/* Featured article */}
              {showFeatured && (
                <Link
                  href={`/articles/${filteredArticles[0].slug}`}
                  className="group mb-12 block rounded-3xl bg-white border border-slate-200/80 overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-up"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div className="grid md:grid-cols-5">
                    <div className={`md:col-span-2 h-64 md:h-auto bg-gradient-to-br ${filteredArticles[0].coverColor} relative flex items-center justify-center min-h-[280px] overflow-hidden`}>
                      {categoryCoverImage[filteredArticles[0].category] ? (
                        <Image
                          src={categoryCoverImage[filteredArticles[0].category]}
                          alt={filteredArticles[0].category}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="text-white/10 text-[140px] font-black select-none leading-none">
                          {categoryIcon[filteredArticles[0].category] || '01'}
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-t ${filteredArticles[0].coverColor} opacity-40`} />
                      <div className="absolute top-6 left-6 z-10">
                        <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[12px] font-semibold text-slate-700">
                          {filteredArticles[0].category}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                      <span className="text-[13px] text-teal-600 font-semibold mb-3 tracking-wide">精选文章</span>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-teal-600 transition-colors tracking-tight leading-tight">
                        {filteredArticles[0].title}
                      </h2>
                      <p className="text-[15px] text-slate-500 mb-6 leading-relaxed line-clamp-3">{filteredArticles[0].excerpt}</p>
                      <div className="flex items-center gap-5 text-[13px] text-slate-400">
                        <span>{filteredArticles[0].publishedAt}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {filteredArticles[0].readTime}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          阅读全文
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showFeatured ? filteredArticles.slice(1) : filteredArticles).map((article, idx) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="group rounded-2xl bg-white border border-slate-200/80 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${Math.min(idx * 60, 360)}ms`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                  >
                    <div className={`h-44 bg-gradient-to-br ${article.coverColor} relative overflow-hidden`}>
                      {categoryCoverImage[article.category] ? (
                        <Image
                          src={categoryCoverImage[article.category]}
                          alt={article.category}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white/8 text-[100px] font-black select-none leading-none">
                            {categoryIcon[article.category] || '00'}
                          </div>
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-t ${article.coverColor} opacity-30`} />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-[17px] font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2 tracking-tight leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-[13px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-[12px] text-slate-400">
                        <span>{article.publishedAt}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter — minimal, premium */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">订阅健康周刊</h2>
            <p className="mt-3 text-[15px] text-slate-500">每周精选最新健康研究和实用建议，直达你的邮箱</p>
            <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="你的邮箱地址"
                className="flex-1 rounded-full border border-slate-200 px-5 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
              />
              <button
                type="submit"
                className="rounded-full bg-slate-900 text-white px-6 py-3 text-[14px] font-semibold hover:bg-slate-800 transition-all shadow-sm"
              >
                订阅
              </button>
            </form>
            <p className="mt-3 text-[12px] text-slate-400">随时可以退订，我们尊重你的隐私</p>
          </div>
        </div>
      </section>
    </main>
  );
}
