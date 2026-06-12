import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { articles as rawArticles, getArticleBySlug } from '@/data/articles';
import { getArticleBySlugWithFallback, getArticlesWithFallback } from '@/lib/cms';
import { generateArticleJsonLd, generateArticleMetadata } from '@/lib/seo';
import AddToCartButton from '@/components/ui/AddToCartButton';
import WeChatCTA from '@/components/ui/WeChatCTA';
import { plans } from '@/data/plans';
import { getAiConsultHrefForValue, getSolutionHrefForValue } from '@/lib/health/consult-entry';
import type { PlanSlug } from '@/types';

type PageProps = {
  params: Promise<{ slug: string }>;
};

// ISR disabled — articles checked directly from GEOFlow DB for accurate 404
// dynamicParams=false means unlisted slugs return a proper 404
export const revalidate = 0;
export const dynamicParams = false;

/**
 * 动态 SEO 元数据
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { article } = await getArticleBySlugWithFallback(slug);

  if (!article) {
    return { title: '文章未找到' };
  }

  return generateArticleMetadata(article);
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { article, source } = await getArticleBySlugWithFallback(slug);

  if (!article) notFound();

  // Get recommendation from raw articles.ts
  const rawArticle = getArticleBySlug(slug);
  const recommendation = rawArticle?.recommendation ?? null;

  // 获取相关文章
  const { articles: allArticles } = await getArticlesWithFallback({ per_page: 50 });
  const related = allArticles
    .filter((a) => a.slug !== slug && a.category_name === article.category_name)
    .slice(0, 2);
  const otherArticles = related.length < 2
    ? [...related, ...allArticles.filter((a) => a.slug !== slug && !related.some(r => r.slug === a.slug)).slice(0, 2 - related.length)]
    : related;

  const relatedPlan = article.relatedPlan
    ? plans.find((p) => p.slug === article.relatedPlan)
    : null;
  const relatedPlanConsultHref = relatedPlan ? getAiConsultHrefForValue(relatedPlan.slug) : '/ai-consult';
  const relatedPlanSolutionHref = relatedPlan ? getSolutionHrefForValue(relatedPlan.slug) : null;

  // JSON-LD 结构化数据
  const jsonLd = generateArticleJsonLd(article);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cover — editorial hero */}
      <div className={`relative bg-gradient-to-br ${article.coverColor || 'from-teal-400 to-emerald-600'} overflow-hidden`}>
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-1.5 text-[13px] font-semibold text-slate-700 shadow-sm">
              {article.category_name}
            </span>
            {source === 'cms' && (
              <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-white/90">
                AI 生成
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-[2.75rem] font-bold text-white mb-6 leading-[1.15] tracking-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span className="font-medium text-white/90">{article.author_name}</span>
            <span className="hidden sm:inline">·</span>
            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.read_time || '5分钟'}阅读
            </span>
          </div>
        </div>
        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-[2rem]" />
      </div>

      <article className="mx-auto max-w-3xl px-6 py-8 md:py-12">
        {/* Excerpt */}
        {article.excerpt && (
          <div className="mb-12 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-teal-400 to-emerald-400" />
            <p className="text-xl text-slate-600 leading-relaxed font-medium pl-6 italic">
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Article body */}
        {article.sections && article.sections.length > 0 ? (
          <div className="space-y-10">
            {article.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{section.heading}</h2>
                <p className="text-slate-700 leading-relaxed text-lg">{section.content}</p>

                {section.highlight && (
                  <div className="mt-6 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{section.highlight.icon}</span>
                      <div>
                        <h4 className="font-bold text-teal-900 mb-1.5 text-[15px]">{section.highlight.title}</h4>
                        <p className="text-teal-700 leading-relaxed text-[15px]">{section.highlight.text}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* CMS 文章 — HTML 正文 */
          <div
            className="cms-article max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        {/* Disclaimer */}
        <div className="mt-14 flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200/80 px-5 py-4">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            本文仅供健康科普参考，不构成医疗建议。如有健康问题请咨询专业医师。文章内容基于公开发表的科学研究整理。
          </p>
        </div>

        {/* Product recommendation from article data */}
        {recommendation && (
          <div className="mt-10 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 md:p-8">
            <div className="flex items-start gap-3 mb-5">
              <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-700">
                荣旺精選
              </span>
              <div>
                {recommendation.planSlug ? (
                  <a href={`/solutions/${recommendation.planSlug}`} className="block hover:opacity-80 transition">
                    <h3 className="text-lg font-bold text-slate-900">{recommendation.title}</h3>
                  </a>
                ) : (
                  <h3 className="text-lg font-bold text-slate-900">{recommendation.title}</h3>
                )}
                <p className="text-sm text-slate-500">{recommendation.subtitle}</p>
              </div>
            </div>
            <p className="text-[15px] text-slate-600 leading-relaxed mb-6">
              {recommendation.reason}
            </p>
            <div className="space-y-3">
              {recommendation.products.map((product) => (
                <div
                  key={product.sku}
                  className="flex items-center justify-between rounded-xl bg-white border border-amber-100 px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">¥</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-800 leading-tight">{product.name}</p>
                      <p className="text-[12px] text-slate-500">{product.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-amber-600">¥{product.price}</span>
                    <a
                      href="https://mobile.yangkeduo.com/mall_page.html?mall_id=516573367"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 text-[12px] font-semibold transition"
                    >
                      咨询购买
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {recommendation.planSlug && (
              <div className="mt-4 pt-4 border-t border-amber-100 flex gap-3">
                <a
                  href={`/solutions/${recommendation.planSlug}`}
                  className="flex-1 text-center rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-700 px-4 py-2.5 text-[13px] font-semibold transition"
                >
                  瀏覽完整方案 →
                </a>
                <a
                  href="/ai-consult"
                  className="flex-1 text-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-[13px] font-semibold transition"
                >
                  做AI評估匹配 →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Related plan CTA */}
        {relatedPlan && (
          <div className="mt-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium mb-3">
                  推薦方案
                </span>
                <h3 className="text-2xl font-bold mb-2">{relatedPlan.name}</h3>
                <p className="text-teal-100 mb-2">{relatedPlan.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {relatedPlan.ingredients.slice(0, 4).map((ing) => (
                    <span key={ing} className="rounded-full bg-white/15 px-3 py-1 text-xs">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <span className="text-3xl font-bold">¥{relatedPlan.price}/月</span>
                <Link
                  href={relatedPlanConsultHref}
                  className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                >
                  先做 AI 评估
                </Link>
                {relatedPlanSolutionHref ? (
                  <Link href={relatedPlanSolutionHref} className="text-sm text-teal-100 hover:text-white">
                    查看问题方案 →
                  </Link>
                ) : null}
                <AddToCartButton
                  slug={relatedPlan.slug as PlanSlug}
                  name={relatedPlan.name}
                  price={relatedPlan.price}
                  className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                />
                <Link href={relatedPlanSolutionHref ?? relatedPlanConsultHref} className="text-sm text-teal-100 hover:text-white">
                  查看详情 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* No related plan — generic quiz CTA */}
        {!relatedPlan && (
          <div className="mt-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">想了解适合你的方案？</h3>
            <p className="text-teal-100 mb-6">3分钟AI测验，获得个性化健康建议</p>
            <Link
              href="/ai-consult"
              className="inline-block rounded-full bg-white text-teal-600 px-6 py-3 font-semibold hover:bg-teal-50 transition"
            >
              开始测验 →
            </Link>
          </div>
        )}

        {/* 顾问微信入口 */}
        <section className="mt-10 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block rounded-full bg-orange-400/20 px-3 py-1 text-xs font-semibold text-orange-700 mb-3">
                顾问支援
              </span>
              <h2 className="text-xl font-bold text-slate-900">看完还有疑问？顾问来帮你判断</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                不知道自己适不适合文中的产品组合？扫描二维码，顾问根据你的具体情况推薦适合的剂型和服用周期。免费判断，不强制购买。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/ai-consult" className="btn-primary">
                  先做AI評估
                </Link>
                <a
                  href="https://u.wechat.com/E/rongwanghealth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  添加顾问微信
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <WeChatCTA
                title="扫码添加健康顾问"
                description="领取專屬方案，1对1指导"
                cardMode={false}
              />
            </div>
          </div>
        </section>
      </article>

      {/* Related articles */}
      <section className="px-6 py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">相关阅读</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {otherArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition flex"
              >
                <div className={`w-32 md:w-40 bg-gradient-to-br ${a.coverColor || 'from-teal-400 to-emerald-600'} flex-shrink-0 flex items-center justify-center`}>
                  <span className="text-white/20 text-6xl font-black">{(a.category_name || '').charAt(0)}</span>
                </div>
                <div className="p-5 flex-1">
                  <span className="text-xs font-semibold text-teal-600">{a.category_name}</span>
                  <h3 className="mt-1 font-bold text-slate-900 group-hover:text-teal-600 line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">{a.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * 静态参数生成 — 构建时预渲染已知文章
 * 新的 CMS 文章通过 ISR 动态生成
 */
export function generateStaticParams() {
  return rawArticles.map((article) => ({ slug: article.slug }));
}
