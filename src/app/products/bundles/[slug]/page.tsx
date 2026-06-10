/**
 * 1970 Uncle Darren's 營養包套裝详情页
 * 路由：/products/bundles/[slug]
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { bundleDetails, allBundleSlugs } from "@/lib/data/bundles";

export async function generateStaticParams() {
  return allBundleSlugs.map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const bundle = bundleDetails[slug];
  if (!bundle) return {};
  return {
    title: `${bundle.name} | 1970 Uncle Darren's 恩科達倫`,
    description: `${bundle.tagline} 1970 Uncle Darren's 恩科達倫男女分开配方，科学配比。`,
    alternates: {
      canonical: `https://rongwang.hk/products/bundles/${slug}`,
    },
    openGraph: {
      title: `${bundle.name} | 1970 Uncle Darren's 恩科達倫`,
      description: `${bundle.tagline} 1970 Uncle Darren's 恩科達倫男女分开配方，科学配比。`,
      type: "website",
      locale: "zh_CN",
    },
  };
}

const genderLabel = { male: "男士款", female: "女士款" };
const categoryPath = { heart: "heart", bone: "bone", gut: "gut", brain: "brain" };

const accentColors: Record<string, string> = {
  red: "text-red-600",
  pink: "text-pink-600",
  purple: "text-purple-600",
  blue: "text-blue-600",
  green: "text-emerald-600",
  teal: "text-teal-600",
};

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  const bundle = bundleDetails[slug];

  if (!bundle) notFound();

  const discount = Math.round((1 - bundle.price / bundle.marketPrice) * 100);
  const accentClass = accentColors[bundle.accent.split("-")[0]] ?? "text-slate-600";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl text-sm text-slate-500">
          <Link href="/" className="hover:text-teal-600">首页</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-teal-600">全部商品</Link>
          <span className="mx-2">/</span>
          <Link href={`/products/category/${categoryPath[bundle.category]}`} className="hover:text-teal-600">
            {categoryPath[bundle.category] === "heart" ? "心臟健康" :
             categoryPath[bundle.category] === "bone" ? "骨骼健康" :
             categoryPath[bundle.category] === "gut" ? "腸道健康" : "腦力提升"}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{bundle.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${bundle.gradient} py-14 px-6`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Left: info */}
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-5xl">{bundle.emoji}</span>
                <div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white mr-2">
                    {genderLabel[bundle.gender]}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    28天疗程
                  </span>
                </div>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-white">{bundle.name}</h1>
              <p className="mt-3 text-white/80 text-lg leading-relaxed">{bundle.tagline}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {bundle.ingredients.map((ing) => (
                  <span key={ing.name} className="rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: pricing card */}
            <div className="lg:w-80 rounded-2xl bg-white p-6 shadow-2xl">
              <div className="text-xs text-slate-500 font-medium mb-2">{bundle.spec}</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-slate-900">¥{bundle.price}</span>
                <span className="text-sm text-slate-400 line-through">¥{bundle.marketPrice}</span>
              </div>
              <div className="text-sm text-slate-500 mb-4">
                每天约 ¥{(bundle.price / bundle.courseDays).toFixed(1)} 元，比单独购买省 ¥{bundle.marketPrice - bundle.price}
              </div>
              <div className="rounded-full bg-red-500 text-white text-xs font-bold px-3 py-1.5 inline-block mb-6">
                限時优惠 省 {discount}%
              </div>

              <div className="space-y-3">
                <Link
                  href="/shop"
                  className="block w-full rounded-full bg-red-600 py-4 text-center font-bold text-white hover:bg-red-700 transition-colors"
                >
                  立即購買
                </Link>
                <Link
                  href={`/products/category/${categoryPath[bundle.category]}`}
                  className="block w-full rounded-full border border-slate-300 bg-white py-3.5 text-center font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  查看更多同类产品
                </Link>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> 美國原瓶進口
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> 正规报关单+检验检疫证明
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> 防伪标签可查，扫码验真
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> 7天无理由退货（未开封）
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* 成分配方 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-1">配方成分</h2>
          <p className="text-sm text-slate-500 mb-6">四重复合配方，协同作用</p>
          <div className="grid md:grid-cols-2 gap-4">
            {bundle.ingredients.map((ing, i) => (
              <div key={ing.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="mr-2 text-lg font-bold text-slate-900">{ing.name}</span>
                    <span className="rounded-full bg-red-50 text-red-600 px-2.5 py-0.5 text-xs font-bold">
                      {ing.dose}
                    </span>
                  </div>
                  <span className={`${bundle.accent} text-xs font-semibold mt-0.5`}>
                    {i + 1}号成分
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{ing.role}</p>
                <p className="text-xs text-slate-400 italic">原料来源：{ing.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 使用方法 & 适宜人群 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold text-slate-900 mb-3">服用方法</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{bundle.howToUse}</p>
           <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2">💡 小贴士</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                营养補充剂不是药物，效果需要积累。建议坚持服用一个完整療程（{bundle.courseDays === 28 ? "3个月（12盒）" : "6个月（26盒）"}）再评估效果。
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold text-slate-900 mb-3">适宜人群</h3>
            <ul className="space-y-2">
              {bundle.targetUsers.map((user) => (
                <li key={user} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-green-500 flex-shrink-0">✓</span>
                  {user}
                </li>
              ))}
            </ul>
            {bundle.contraindications.length > 0 && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-xs font-semibold text-red-800 mb-2">⚠️ 禁忌人群</p>
                <ul className="space-y-1">
                  {bundle.contraindications.map((c) => (
                    <li key={c} className="text-xs text-red-700">· {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 用戶評價 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">真实用戶評價</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {bundle.testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.meta}</p>
                  </div>
                </div>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        {/* 相关套裝 */}
        {bundle.relatedBundles.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">你可能还需要</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bundle.relatedBundles.map((relatedSlug) => {
                const related = bundleDetails[relatedSlug];
                if (!related) return null;
                return (
                  <Link
                    key={relatedSlug}
                    href={`/products/bundles/${relatedSlug}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${related.gradient} text-2xl ${related.lightBg}`}>
                      {related.emoji}
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {related.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">{related.tagline.slice(0, 20)}...</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-slate-900">¥{related.price}</span>
                      <span className="text-xs text-slate-400 line-through">¥{related.marketPrice}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 免责声明 */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-800 mb-2">健康教育声明</h3>
          <p className="text-sm text-amber-700 leading-relaxed">
            本文内容仅作健康教育目的，不构成医学诊断、治疗建议或处方。营养补充剂不能替代药物或医生的专业治疗。
            如有具体健康问题，请优先咨询医生或专业医疗人员。跨境营养补充剂的使用效果因人而异，购买前建议结合自身情况或咨询顾问确认。
          </p>
        </div>
      </div>
    </main>
  );
}