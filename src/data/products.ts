/**
 * 荣旺健康 · SKU 产品数据库
 *
 * Uncle Darren's approved storefront products only
 *
 * 免责：本内容仅为产品信息展示，不构成医疗建议。
 */

import type { PlanSlug } from '@/types';
import { approvedStorefrontProducts } from './approved-storefront-products';

export type ProductCategory =
  | 'vitamin'
  | 'mineral'
  | 'herbal'
  | 'probiotic'
  | 'omega'
  | 'amino'
  | 'sleep'
  | 'adaptogen'
  | 'liver'
  | 'beauty'
  | 'traditional';

export type ProductTier = 'hero' | 'profit' | 'traffic';

export interface Product {
  sku: string;
  slug: string;
  name: string;
  englishName: string;
  brand: string;
  brandLogo?: string;
  category: ProductCategory;
  plans: PlanSlug[];
  price: number;
  memberPrice: number;
  costPrice?: number;      // 供货价（内部参考）
  unit: string;
  servings: number;
  origin: string;
  tagline: string;
  tier: ProductTier;       // hero=引流爆款, profit=高利润主推, traffic=客单提升
  matrix?: string;         // 所属矩阵名称
  hero: string[];
  keyIngredients: Array<{
    name: string;
    dose: string;
    benefit: string;
  }>;
  scientificBasis: string;
  howToUse: string;
  warnings: string[];
  certifications: string[];
  stock: 'in' | 'low' | 'out';
  badge?: string;          // 角标：'爆款' | '限时' | '新品' | '送礼'
  shippingNote?: string;   // 物流说明
  images?: string[];       // 产品图片路径列表
  officialUrl?: string;    // 品牌官网链接
  pddUrl?: string;         // 后台维护的拼多多/外部购买链接
}

export const products: Product[] = approvedStorefrontProducts;

/**
 * 根据矩阵/场景筛选商品
 */
export function getProductsByPlan(plan: PlanSlug): Product[] {
  return products.filter((p) => p.plans.includes(plan));
}

/**
 * 获取单个商品
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/**
 * 获取品牌列表
 */
export function getBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))];
}

/**
 * 按矩阵分组
 */
export function getProductsByMatrix(matrix: string): Product[] {
  return products.filter((p) => p.matrix === matrix);
}

/**
 * 获取核心矩阵产品 (非通用OTC)
 */
export function getCoreProducts(): Product[] {
  return products.filter((p) => p.matrix);
}