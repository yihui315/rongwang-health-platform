'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import type { Product, ProductCategory } from '@/lib/data/products';
import { getAiConsultHrefForValue } from '@/lib/health/consult-entry';
import { solutionGuides } from '@/lib/health/solutions';

const categoryLabel: Record<ProductCategory, string> = {
  vitamin: '维生素',
  mineral: '矿物质',
  herbal: '草本',
  probiotic: '益生菌',
  omega: '脂肪酸',
  amino: '氨基酸/蛋白',
  sleep: '助眠',
  adaptogen: '适应原',
  liver: '护肝',
  beauty: '美白抗衰',
  traditional: '传统名方',
};

const categoryColor: Record<ProductCategory, string> = {
  vitamin: 'from-amber-400 to-orange-500',
  mineral: 'from-slate-400 to-slate-600',
  herbal: 'from-emerald-400 to-green-600',
  probiotic: 'from-pink-400 to-rose-500',
  omega: 'from-sky-400 to-blue-600',
  amino: 'from-violet-400 to-purple-600',
  sleep: 'from-indigo-400 to-violet-600',
  adaptogen: 'from-teal-400 to-emerald-600',
  liver: 'from-amber-500 to-orange-600',
  beauty: 'from-pink-400 to-rose-500',
  traditional: 'from-red-500 to-rose-700',
};

const brandColor: Record<string, string> = {
  MISORILIFE: 'bg-blue-600',
  彭寿堂: 'bg-red-700',
  '荣旺 · Vital': 'bg-teal-600',
  '荣旺 · Night': 'bg-indigo-600',
  '荣旺 · Shield': 'bg-cyan-600',
  '荣旺 · Calm': 'bg-purple-600',
  '荣旺 · Glow': 'bg-pink-600',
};

const badgeStyle: Record<string, string> = {
  爆款: 'bg-red-500 text-white',
  新品: 'bg-blue-500 text-white',
  送礼: 'bg-amber-500 text-white',
  限时: 'bg-emerald-500 text-white',
};

const matrices = [
  {
    id: 'liver',
    title: '商务精英 · 应酬护肝',
    subtitle: '释酒解酒 → 灵芝孢子油 → 牛樟芝 | 复购率极高',
    icon: '🍷',
    gradient: 'from-amber-500 to-orange-600',
    audience: '商务男士 · 频繁应酬 · 加班熬夜',
  },
  {
    id: 'beauty',
    title: '都市女性 · 内调抗衰',
    subtitle: 'AKK代谢激活 → 东阿贡胶 → NAD+焕白 | 社交裂变',
    icon: '✨',
    gradient: 'from-pink-500 to-rose-600',
    audience: '25-45岁女性 · 减肥抗衰 · 美白养颜',
  },
  {
    id: 'cardio',
    title: '银发养生 · 心脑调理',
    subtitle: '桑黄丸 → 金钗石斛 → NMN | 送礼佳品',
    icon: '🫀',
    gradient: 'from-red-500 to-rose-700',
    audience: '45+中老年 · 三高调理 · 子女送礼',
  },
];

type FilterMode = 'all' | 'matrix' | ProductCategory;
type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name';

interface ProductCatalogClientProps {
  products: Product[];
}

