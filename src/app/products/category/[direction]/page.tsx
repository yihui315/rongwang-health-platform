/**
 * 1970 Uncle Darren's — 品类专辑页
 * 路由：/products/category/heart | bone | gut | brain
 * 展示：该品类下的单品 + 營養包套裝
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

const DIRECTION_CONFIG = {
  heart: {
    title: "心臟健康",
    subtitle: "心血管 · 辅酶Q10 · Omega3",
    description:
      "维护心血管健康，降低心臟疾病风险。1970 Uncle Darren's 心臟系列采用美国专利辅酶Q10原料，高吸收配方。",
    emoji: "❤️",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" className="w-5 h-5"><path d="M12 21C12 21 3 15 3 9C3 5.5 5.5 3 8.5 3C10.5 3 12 4.5 12 4.5C12 4.5 13.5 3 15.5 3C18.5 3 21 5.5 21 9C21 15 12 21 12 21Z"/></svg>`,
    gradient: "from-red-500 to-rose-600",
    lightBg: "bg-red-50",
    accent: "text-red-600",
    bgAccent: "bg-red-600",
    tags: ["辅酶Q10", "Omega3", "镁", "大蒜精"],
    badge: "心血管专家",
  },
  bone: {
    title: "骨骼健康",
    subtitle: "钙片 · 胶原蛋白 · 软骨素",
    description:
      "中老年骨骼养护专家。钙片+胶原蛋白+软骨素三重复合，全面维护骨密度和關節灵活性。",
    emoji: "🦴",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" className="w-5 h-5"><path d="M4 8h2v2H4V8zm14 0h2v2h-2V8zM8 4h2v2H8V4zm8 0h2v2h-2V4zM6 14h12v4H6v-4zm2 2v2h8v-2H8z"/></svg>`,
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50",
    accent: "text-emerald-600",
    bgAccent: "bg-emerald-600",
    tags: ["钙片", "胶原蛋白", "软骨素", "维生素D3"],
    badge: "骨骼养护",
  },
  gut: {
    title: "腸道健康",
    subtitle: "益生菌 · 膳食纤维 · 润肠通便",
    description:
      "调理肠胃，改善消化。15菌株复合益生菌+益生元组合，维护肠道微生态平衡。",
    emoji: "🌿",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0ea5e9" className="w-5 h-5"><path d="M17 8C17 8 10 4 7 8C4 12 5 18 12 19C12 14 14 10 17 8Z"/></svg>`,
    gradient: "from-sky-500 to-blue-600",
    lightBg: "bg-sky-50",
    accent: "text-sky-600",
    bgAccent: "bg-sky-600",
    tags: ["15菌株益生菌", "益生元", "膳食纤维", "消化酶"],
    badge: "肠道调理",
  },
  brain: {
    title: "腦力提升",
    subtitle: "DHA · PS · NMN · 记忆力",
    description:
      "提升脑力，改善记忆力。DHA藻油+磷脂酰丝氨酸+NMN组合，支援大脑健康和認知功能。",
    emoji: "🧠",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8b5cf6" className="w-5 h-5"><ellipse cx="12" cy="12" rx="8" ry="6" opacity="0.2"/><path d="M8 12C8 9 10 7 12 7C14 7 16 9 16 12C16 14 14 16 12 17" stroke="#8b5cf6" stroke-width="1.5" fill="none"/></svg>`,
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50",
    accent: "text-violet-600",
    bgAccent: "bg-violet-600",
    tags: ["DHA藻油", "PS磷脂酰丝氨酸", "NMN", "银杏叶"],
    badge: "脑力专家",
  },
} as const;

export type Direction = keyof typeof DIRECTION_CONFIG;

export async function generateStaticParams() {
  return Object.keys(DIRECTION_CONFIG).map((d) => ({ direction: d }));
}

export async function generateMetadata({ params }: Props) {
  const { direction } = await params;
  const config = DIRECTION_CONFIG[direction as Direction];
  if (!config) return {};
  const canonicalDir = direction === "heart" ? "heart" : direction === "bone" ? "bone" : direction === "gut" ? "gut" : "brain";
  return {
    title: `${config.title} | 1970 Uncle Darren's 恩科達倫`,
    description: config.description,
    alternates: {
      canonical: `https://rongwang.hk/products/category/${canonicalDir}`,
    },
    openGraph: {
      title: `${config.title} | 1970 Uncle Darren's 恩科達倫`,
      description: config.description,
      type: "website",
      locale: "zh_CN",
    },
  };
}

interface Props {
  params: Promise<{ direction: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { direction } = await params;

  if (!DIRECTION_CONFIG[direction as Direction]) {
    notFound();
  }

  const config = DIRECTION_CONFIG[direction as Direction];

  // 品类产品数据（静态，后续可对接数据库）
  const categoryProducts = getCategoryProducts(direction as Direction);
  const bundleProducts = getBundleProducts(direction as Direction);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} py-14 px-6`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white">首页</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white">全部商品</Link>
            <span>/</span>
            <span className="text-white">{config.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div dangerouslySetInnerHTML={{ __html: config.svgIcon || "" }} className="text-4xl flex-shrink-0" />
                <span className={`rounded-full ${config.lightBg} ${config.accent} px-3 py-1 text-xs font-bold`}>
                  {config.badge}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{config.title}</h1>
              <p className="mt-2 text-white/80 text-lg">{config.subtitle}</p>
              <p className="mt-3 max-w-xl text-white/70 text-sm leading-relaxed">
                {config.description}
              </p>
           </div>

            <div className="flex flex-wrap gap-2">
              {config.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* 營養包套裝优先展示 */}
        {bundleProducts.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">營養包套裝 · 28天持续补充</h2>
                <p className="mt-1 text-sm text-slate-500">单品组合更划算，每日一袋方便高效</p>
              </div>
              <span className={`rounded-full ${config.lightBg} ${config.accent} px-3 py-1 text-xs font-bold`}>
                套裝推薦
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {bundleProducts.map((bundle) => (
                <Link
                  key={bundle.slug}
                  href={bundle.href}
                  className="group relative flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all duration-300 overflow-hidden h-full"
                >
                  {/* Gender badge */}
                  <div className={`absolute top-0 right-0 ${config.bgAccent} text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl`}>
                    {bundle.gender === "male" ?"男士款" : "女士款"}
                  </div>

                  {/* Icon area */}
                  <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center ${config.lightBg}`}>
                    <div dangerouslySetInnerHTML={{ __html: config.svgIcon || "" }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                        {bundle.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{bundle.spec}</p>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {bundle.ingredients.join(" · ")}
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-900">¥{bundle.price}</span>
                      <span className="text-xs text-slate-400 line-through">¥{bundle.marketPrice}</span>
                      <span className={`rounded-full ${config.lightBg} ${config.accent} text-[10px] font-bold px-2 py-0.5`}>
                        省 {Math.round((1 - bundle.price / bundle.marketPrice) * 100)}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 单品 */}
        {categoryProducts.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">单品热卖</h2>
              <p className="mt-1 text-sm text-slate-500">精選原料，专利配方</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={product.href}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-lg transition-all duration-300 h-full"
                >
                  {/* Product image */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
                   <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">{product.category}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto pt-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-slate-900">¥{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">¥{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 信任条 */}
        <div className={`mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl ${config.lightBg} p-6`}>
          {[
            { svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#3b82f6" className="w-5 h-5"><path d="M10 2L13 7H18L14 11L15.5 17L10 14L4.5 17L6 11L2 7H7L10 2Z"/></svg>`, text: "美國原瓶進口" },
            { svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#8b5cf6" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="#8b5cf6" stroke-width="1.5" fill="none"/><path d="M7 10L9 12L13 8" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round"/></svg>`, text: "SGS第三方檢測" },
            { svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#10b981" className="w-5 h-5"><rect x="3" y="8" width="14" height="9" rx="1" stroke="#10b981" stroke-width="1.5" fill="none"/><path d="M7 8V6a3 3 0 016 0v2" stroke="#10b981" stroke-width="1.5"/></svg>`, text: "BASF原料直供" },
            { svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#f59e0b" className="w-5 h-5"><path d="M10 2L12 7H17L13 10L15 16L10 13L5 16L7 10L3 7H8L10 2Z" fill="#f59e0b"/></svg>`, text: "Darren博士配方" },
          ].map(({ svgIcon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <div dangerouslySetInnerHTML={{ __html: svgIcon }} />
              <span className="text-sm font-medium text-slate-700">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ============================================================
// 数据层（临时静态数据，后续接入产品数据库）
// ============================================================

interface ProductItem {
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  tags: string[];
  href: string;
  emoji: string;
  image: string;
}

interface BundleItem {
  slug: string;
  name: string;
  gender: "male" | "female";
  spec: string;
  ingredients: string[];
  price: number;
  marketPrice: number;
  href: string;
}

function getCategoryProducts(direction: Direction): ProductItem[] {
  const allProducts: Record<Direction, ProductItem[]> = {
    heart: [
      {
        slug: "uncle-darrens-heart-defender-men",
        name: "1970 Uncle Darren's 高含量辅酶Q10胶囊 心血管养护 美国进口专利原料",
        category: "心臟健康",
        price: 69,
        originalPrice: 199,
        tags: ["辅酶Q10 100mg", "心血管", "美国进口"],
        href: "/products/uncle-darrens-heart-defender-men",
        image: "/images/products/rw-coq10/main.jpg",
        emoji: "💊",
      },
      {
        slug: "uncle-darrens-heart-defender-women",
        name: "Omega3深海鱼油软胶囊 EPA+DHA 心脑血管健康",
        category: "心臟健康",
        price: 89,
        originalPrice: 220,
        tags: ["Omega3", "EPA+DHA", "心脑血管"],
        href: "/products/uncle-darrens-heart-defender-women",
        image: "/images/products/rw-omega3/main.jpg",
        emoji: "🐟",
      },
    ],
    bone: [
      {
        slug: "calcium-complex",
        name: "中老年钙片 胶原蛋白软骨素复合 骨质疏松调理",
        category: "骨骼健康",
        price: 89,
        originalPrice: 220,
        tags: ["钙片", "胶原蛋白", "软骨素"],
        href: "/products/calcium-complex",
        image: "/images/products/calcium-complex/main.jpg",
        emoji: "🦷",
      },
      {
        slug: "vitamin-d3",
        name: "维生素D3软胶囊 促進钙吸收 骨密度维护",
        category: "骨骼健康",
        price: 59,
        originalPrice: 150,
        tags: ["维生素D3", "促進钙吸收", "骨密度"],
        href: "/products/vitamin-d3",
        image: "/images/products/vitamin-d3/main.jpg",
        emoji: "☀️",
      },
      {
        slug: "collagen-tabs",
        name: "水解胶原蛋白肽片 關節软骨修复 皮肤弹性",
        category: "骨骼健康",
        price: 79,
        originalPrice: 199,
        tags: ["胶原蛋白", "關節修复", "软骨"],
        href: "/products/collagen-tabs",
        image: "/images/products/collagen-tabs/main.jpg",
        emoji: "💎",
      },
      {
        slug: "glucosamine",
        name: "葡萄糖胺软骨素片 膝關節润滑 屈伸自如",
        category: "骨骼健康",
        price: 98,
        originalPrice: 250,
        tags: ["葡萄糖胺", "软骨素", "關節"],
        href: "/products/glucosamine",
        image: "/images/products/glucosamine/main.jpg",
        emoji: "🦵",
      },
    ],
    gut: [
      {
        slug: "probiotic-15",
        name: "15菌株成人复合益生菌 调理肠胃 润肠通便",
        category: "腸道健康",
        price: 89,
        originalPrice: 199,
        tags: ["15菌株", "益生菌", "润肠"],
        href: "/products/probiotic-15",
        image: "/images/products/probiotic-15/main.jpg",
        emoji: "🦠",
      },
      {
        slug: "akks-probiotic",
        name: "AKK益生菌 改善代谢 抗衰老 肠道调理",
        category: "腸道健康",
        price: 126,
        originalPrice: 299,
        tags: ["AKK", "益生菌", "抗衰"],
        href: "/products/akk-probiotic",
        image: "/images/products/akk-probiotic/main.jpg",
        emoji: "🔬",
      },
      {
        slug: "fiber-complex",
        name: "复合膳食纤维粉 润肠通便 促進肠道蠕动",
        category: "腸道健康",
        price: 69,
        originalPrice: 160,
        tags: ["膳食纤维", "润肠", "益生元"],
        href: "/products/fiber-complex",
        image: "/images/products/fiber-complex/main.jpg",
        emoji: "🌾",
      },
      {
        slug: "digestive-enzyme",
        name: "消化酶胶囊 改善消化 减少胀气",
        category: "腸道健康",
        price: 79,
        originalPrice: 180,
        tags: ["消化酶", "胀气", "消化不良"],
        href: "/products/digestive-enzyme",
        image: "/images/products/digestive-enzyme/main.jpg",
        emoji: "💧",
      },
    ],
    brain: [
      {
        slug: "dha-ps",
        name: "DHA藻油+磷脂酰丝氨酸 补脑增记忆 成人腦力提升",
        category: "腦力提升",
        price: 79,
        originalPrice: 180,
        tags: ["DHA", "PS", "记忆力"],
        href: "/products/dha-ps",
        image: "/images/products/dha-ps/main.jpg",
        emoji: "🧠",
      },
      {
        slug: "nmn-60000",
        name: "NMN 60000 抗衰老 NAD+提升 美国进口原料",
        category: "腦力提升",
        price: 65,
        originalPrice: 180,
        tags: ["NMN", "抗衰老", "NAD+"],
        href: "/products/nmn-60000",
        image: "/images/products/nmn-60000/main.jpg",
        emoji: "🧬",
      },
      {
        slug: "ginkgo-biloba",
        name: "银杏叶提取物 改善记忆力 腦部血液循环",
        category: "腦力提升",
        price: 69,
        originalPrice: 160,
        tags: ["银杏叶", "记忆力", "脑循环"],
        href: "/products/ginkgo-biloba",
        image: "/images/products/ginkgo-biloba/main.jpg",
        emoji: "🍃",
      },
      {
        slug: "alpha-lipoic",
        name: "α-硫辛酸 抗氧化 保護神经细胞",
        category: "腦力提升",
        price: 89,
        originalPrice: 220,
        tags: ["硫辛酸", "抗氧化", "神经"],
        href: "/products/alpha-lipoic",
        image: "/images/products/alpha-lipoic/main.jpg",
        emoji: "⚡",
      },
    ],
  };

  return allProducts[direction] ?? [];
}

function getBundleProducts(direction: Direction): BundleItem[] {
  const allBundles: Record<Direction, BundleItem[]> = {
    heart: [
      {
        slug: "heart-male",
        name: "男士心臟健康营养包",
        gender: "male",
        spec: "28袋/盒 · 每日1袋",
        ingredients: ["辅酶Q10", "Omega3", "大蒜精", "镁"],
        price: 399,
        marketPrice: 699,
        href: "/products/bundles/heart-male",
      },
      {
        slug: "heart-female",
        name: "女士心臟健康营养包",
        gender: "female",
        spec: "28袋/盒 · 每日1袋",
        ingredients: ["辅酶Q10", "胶原蛋白", "铁", "B族"],
        price: 399,
        marketPrice: 699,
        href: "/products/bundles/heart-female",
      },
    ],
    bone: [
      {
        slug: "bone-male",
        name: "男士骨骼健康营养包",
        gender: "male",
        spec: "28袋/盒 · 每日1袋",
        ingredients: ["钙片", "胶原蛋白", "软骨素", "维生素D3"],
        price: 389,
        marketPrice: 699,
        href: "/products/bundles/bone-male",
      },
      {
        slug: "bone-female",
        name: "女士骨骼健康营养包",
        gender: "female",
        spec: "28袋/盒 · 每日1袋",
        ingredients: ["钙片", "胶原蛋白", "铁", "维生素D3"],
        price: 389,
        marketPrice: 699,
        href: "/products/bundles/bone-female",
      },
    ],
    gut: [
      {
        slug: "gut-male",
        name: "男士肠胃调理营养包",
        gender: "male",
        spec: "28袋/盒 · 每日1袋",
        ingredients: ["15菌株益生菌", "益生元", "膳食纤维", "消化酶"],
        price: 349,
        marketPrice: 599,
        href: "/products/bundles/gut-male",
      },
      {
        slug: "gut-female",
        name: "女士肠胃调理营养包",
        gender: "female",
        spec: "28袋/盒 · 每日1袋",
        ingredients: ["5大菌株", "益生元", "低聚果糖", "果蔬纤维"],
        price: 349,
        marketPrice: 599,
        href: "/products/bundles/gut-female",
      },
    ],
    brain: [
      {
        slug: "brain-male",
        name: "男士大脑活力营养包",
        gender: "male",
        spec: "28袋/盒 · 每日1袋",
        ingredients: ["DHA藻油", "PS磷脂酰丝氨酸", "NMN", "银杏叶"],
        price: 429,
        marketPrice: 799,
        href: "/products/bundles/brain-male",
      },
      {
        slug: "brain-female",
        name: "女士大脑活力营养包",
        gender: "female",
        spec: "28袋/盒 · 每日1袋",
        ingredients: ["DHA藻油", "胶原蛋白", "NMN", "B族"],
        price: 429,
        marketPrice: 799,
        href: "/products/bundles/brain-female",
      },
    ],
  };

  return allBundles[direction] ?? [];
}