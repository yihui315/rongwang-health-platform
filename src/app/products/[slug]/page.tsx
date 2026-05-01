import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ProductCategory } from "@/lib/data/products";
import AddToCartButton from "@/components/ui/AddToCartButton";
import ProductImageGallery from "@/components/ui/ProductImageGallery";
import { getProductBySlug, listProducts } from "@/lib/data/products";
import { getAiConsultHrefForValues, getSolutionHrefForValues } from "@/lib/health/consult-entry";
import type { PlanSlug } from "@/types";

const categoryLabel: Record<ProductCategory, string> = {
  vitamin: "维生素",
  mineral: "矿物质",
  herbal: "草本",
  probiotic: "益生菌",
  omega: "脂肪酸",
  amino: "氨基酸",
  sleep: "睡眠支持",
  adaptogen: "压力支持",
  liver: "应酬支持",
  beauty: "内调养护",
  traditional: "传统名方",
};

const categoryTone: Record<ProductCategory, string> = {
  vitamin: "bg-amber-50 text-amber-700",
  mineral: "bg-slate-100 text-slate-700",
  herbal: "bg-emerald-50 text-emerald-700",
  probiotic: "bg-pink-50 text-pink-700",
  omega: "bg-sky-50 text-sky-700",
  amino: "bg-violet-50 text-violet-700",
  sleep: "bg-indigo-50 text-indigo-700",
  adaptogen: "bg-teal-50 text-teal-700",
  liver: "bg-orange-50 text-orange-700",
  beauty: "bg-rose-50 text-rose-700",
  traditional: "bg-red-50 text-red-700",
};

const planLabel: Record<PlanSlug, string> = {
  fatigue: "疲劳恢复",
  sleep: "睡眠支持",
  immune: "免疫支持",
  stress: "压力舒缓",
  liver: "应酬恢复",
  beauty: "内调养护",
  cardio: "长辈养护",
};

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((product) => ({ slug: product.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const products = await listProducts();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const consultHref = getAiConsultHrefForValues(product.plans);
  const solutionHref = getSolutionHrefForValues(product.plans);
  const related = products
    .filter((item) => item.sku !== product.sku && item.plans.some((plan) => product.plans.includes(plan)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface)] px-5 py-4">
        <div className="mx-auto max-w-6xl text-sm text-[var(--text-secondary)]">
          <Link href="/products" className="hover:text-[var(--teal-dark)]">商品库</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--text-primary)]">{product.name}</span>
        </div>
      </div>

      <section className="px-5 py-10 md:py-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          {product.images && product.images.length > 0 ? (
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              brandShort={product.brand}
              brandColor="bg-slate-900"
              brandDesc={product.origin}
              badge={product.badge}
              badgeStyle="bg-slate-900 text-white"
            />
          ) : (
            <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]">
              <Image
                src="/images/visual-v2/trust-report.webp"
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                {product.sku}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryTone[product.category]}`}>
                {categoryLabel[product.category]}
              </span>
              <span className="rounded-full bg-[#e8f5f1] px-3 py-1 text-xs font-semibold text-[var(--teal-dark)]">
                {product.origin}
              </span>
            </div>

            <h1 className="text-balance text-[var(--text-primary)]">{product.name}</h1>
            <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
              真实包装与基础规格保留展示，适配建议以AI评估结果和专业人士意见为准。
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              该商品保留为方案后的信息入口。购买前建议先完成AI评估，确认风险等级、用药情况、过敏史和适配方向。
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.plans.map((plan) => (
                <span key={plan} className="badge-teal">
                  {planLabel[plan] ?? plan}
                </span>
              ))}
              {product.certifications.slice(0, 3).map((certification) => (
                <span key={certification} className="badge-slate">
                  {certification}
                </span>
              ))}
            </div>

            <div className="mt-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold text-[var(--text-muted)]">会员参考价</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-[var(--text-primary)]">¥{product.memberPrice}</span>
                <span className="text-lg text-[var(--text-muted)] line-through">¥{product.price}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{product.unit} / {product.servings}份</p>
              {product.shippingNote ? (
                <p className="mt-3 rounded-lg bg-[#e8f5f1] px-4 py-3 text-sm font-medium text-[var(--teal-dark)]">
                  {product.shippingNote}
                </p>
              ) : null}
            </div>

            <div className="mt-6 rounded-lg border border-[#ead7c6] bg-[#fff7ed] p-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">建议先完成AI评估</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                系统会先判断风险等级和支持方向。若识别到较高风险信号，应优先线下咨询医生或药师，而不是直接购买。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={consultHref} className="btn-primary">
                  先做AI评估
                </Link>
                {solutionHref ? (
                  <Link href={solutionHref} className="btn-secondary">
                    查看对应方案
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <AddToCartButton
                slug={product.plans[0] as PlanSlug}
                name={product.name}
                price={product.memberPrice}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
              />
              <Link href="/ai-consult" className="btn-secondary">
                返回评估入口
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)] px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 max-w-2xl">
            <span className="badge-teal">基础信息</span>
            <h2 className="mt-4 text-[var(--text-primary)]">基础信息与注意事项</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              以下内容用于了解配方和使用边界，不构成医学建议。正在服药、孕期、哺乳期或有慢性病史时，请先咨询专业人士。
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">主要成分</h3>
              <div className="mt-4 grid gap-3">
                {product.keyIngredients.map((ingredient) => (
                  <div key={ingredient.name} className="rounded-lg bg-[var(--surface-muted)] px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-[var(--text-primary)]">{ingredient.name}</p>
                      <span className="text-sm text-[var(--text-secondary)]">{ingredient.dose}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">使用边界</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                不同产品的用量和使用时机请以包装标签、客服说明和专业人士建议为准。若正在服药、备孕、孕期、哺乳期、未成年人或有慢性病史，请先咨询医生或药师。
              </p>
              {product.warnings.length > 0 ? (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">注意事项</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                    {product.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="px-5 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">相关商品</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.sku}
                  href={`/products/${item.slug}`}
                  className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-[var(--border)]"
                >
                  <div className="relative h-40 bg-white">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-semibold text-[var(--teal-dark)]">{item.brand}</p>
                    <h3 className="mt-2 line-clamp-2 font-semibold text-[var(--text-primary)]">{item.name}</h3>
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">¥{item.memberPrice}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
