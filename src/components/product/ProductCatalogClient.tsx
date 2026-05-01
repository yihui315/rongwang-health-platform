"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { Product, ProductCategory } from "@/lib/data/products";
import { getAiConsultHrefForValue } from "@/lib/health/consult-entry";
import { solutionGuides } from "@/lib/health/solutions";
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

const matrixCards = [
  {
    id: "liver",
    title: "应酬与恢复支持",
    subtitle: "面向熬夜、应酬、恢复慢等场景，建议先完成风险评估。",
  },
  {
    id: "beauty",
    title: "都市女性内调",
    subtitle: "关注气色、周期、睡眠和压力状态，先做女性健康方向评估。",
  },
  {
    id: "cardio",
    title: "长辈日常养护",
    subtitle: "面向家庭健康管理和送礼场景，优先查看注意事项与适配方向。",
  },
];

type FilterMode = "all" | "matrix" | ProductCategory;
type SortKey = "default" | "price-asc" | "price-desc" | "name";

interface ProductCatalogClientProps {
  products: Product[];
}

export function ProductCatalogClient({ products }: ProductCatalogClientProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("default");

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort((a, b) => a.localeCompare(b, "zh")),
    [products],
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let result = [...products];

    if (filterMode === "matrix") {
      result = result.filter((product) => product.matrix);
    } else if (filterMode !== "all") {
      result = result.filter((product) => product.category === filterMode);
    }

    if (brandFilter !== "all") {
      result = result.filter((product) => product.brand === brandFilter);
    }

    if (normalizedQuery) {
      result = result.filter((product) =>
        [product.name, product.englishName, product.brand, product.origin, categoryLabel[product.category]]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    if (sortBy === "price-asc") result.sort((left, right) => left.memberPrice - right.memberPrice);
    if (sortBy === "price-desc") result.sort((left, right) => right.memberPrice - left.memberPrice);
    if (sortBy === "name") result.sort((left, right) => left.name.localeCompare(right.name, "zh"));

    return result;
  }, [brandFilter, filterMode, products, searchQuery, sortBy]);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <section className="bg-gradient-cta text-white">
        <div className="section-container grid gap-10 py-14 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-18">
          <div>
            <span className="badge bg-white/10 text-white ring-1 ring-white/20">
              先评估后查看
            </span>
            <h1 className="mt-5 max-w-3xl text-balance">
              先确认健康方向，再查看对应商品
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              这里保留真实商品图片和基础信息，但主要转化路径仍然是AI评估。若你不确定适合什么，请先完成评估，再进入对应方案。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ai-consult" className="btn-primary">
                先做AI评估
              </Link>
              <Link href="/solutions/sleep" className="btn-ghost">
                查看健康方案
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/15 bg-white/10">
            <Image
              src="/images/visual-v2/trust-shipping.webp"
              alt="跨境健康产品服务"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#183531]/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-4 text-[var(--text-primary)] backdrop-blur">
              <p className="text-sm font-semibold">购买前确认</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                先看风险提示、用药和过敏信息，再决定是否进入购买入口。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="section-container py-10">
          <div className="grid gap-4 md:grid-cols-3">
            {matrixCards.map((matrix) => (
              <Link
                key={matrix.id}
                href={getAiConsultHrefForValue(matrix.id)}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-5 hover:border-[var(--border)]"
              >
                <p className="text-sm font-semibold text-[var(--teal-dark)]">评估方向</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{matrix.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{matrix.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-[var(--border-subtle)] bg-[rgba(255,253,248,0.92)] backdrop-blur-xl">
        <div className="section-container py-4">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="搜索商品、品牌或方向"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--ring-focus)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--ring-focus)]"
              >
                <option value="all">全部品牌</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--ring-focus)]"
              >
                <option value="default">默认排序</option>
                <option value="price-asc">价格从低到高</option>
                <option value="price-desc">价格从高到低</option>
                <option value="name">按名称</option>
              </select>
              <span className="whitespace-nowrap text-sm tabular-nums text-[var(--text-muted)]">
                {filteredProducts.length} 件
              </span>
            </div>
          </div>

          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            <FilterButton active={filterMode === "all"} onClick={() => setFilterMode("all")}>
              全部
            </FilterButton>
            <FilterButton active={filterMode === "matrix"} onClick={() => setFilterMode("matrix")}>
              核心矩阵
            </FilterButton>
            {categories.map((category) => (
              <FilterButton
                key={category}
                active={filterMode === category}
                onClick={() => setFilterMode(category)}
              >
                {categoryLabel[category]}
              </FilterButton>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container py-12 md:py-14">
        <div className="mb-8 grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <span className="badge-teal">评估优先</span>
            <h2 className="mt-4 text-[var(--text-primary)]">按问题进入方案</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {solutionGuides.slice(0, 6).map((guide) => (
              <Link
                key={guide.slug}
                href={`/assessment/${guide.slug}`}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-sm hover:border-[var(--border)]"
              >
                <p className="font-semibold text-[var(--teal-dark)]">{guide.shortTitle}</p>
                <p className="mt-1 text-[var(--text-secondary)]">{guide.eyebrow}</p>
              </Link>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-20 text-center">
            <p className="text-lg text-[var(--text-secondary)]">没有找到匹配商品</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterMode("all");
                setBrandFilter("all");
                setSortBy("default");
              }}
              className="mt-4 text-sm font-semibold text-[var(--teal-dark)]"
            >
              清除筛选条件
            </button>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </section>
    </main>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
        active
          ? "bg-[var(--surface-strong)] text-white"
          : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:bg-[#ebe4d9]"
      }`}
    >
      {children}
    </button>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const consultHref = getAiConsultHrefForValue(product.plans[0]);
  const image = product.images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm hover:border-[var(--border)]"
    >
      <div className="relative h-48 bg-white">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--surface-muted)] text-4xl font-bold text-[var(--text-muted)]">
            {product.brand.slice(0, 1)}
          </div>
        )}
        {product.badge ? (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            {product.brand}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryTone[product.category]}`}>
            {categoryLabel[product.category]}
          </span>
        </div>
        <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-[var(--text-primary)] group-hover:text-[var(--teal-dark)]">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
          适配方向：{product.plans.map((plan) => planLabel[plan] ?? plan).join(" / ")}。建议先完成评估再进入购买入口。
        </p>
        {product.shippingNote ? (
          <p className="mt-2 text-xs font-medium text-[var(--teal-dark)]">{product.shippingNote}</p>
        ) : null}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[var(--text-primary)]">¥{product.memberPrice}</span>
              <span className="text-xs text-[var(--text-muted)] line-through">¥{product.price}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{product.unit} / {product.origin}</p>
          </div>
          <span className="rounded-lg bg-[#e8f5f1] px-3 py-2 text-xs font-semibold text-[var(--teal-dark)]">
            查看
          </span>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          不确定方向？先去
          <span className="font-semibold text-[var(--teal-dark)]"> AI评估 </span>
          再选择。
        </p>
        <span className="sr-only">建议入口：{consultHref}</span>
      </div>
    </Link>
  );
}
