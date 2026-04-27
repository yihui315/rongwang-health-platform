import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ProductCategory } from '@/lib/data/products';
import AddToCartButton from '@/components/ui/AddToCartButton';
import ProductImageGallery from '@/components/ui/ProductImageGallery';
import { getProductBySlug, listProducts } from '@/lib/data/products';
import { getAiConsultHrefForValues, getSolutionHrefForValues } from '@/lib/health/consult-entry';
import type { PlanSlug } from '@/types';

const categoryLabel: Record<ProductCategory, string> = {
  vitamin: '维生素', mineral: '矿物质', herbal: '草本', probiotic: '益生菌',
  omega: '脂肪酸', amino: '氨基酸/蛋白', sleep: '助眠', adaptogen: '适应原',
  liver: '护肝', beauty: '美白抗衰', traditional: '传统名方',
};

const categoryGradient: Record<ProductCategory, string> = {
  vitamin: 'from-amber-400 to-orange-500', mineral: 'from-slate-400 to-slate-600',
  herbal: 'from-emerald-400 to-green-600', probiotic: 'from-pink-400 to-rose-500',
  omega: 'from-sky-400 to-blue-600', amino: 'from-violet-400 to-purple-600',
  sleep: 'from-indigo-400 to-violet-600', adaptogen: 'from-teal-400 to-emerald-600',
  liver: 'from-amber-500 to-orange-600', beauty: 'from-pink-400 to-rose-500',
  traditional: 'from-red-500 to-rose-700',
};

const brandInfo: Record<string, { short: string; color: string; desc: string }> = {
  'MISORILIFE': { short: 'MSR', color: 'bg-blue-600', desc: '现代生物科技' },
  '彭寿堂': { short: '彭寿堂', color: 'bg-red-700', desc: '百年传承名方' },
  '荣旺 · Vital': { short: 'Vital', color: 'bg-teal-600', desc: '基础营养' },
  '荣旺 · Night': { short: 'Night', color: 'bg-indigo-600', desc: '深度睡眠' },
  '荣旺 · Shield': { short: 'Shield', color: 'bg-cyan-600', desc: '免疫防护' },
  '荣旺 · Calm': { short: 'Calm', color: 'bg-purple-600', desc: '压力舒缓' },
  '荣旺 · Glow': { short: 'Glow', color: 'bg-pink-600', desc: '美丽焕肤' },
};

