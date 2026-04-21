'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { products, ProductCategory } from '@/data/products';

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
  'MISORILIFE': 'bg-blue-600',
  '彭寿堂': 'bg-red-700',
  '荣旺 · Vital': 'bg-teal-600',
  '荣旺 · Night': 'bg-indigo-600',
  '荣旺 · Shield': 'bg-cyan-600',
  '荣旺 · Calm': 'bg-purple-600',
  '荣旺 · Glow': 'bg-pink-600',
};

const badgeStyle: Record<string, string> = {
  '爆款': 'bg-red-500 text-white',
  '新品': 'bg-blue-500 text-white',
  '送礼': 'bg-amber-500 text-white',
  '限时': 'bg-emerald-500 text-white',
};

// 三大矩阵定义
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

export default function ProductsPage() {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

  const brands = useMemo(() => [...new Set(products.map(p => p.brand))], []);
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], []);

  // 核心矩阵产品
  const matrixProducts = useMemo(() => {
    return matrices.map(m => ({
      ...m,
      products: products.filter(p => p.matrix && p.plans.includes(m.id as 'liver' | 'beauty' | 'cardio')),
    }));
  }, []);

  // 筛选后的产品
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filterMode === 'matrix') {
      result = result.filter(p => p.matrix);
    } else if (filterMode !== 'all') {
      result = result.filter(p => p.category === filterMode);
    }

    if (brandFilter !== 'all') {
      result = result.filter(p => p.brand === brandFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.englishName.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.memberPrice - b.memberPrice); break;
      case 'price-desc': result.sort((a, b) => b.memberPrice - a.memberPrice); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name, 'zh')); break;
    }

    return result;
  }, [filterMode, brandFilter, searchQuery, sortBy]);

  const showMatrixView = filterMode === 'all' && brandFilter === 'all' && !searchQuery.trim() && sortBy === 'default';

  return (
    <main className="min-h-screen bg-[#fafbfc]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-6 lg:px-8 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.04]" />
        <div className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-rose-500/10 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] font-medium text-teal-300 backdrop-blur-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            MISORILIFE + 彭寿堂 · 双品牌矩阵
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight max-w-2xl">
            科学配方 × 百年传承，
            <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">品质直达</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-xl leading-relaxed">
            三大核心爆款矩阵，覆盖商务护肝、女性抗衰、银发养生。香港跨境直邮 / 保税仓直发。
          </p>

          {/* 品牌标识 */}
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 backdrop-blur-sm">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">MSR</div>
              <div>
                <p className="text-white text-[13px] font-semibold">MISORILIFE</p>
                <p className="text-white/50 text-[11px]">现代生物科技</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 backdrop-blur-sm">
              <div className="h-8 w-8 rounded-full bg-red-700 flex items-center justify-center text-white text-[10px] font-bold">彭</div>
              <div>
                <p className="text-white text-[13px] font-semibold">彭寿堂</p>
                <p className="text-white/50 text-[11px]">百年传承名方</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section className="sticky top-16 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-80">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="搜索产品名称、品牌..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
              />
            </div>

            <div className="flex gap-3 items-center">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
              >
                <option value="all">全部品牌</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
              >
                <option value="default">默认排序</option>
                <option value="price-asc">价格从低到高</option>
                <option value="price-desc">价格从高到低</option>
                <option value="name">按名称</option>
              </select>
              <span className="text-[13px] text-slate-400 tabular-nums whitespace-nowrap">
                {filteredProducts.length} 件
              </span>
            </div>
          </div>

          {/* Filter pills */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            <button
              onClick={() => setFilterMode('all')}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                filterMode === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterMode('matrix')}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                filterMode === 'matrix' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              核心矩阵
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterMode(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                  filterMode === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {categoryLabel[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 矩阵展示 (默认视图) */}
      {showMatrixView && (
        <section className="px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl space-y-16">
            {matrixProducts.map((m) => (
              <div key={m.id}>
                {/* Matrix header */}
                <div className={`rounded-2xl bg-gradient-to-r ${m.gradient} p-6 md:p-8 mb-6`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{m.icon}</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">{m.title}</h2>
                      </div>
                      <p className="text-white/80 text-[14px]">{m.subtitle}</p>
                      <p className="text-white/60 text-[13px] mt-1">{m.audience}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-white text-[13px] font-medium">
                        {m.products.length} 款产品
                      </span>
                    </div>
                  </div>
                </div>

                {/* Matrix products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {m.products.map((p) => (
                    <ProductCard key={p.sku} product={p} />
                  ))}
                </div>
              </div>
            ))}

            {/* 通用引流产品 */}
            <div>
              <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">🛡️</span>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">通用健康 · OTC引流</h2>
                    </div>
                    <p className="text-white/80 text-[14px]">建立信任 · 增加搜索曝光 · 低门槛引流</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.filter(p => !p.matrix).map(p => (
                  <ProductCard key={p.sku} product={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 筛选/搜索视图 */}
      {!showMatrixView && (
        <section className="px-6 lg:px-8 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg mb-3">没有找到匹配的商品</p>
                <button
                  onClick={() => { setSearchQuery(''); setFilterMode('all'); setBrandFilter('all'); setSortBy('default'); }}
                  className="text-teal-600 text-[14px] font-medium hover:text-teal-700"
                >
                  清除筛选条件
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map(p => (
                  <ProductCard key={p.sku} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 物流说明 */}
      <section className="px-6 lg:px-8 py-12 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                <svg className="h-7 w-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">香港跨境直邮</h3>
              <p className="text-[13px] text-slate-500">沙头角保税仓发货，7-15个工作日送达</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                <svg className="h-7 w-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">正品保障</h3>
              <p className="text-[13px] text-slate-500">MISORILIFE + 彭寿堂独家授权代理</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                <svg className="h-7 w-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">会员专享价</h3>
              <p className="text-[13px] text-slate-500">注册会员立享全场优惠，最高省20%</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ───────────── Product Card Component ───────────── */

function ProductCard({ product: p }: { product: typeof products[0] }) {
  return (
    <Link
      href={`/products/${p.slug}`}
      className="group rounded-2xl bg-white border border-slate-200/80 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image area */}
      <div className={`relative h-48 ${p.images && p.images.length > 0 ? 'bg-white' : `bg-gradient-to-br ${categoryColor[p.category]}`} overflow-hidden`}>
        {/* Brand badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className={`rounded-full ${brandColor[p.brand] || 'bg-slate-600'} px-3 py-1 text-[11px] font-bold text-white shadow-sm`}>
            {p.brand.includes('MISORILIFE') ? 'MSR' : p.brand.includes('彭寿堂') ? '彭寿堂' : p.brand.split(' · ')[1] || p.brand}
          </span>
        </div>

        {/* Badge (爆款/新品/送礼) */}
        {p.badge && (
          <div className="absolute top-4 right-4 z-10">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${badgeStyle[p.badge] || 'bg-slate-500 text-white'}`}>
              {p.badge}
            </span>
          </div>
        )}

        {/* Real product image or gradient fallback */}
        {p.images && p.images.length > 0 ? (
          <>
            <Image
              src={p.images[0]}
              alt={p.name}
              fill
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent z-10">
              <p className="text-[11px] text-slate-400 font-medium">{categoryLabel[p.category]}</p>
              <h3 className="text-[15px] font-bold text-slate-900 mt-0.5 line-clamp-1 leading-snug">{p.name}</h3>
            </div>
          </>
        ) : (
          <>
            {/* Product info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/50 to-transparent z-10">
              <p className="text-[11px] text-white/70 font-medium">{categoryLabel[p.category]}</p>
              <h3 className="text-[17px] font-bold text-white mt-0.5 line-clamp-2 drop-shadow-sm leading-snug">{p.name}</h3>
            </div>
            {/* Decorative */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 text-[120px] font-black select-none">
              {p.brand.includes('MISORILIFE') ? 'M' : p.brand.includes('彭寿堂') ? '彭' : 'R'}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[13px] text-slate-500 line-clamp-2 min-h-[36px] leading-relaxed">{p.tagline}</p>

        {/* Shipping note */}
        {p.shippingNote && (
          <p className="mt-2 text-[11px] text-teal-600 font-medium flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            {p.shippingNote}
          </p>
        )}

        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 tracking-tight">¥{p.memberPrice}</span>
              <span className="text-[12px] text-slate-400 line-through">¥{p.price}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{p.unit} · {p.origin}</p>
          </div>
          <span className="rounded-full bg-slate-100 p-2 text-slate-500 group-hover:bg-teal-600 group-hover:text-white transition-all">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
