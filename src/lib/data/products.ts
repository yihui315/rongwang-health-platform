import type { Product as PrismaProduct } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { products as staticProducts, type Product, type ProductCategory, type ProductTier } from "@/data/products";
import { getPrisma } from "@/lib/prisma";

export type { Product, ProductCategory, ProductTier } from "@/data/products";
export type AdminProduct = Omit<Product, "pddUrl"> & {
  active: boolean;
  pddUrl?: string | null;
};

function toStringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

function toObjectArray<T>(value: unknown, fallback: T[] = []) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function mapProductRecord(record: PrismaProduct): Product {
  const fallback = staticProducts.find((product) => product.slug === record.slug);

  return {
    sku: record.sku ?? fallback?.sku ?? record.slug,
    slug: record.slug,
    name: record.name,
    englishName: record.englishName ?? fallback?.englishName ?? record.name,
    brand: record.brand,
    category: record.category as ProductCategory,
    plans: toStringArray(record.plans, fallback?.plans ?? []) as Product["plans"],
    price: record.price,
    memberPrice: record.memberPrice,
    costPrice: record.costPrice ?? fallback?.costPrice,
    unit: record.unit ?? fallback?.unit ?? "",
    servings: record.servings ?? fallback?.servings ?? 0,
    origin: record.origin ?? fallback?.origin ?? "",
    tagline: record.tagline,
    tier: record.tier as ProductTier,
    matrix: record.matrix ?? fallback?.matrix,
    hero: toStringArray(record.hero, fallback?.hero ?? []),
    keyIngredients: toObjectArray(record.keyIngredients, fallback?.keyIngredients ?? []),
    scientificBasis: record.scientificBasis ?? fallback?.scientificBasis ?? "",
    howToUse: record.howToUse ?? fallback?.howToUse ?? "",
    warnings: toStringArray(record.warnings, fallback?.warnings ?? []),
    certifications: toStringArray(record.certifications, fallback?.certifications ?? []),
    stock: (record.stock ?? fallback?.stock ?? "in") as Product["stock"],
    badge: record.badge ?? fallback?.badge,
    shippingNote: record.shippingNote ?? fallback?.shippingNote,
    images: toStringArray(record.images, fallback?.images ?? []),
    officialUrl: record.officialUrl ?? fallback?.officialUrl,
    pddUrl: record.pddUrl ?? fallback?.pddUrl,
  };
}

function mapAdminProductRecord(record: PrismaProduct): AdminProduct {
  return {
    ...mapProductRecord(record),
    active: record.active,
    pddUrl: record.pddUrl,
  };
}

async function queryProductsFromDatabase() {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    });

    if (rows.length === 0) {
      return null;
    }

    return rows.map(mapProductRecord);
  } catch {
    return null;
  }
}

export async function listProducts(): Promise<Product[]> {
  return (await queryProductsFromDatabase()) ?? staticProducts;
}

export async function listProductsForAdmin(): Promise<AdminProduct[]> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.product.findMany({
        orderBy: [{ createdAt: "asc" }, { name: "asc" }],
      });

      if (rows.length > 0) {
        return rows.map(mapAdminProductRecord);
      }
    } catch {
      // Fall back to static source during migration.
    }
  }

  return staticProducts.map((product) => ({
    ...product,
    active: true,
    pddUrl: null,
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const row = await prisma.product.findUnique({ where: { slug } });
      if (row && row.active) {
        return mapProductRecord(row);
      }
    } catch {
      // Fall back to static source during migration.
    }
  }

  return staticProducts.find((product) => product.slug === slug);
}

export async function countProducts(): Promise<number> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      return await prisma.product.count({ where: { active: true } });
    } catch {
      // Fall back to static source during migration.
    }
  }

  return staticProducts.length;
}

export interface AdminProductUpdateInput {
  active?: boolean;
  stock?: Product["stock"];
  officialUrl?: string | null;
  pddUrl?: string | null;
}

export async function updateProductForAdmin(
  slug: string,
  input: AdminProductUpdateInput,
): Promise<Product | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  const data: Prisma.ProductUpdateInput = {};

  if (typeof input.active === "boolean") {
    data.active = input.active;
  }

  if (input.stock) {
    data.stock = input.stock;
  }

  if ("officialUrl" in input) {
    data.officialUrl = input.officialUrl;
  }

  if ("pddUrl" in input) {
    data.pddUrl = input.pddUrl;
  }

  try {
    const row = await prisma.product.update({
      where: { slug },
      data,
    });

    return mapProductRecord(row);
  } catch {
    return null;
  }
}