const badgeStyle: Record<string, string> = {
  '爆款': 'bg-red-500 text-white', '新品': 'bg-blue-500 text-white',
  '送礼': 'bg-amber-500 text-white', '限时': 'bg-emerald-500 text-white',
};

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const products = await listProducts();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const brand = brandInfo[product.brand] || { short: product.brand, color: 'bg-slate-600', desc: '' };
  const gradient = categoryGradient[product.category];
  const discount = Math.round((1 - product.memberPrice / product.price) * 100);
  const consultHref = getAiConsultHrefForValues(product.plans);
  const solutionHref = getSolutionHrefForValues(product.plans);

  const related = products
    .filter((p) => p.sku !== product.sku && p.plans.some((pl) => product.plans.includes(pl)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl text-sm text-slate-500">
          <Link href="/products" className="hover:text-teal-600">全部商品</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{product.name}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10">
          {/* Visual */}
          {product.images && product.images.length > 0 ? (
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              brandShort={brand.short}
              brandColor={brand.color}
              brandDesc={brand.desc}
              badge={product.badge}
              badgeStyle={product.badge ? badgeStyle[product.badge] : undefined}
            />
          ) : (
            <div className={`relative h-96 rounded-3xl bg-gradient-to-br ${gradient} p-8 text-white flex flex-col justify-between overflow-hidden`}>
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 blur-xl" />

              {/* Brand + Badge */}
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full ${brand.color} px-3 py-1.5 text-[12px] font-bold shadow-lg`}>
                    {brand.short}
                  </span>
                  {brand.desc && (
                    <span className="text-white/60 text-[12px]">{brand.desc}</span>
                  )}
                </div>
                {product.badge && (
                  <span className={`rounded-full px-3 py-1.5 text-[12px] font-bold shadow-lg ${badgeStyle[product.badge]}`}>
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="relative">
                <p className="text-white/70 text-sm mb-2">{product.englishName}</p>
                <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
                <p className="mt-3 text-white/80 text-sm italic">{product.tagline}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold">
                    {categoryLabel[product.category]}
                  </span>
                  {product.certifications.slice(0, 3).map((c) => (
                    <span key={c} className="rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Decorative letter */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.03] text-[200px] font-black select-none pointer-events-none">
                {product.brand.includes('MISORILIFE') ? 'M' : product.brand.includes('彭寿堂') ? '彭' : 'R'}
              </div>
            </div>
          )}

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-semibold">
                {product.sku}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-semibold">
                {product.origin}
              </span>
              {product.stock === 'in' && (
                <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  现货
                </span>
              )}
              {product.stock === 'low' && (
                <span className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
                  库存紧张
                </span>
              )}
              {product.matrix && (
                <span className="rounded-full bg-teal-100 text-teal-700 px-3 py-1 text-xs font-semibold">
                  {product.matrix}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
            <p className="mt-2 text-slate-600">{product.unit} · {product.servings} 份</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-slate-900">¥{product.memberPrice}</span>
              <span className="text-lg text-slate-400 line-through">¥{product.price}</span>
              <span className="rounded-full bg-red-100 text-red-600 px-2.5 py-0.5 text-xs font-bold">
                省 {discount}%
              </span>
            </div>

            {/* Shipping */}
            {product.shippingNote && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-100 px-4 py-3">
                <svg className="h-5 w-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <p className="text-teal-700 text-[13px] font-medium">{product.shippingNote}</p>
              </div>
            )}

            <ul className="mt-6 space-y-3">
              {product.hero.map((h) => (
                <li key={h} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 px-5 py-5">
              <p className="text-sm font-semibold text-teal-800">建议先完成 AI 评估</p>
              <p className="mt-2 text-sm leading-7 text-teal-700">
                先评估，再看方案，再决定是否进入购买入口。系统会先判断风险等级和支持方向，避免直接按商品做选择。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={consultHref}
                  className="btn-primary"
                >
                  先做 AI 评估
                </Link>
                <AddToCartButton
                  slug={product.plans[0] as PlanSlug}
                  name={product.name}
                  price={product.memberPrice}
                  className="rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                />
              </div>
              {solutionHref && (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  如果你已经明确问题方向，也可以先看
                  {' '}
                  <Link href={solutionHref} className="font-medium text-teal-700 hover:text-teal-800">
                    对应方案页
                  </Link>
                  。
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={consultHref}
                className="rounded-full border border-slate-300 bg-white py-4 px-6 font-semibold text-slate-700 hover:border-slate-400 flex items-center gap-2"
              >
                <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                返回 AI 评估入口
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="px-6 py-12 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">核心成分</h2>
          <p className="text-slate-500 mb-8">每份含量与作用机理</p>

          <div className="grid md:grid-cols-2 gap-4">
            {product.keyIngredients.map((ing) => (
              <div key={ing.name} className="rounded-2xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{ing.name}</h3>
                  <span className="rounded-full bg-teal-50 text-teal-700 px-3 py-1 text-xs font-semibold whitespace-nowrap">
                    {ing.dose}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{ing.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science + usage */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
            <div className="text-teal-300 text-sm font-semibold mb-3">科学依据</div>
            <h3 className="text-xl font-bold mb-4">为什么它有效？</h3>
            <p className="text-slate-200 leading-relaxed text-sm">{product.scientificBasis}</p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-8">
            <div className="text-teal-600 text-sm font-semibold mb-3">使用方法</div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">怎么吃</h3>
            <p className="text-slate-700 leading-relaxed text-sm mb-6">{product.howToUse}</p>
            {product.warnings.length > 0 && (
              <div className="rounded-xl bg-orange-50 border border-orange-200 p-4">
                <p className="text-orange-800 text-xs font-semibold mb-2">注意事项</p>
                <ul className="space-y-1">
                  {product.warnings.map((w) => (
                    <li key={w} className="text-xs text-orange-700">· {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-6 py-12 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">常与它搭配</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((r) => {
                const rBrand = brandInfo[r.brand] || { short: r.brand, color: 'bg-slate-600', desc: '' };
                return (
                  <Link
                    key={r.sku}
                    href={`/products/${r.slug}`}
                    className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    {/* Image or gradient */}
                    {r.images && r.images.length > 0 ? (
                      <div className="relative h-40 bg-white">
                        <Image
                          src={r.images[0]}
                          alt={r.name}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className={`h-40 bg-gradient-to-br ${categoryGradient[r.category]} flex items-center justify-center`}>
                        <span className="text-white/10 text-6xl font-black">
                          {r.brand.includes('MISORILIFE') ? 'M' : r.brand.includes('彭寿堂') ? '彭' : 'R'}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`rounded-full ${rBrand.color} px-2 py-0.5 text-[10px] font-bold text-white`}>
                          {rBrand.short}
                        </span>
                        {r.badge && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeStyle[r.badge]}`}>
                            {r.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-600 line-clamp-2 transition-colors">{r.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-2">{r.tagline}</p>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-lg font-bold text-slate-900">¥{r.memberPrice}</span>
                        <span className="text-xs text-slate-400 line-through">¥{r.price}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