export function ProductCatalogClient({ products }: ProductCatalogClientProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort((a, b) => a.localeCompare(b, 'zh')),
    [products],
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products],
  );

  const matrixProducts = useMemo(
    () =>
      matrices.map((matrix) => ({
        ...matrix,
        products: products.filter(
          (product) => product.matrix && product.plans.some((plan) => plan === matrix.id),
        ),
      })),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let result = [...products];

    if (filterMode === 'matrix') {
      result = result.filter((product) => product.matrix);
    } else if (filterMode !== 'all') {
      result = result.filter((product) => product.category === filterMode);
    }

    if (brandFilter !== 'all') {
      result = result.filter((product) => product.brand === brandFilter);
    }

    if (normalizedQuery) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.englishName.toLowerCase().includes(normalizedQuery) ||
          product.tagline.toLowerCase().includes(normalizedQuery) ||
          product.brand.toLowerCase().includes(normalizedQuery),
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((left, right) => left.memberPrice - right.memberPrice);
    }

    if (sortBy === 'price-desc') {
      result.sort((left, right) => right.memberPrice - left.memberPrice);
    }

    if (sortBy === 'name') {
      result.sort((left, right) => left.name.localeCompare(right.name, 'zh'));
    }

    return result;
  }, [brandFilter, filterMode, products, searchQuery, sortBy]);

  const showMatrixView =
    filterMode === 'all' &&
    brandFilter === 'all' &&
    !searchQuery.trim() &&
    sortBy === 'default';

  return (
    <main className="min-h-screen bg-[#fafbfc]">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-6 py-20 lg:px-8 md:py-24">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.04]" />
        <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] font-medium text-teal-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            商品库已降权保留，建议先评估后购买
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
            科学配方与传统名方，先匹配健康方向再查看商品
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            商品列表继续服务明确需求的用户；如果还不确定方向，请先完成 AI 健康评估，确认风险等级、生活建议和适合的调理方向。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ai-consult" className="btn-primary">
              立即开始 AI 评估
            </Link>
            <Link href="/solutions/sleep" className="btn-secondary">
              先看问题方案
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fbfb_0%,#ffffff_46%,#fff7ed_100%)] p-6 shadow-sm md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <span className="badge-teal">AI-first 导购</span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                  先做 AI 评估，再看商品库
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600">
                  产品信息保留为兼容路径，但主转化链路已经收口到 AI 评估。先看风险和方案，再决定是否进入购买入口，会更稳妥。
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">
                  按问题进入 assessment / solutions
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {solutionGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/assessment/${guide.slug}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                    >
                      <p className="text-sm font-medium text-teal-700">{guide.shortTitle}</p>
                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {guide.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {guide.eyebrow}
                      </p>
                      <p className="mt-4 text-sm font-medium text-slate-800">
                        进入评估页 →
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="搜索产品名称、品牌..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-[14px] text-slate-900 transition-all placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="all">全部品牌</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="default">默认排序</option>
                <option value="price-asc">价格从低到高</option>
                <option value="price-desc">价格从高到低</option>
                <option value="name">按名称</option>
              </select>
              <span className="whitespace-nowrap text-[13px] tabular-nums text-slate-400">
                {filteredProducts.length} 件
              </span>
            </div>
          </div>

          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
            <FilterButton active={filterMode === 'all'} onClick={() => setFilterMode('all')}>
              全部
            </FilterButton>
            <FilterButton active={filterMode === 'matrix'} onClick={() => setFilterMode('matrix')}>
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

      {showMatrixView ? (
        <section className="px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-16">
            {matrixProducts.map((matrix) => (
              <div key={matrix.id}>
                <div className={`mb-6 rounded-2xl bg-gradient-to-r ${matrix.gradient} p-6 md:p-8`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-3xl">{matrix.icon}</span>
                        <h2 className="text-2xl font-bold text-white md:text-3xl">{matrix.title}</h2>
                      </div>
                      <p className="text-[14px] text-white/80">{matrix.subtitle}</p>
                      <p className="mt-1 text-[13px] text-white/60">{matrix.audience}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={getAiConsultHrefForValue(matrix.id)}
                        className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                      >
                        先做这类评估
                      </Link>
                      <span className="rounded-full bg-white/20 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-sm">
                        {matrix.products.length} 款产品
                      </span>
                    </div>
                  </div>
                </div>

                <ProductGrid products={matrix.products} />
              </div>
            ))}

            <div>
              <div className="mb-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white md:text-3xl">通用健康 · OTC 引流</h2>
                    <p className="mt-1 text-[14px] text-white/80">建立信任 · 增加搜索曝光 · 低门槛引流</p>
                  </div>
                </div>
              </div>
              <ProductGrid products={products.filter((product) => !product.matrix)} dense />
            </div>
          </div>
        </section>
      ) : (
        <section className="px-6 py-12 lg:px-8 md:py-16">
          <div className="mx-auto max-w-7xl">
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="mb-3 text-lg text-slate-500">没有找到匹配的商品</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterMode('all');
                    setBrandFilter('all');
                    setSortBy('default');
                  }}
                  className="text-[14px] font-medium text-teal-600 hover:text-teal-700"
                >
                  清除筛选条件
                </button>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} dense />
            )}
          </div>
        </section>
      )}

      <section className="border-t border-slate-200 bg-white px-6 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <TrustItem title="香港跨境直邮" text="沙头角保税仓发货，7-15 个工作日送达" />
          <TrustItem title="正品保障" text="MISORILIFE + 彭寿堂授权代理，信息以页面披露为准" />
          <TrustItem title="会员专享价" text="保留旧购买路径，但建议先完成 AI 评估" />
        </div>
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
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
        active ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function ProductGrid({ products, dense = false }: { products: Product[]; dense?: boolean }) {
  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${dense ? 'xl:grid-cols-4' : ''}`}>
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const brandBadge = product.brand.includes('MISORILIFE')
    ? 'MSR'
    : product.brand.includes('彭寿堂')
      ? '彭寿堂'
      : product.brand.split(' · ')[1] || product.brand;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={`relative h-48 overflow-hidden ${product.images?.length ? 'bg-white' : `bg-gradient-to-br ${categoryColor[product.category]}`}`}>
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
          <span className={`rounded-full ${brandColor[product.brand] || 'bg-slate-600'} px-3 py-1 text-[11px] font-bold text-white shadow-sm`}>
            {brandBadge}
          </span>
        </div>

        {product.badge ? (
          <div className="absolute right-4 top-4 z-10">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${badgeStyle[product.badge] || 'bg-slate-500 text-white'}`}>
              {product.badge}
            </span>
          </div>
        ) : null}

        {product.images?.length ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white via-white/90 to-transparent p-4">
              <p className="text-[11px] font-medium text-slate-400">{categoryLabel[product.category]}</p>
              <h3 className="mt-0.5 line-clamp-1 text-[15px] font-bold leading-snug text-slate-900">{product.name}</h3>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-5">
              <p className="text-[11px] font-medium text-white/70">{categoryLabel[product.category]}</p>
              <h3 className="mt-0.5 line-clamp-2 text-[17px] font-bold leading-snug text-white drop-shadow-sm">{product.name}</h3>
            </div>
            <div className="absolute left-1/2 top-1/2 select-none text-[120px] font-black text-white/5 -translate-x-1/2 -translate-y-1/2">
              {product.brand.includes('MISORILIFE') ? 'M' : product.brand.includes('彭寿堂') ? '彭' : 'R'}
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <p className="min-h-[36px] line-clamp-2 text-[13px] leading-relaxed text-slate-500">{product.tagline}</p>
        {product.shippingNote ? (
          <p className="mt-2 text-[11px] font-medium text-teal-600">{product.shippingNote}</p>
        ) : null}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">¥{product.memberPrice}</span>
              <span className="text-[12px] text-slate-400 line-through">¥{product.price}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">{product.unit} · {product.origin}</p>
          </div>
          <span className="rounded-full bg-slate-100 p-2 text-slate-500 transition-all group-hover:bg-teal-600 group-hover:text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function TrustItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
        <svg className="h-7 w-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      </div>
      <h3 className="mb-1 font-bold text-slate-900">{title}</h3>
      <p className="text-[13px] text-slate-500">{text}</p>
    </div>
  );
}
