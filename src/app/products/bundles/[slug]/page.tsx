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

const genderLabel: Record<string, string> = { male: "男士款", female: "女士款" };
const categoryLabel: Record<string, string> = {
  heart: "心臟健康",
  bone: "骨骼健康",
  gut: "腸道健康",
  brain: "腦力提升",
};
const categoryPath: Record<string, string> = {
  heart: "heart",
  bone: "bone",
  gut: "gut",
  brain: "brain",
};

/** Accent color palette keyed on the bundle accent prefix */
const accentColor: Record<string, string> = {
  red: "text-red-600",
  pink: "text-pink-600",
  purple: "text-purple-600",
  blue: "text-blue-600",
  green: "text-emerald-600",
  teal: "text-teal-600",
};

const bgAccentColor: Record<string, string> = {
  red: "bg-red-600",
  pink: "bg-pink-600",
  purple: "bg-purple-600",
  blue: "bg-blue-600",
  green: "bg-emerald-600",
  teal: "bg-teal-600",
};

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  const bundle = bundleDetails[slug];

  if (!bundle) notFound();

  const discount = Math.round((1 - bundle.price / bundle.marketPrice) * 100);
  const accentClass = accentColor[bundle.accent] ?? "text-slate-600";
  const bgAccentClass = bgAccentColor[bundle.bgAccent] ?? "bg-slate-600";
  const hasHeroImage = Boolean(bundle.heroImage);

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl text-sm text-slate-500">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            首页
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-teal-600 transition-colors">
            全部商品
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/products/category/${categoryPath[bundle.category]}`}
            className="hover:text-teal-600 transition-colors"
          >
            {categoryLabel[bundle.category]}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">{bundle.name}</span>
        </div>
      </div>

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative bg-slate-50 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col lg:flex-row lg:items-center gap-10">
            {/* Left: product image */}
            <div className="relative lg:w-1/2">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                {bundle.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bundle.image}
                    alt={bundle.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-7xl">{bundle.emoji}</span>
                  </div>
                )}
                {/* Gender badge overlay */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`rounded-full ${bgAccentClass} px-3 py-1 text-xs font-bold text-white shadow-sm`}
                  >
                    {genderLabel[bundle.gender]}
                  </span>
                </div>
                {/* Course badge */}
                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {bundle.courseDays}天疗程
                  </span>
                </div>
              </div>

              {/* Hero image strip (if heroImage differs from main image) */}
              {hasHeroImage && bundle.heroImage !== bundle.image && (
                <div className="mt-3 overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bundle.heroImage}
                    alt={`${bundle.name} 细节图`}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Right: info + pricing */}
            <div className="flex-1">
              {/* English name */}
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                {bundle.englishName}
              </p>

              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {bundle.name}
              </h1>
              <p className="mt-3 text-lg text-slate-600 leading-relaxed">
                {bundle.tagline}
              </p>

              {/* Ingredient pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {bundle.ingredients.map((ing) => (
                  <span
                    key={ing.name}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {ing.name}
                  </span>
                ))}
              </div>

              {/* Pricing card */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-xs text-slate-500 font-medium mb-2">
                  {bundle.spec}
                </div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl font-bold text-slate-900">
                    ¥{bundle.price}
                  </span>
                  <span className="text-base text-slate-400 line-through">
                    ¥{bundle.marketPrice}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mb-5">
                  每天约 ¥{(bundle.price / bundle.courseDays).toFixed(1)} 元，比单独购买节省 ¥
                  {bundle.marketPrice - bundle.price}
                </div>

                {/* Discount tag */}
                <div
                  className={`inline-block rounded-full ${bgAccentClass} text-white text-xs font-bold px-3 py-1.5 mb-6`}
                >
                  限时优惠 · 省 {discount}%
                </div>

                {/* CTA buttons */}
                <div className="space-y-3">
                  <Link
                    href="/shop"
                    className={`block w-full rounded-full ${bgAccentClass} py-4 text-center font-bold text-white hover:opacity-90 transition-opacity`}
                  >
                    立即购买
                  </Link>
                  <Link
                    href={`/products/category/${categoryPath[bundle.category]}`}
                    className="block w-full rounded-full border border-slate-300 bg-white py-3.5 text-center font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    查看更多同类产品
                  </Link>
                </div>

                {/* Trust highlights */}
                <ul className="mt-5 space-y-2">
                  {[
                    "美國原瓶進口",
                    "正规报关单+检验检疫证明",
                    "防伪标签可查，扫码验真",
                    "7天无理由退货（未开封）",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className={`${accentClass} flex-shrink-0`}>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-14">
        {/* ── Ingredient Science Section ─────────────────────────── */}
        {(bundle.scienceHeadline || bundle.scienceBody) && (
          <section>
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                成分科技
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                {bundle.scienceHeadline ?? "科学配方背后的原理"}
              </h2>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Science narrative */}
              {bundle.scienceBody && (
                <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-slate-50 p-7">
                  <p className="text-slate-700 leading-relaxed text-[15px]">
                    {bundle.scienceBody}
                  </p>
                </div>
              )}

              {/* Ingredient detail cards */}
              <div
                className={`lg:col-span-${bundle.scienceBody ? "2" : "5"} grid sm:grid-cols-2 gap-4`}
              >
                {bundle.ingredients.map((ing, i) => (
                  <div
                    key={ing.name}
                    className="rounded-xl border border-slate-100 bg-white p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-base font-bold text-slate-900">
                          {ing.name}
                        </span>
                        <span
                          className={`ml-2 rounded-full ${bgAccentClass} px-2 py-0.5 text-xs font-bold text-white`}
                        >
                          {ing.dose}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400 mt-1">
                        #{i + 1}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{ing.role}</p>
                    <p className="text-xs text-slate-400 italic">
                      原料来源：{ing.source}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Trust / Certification Badges ───────────────────────── */}
        {bundle.certBadges && bundle.certBadges.length > 0 && (
          <section className="rounded-2xl border border-slate-100 bg-slate-50 px-8 py-8">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              品质认证
            </h2>
            <div className="flex flex-wrap gap-4">
              {bundle.certBadges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2"
                >
                  <span className={`${accentClass} flex-shrink-0`}>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 0039c0 5.591 3.824 10.29 911.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Ingredient Formula (if no science section) ───────────── */}
        {!bundle.scienceHeadline && !bundle.scienceBody && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              配方成分
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              四重复合配方，协同作用
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {bundle.ingredients.map((ing, i) => (
                <div
                  key={ing.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-slate-900">
                        {ing.name}
                      </span>
                      <span
                        className={`rounded-full ${bgAccentClass} px-2.5 py-0.5 text-xs font-bold text-white`}
                      >
                        {ing.dose}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 mt-1">
                      #{i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{ing.role}</p>
                  <p className="text-xs text-slate-400 italic">
                    原料来源：{ing.source}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Usage & Target Users ───────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              服用方法
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {bundle.howToUse}
            </p>
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2">
                服用提示
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                营养补充剂不是药物，效果需要积累。建议坚持服用一个完整疗程
                （{bundle.courseDays === 28 ? "3个月（12盒）" : "6个月（26盒）"}）
                再评估效果。
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              适宜人群
            </h3>
            <ul className="space-y-2">
              {bundle.targetUsers.map((user) => (
                <li
                  key={user}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <span className={`${accentClass} mt-0.5 flex-shrink-0`}>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  {user}
                </li>
              ))}
            </ul>
            {bundle.contraindications.length > 0 && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-xs font-semibold text-red-800 mb-2">
                  禁忌人群
                </p>
                <ul className="space-y-1">
                  {bundle.contraindications.map((c) => (
                    <li key={c} className="text-xs text-red-700">
                      · {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── User Testimonials ────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            真实用户评价
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {bundle.testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${bgAccentClass} text-sm font-bold text-white`}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.meta}</p>
                  </div>
                </div>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Related Bundles ─────────────────────────────────────── */}
        {bundle.relatedBundles.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              你可能还需要
            </h2>
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
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                      {related.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={related.image}
                          alt={related.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-3xl">{related.emoji}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {related.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                      {related.tagline}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-slate-900">
                        ¥{related.price}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ¥{related.marketPrice}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Disclaimer ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-800 mb-2">健康教育声明</h3>
          <p className="text-sm text-amber-700 leading-relaxed">
            本文内容仅作健康教育目的，不构成医学诊断、治疗建议或处方。
            营养补充剂不能替代药物或医生的专业治疗。如有具体健康问题，请优先咨询医生或专业医疗人员。
            跨境营养补充剂的使用效果因人而异，购买前建议结合自身情况或咨询顾问确认。
          </p>
        </div>
      </div>
    </main>
  );
}