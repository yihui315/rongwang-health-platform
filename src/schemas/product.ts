import { z } from "zod";

export const productCategoryValues = [
  "vitamin",
  "mineral",
  "herbal",
  "probiotic",
  "omega",
  "amino",
  "sleep",
  "adaptogen",
  "liver",
  "beauty",
  "traditional",
] as const;

export const productTierValues = ["hero", "profit", "traffic"] as const;
export const productStockValues = ["in", "low", "out"] as const;
export const planSlugValues = [
  "fatigue",
  "sleep",
  "immune",
  "stress",
  "liver",
  "beauty",
  "cardio",
] as const;

export const keyIngredientSchema = z.object({
  name: z.string().trim().min(1),
  dose: z.string().trim().min(1),
  benefit: z.string().trim().min(1),
});

export const productSchema = z.object({
  sku: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  englishName: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  brandLogo: z.string().trim().min(1).optional(),
  category: z.enum(productCategoryValues),
  plans: z.array(z.enum(planSlugValues)).min(1),
  price: z.number().int().nonnegative(),
  memberPrice: z.number().int().nonnegative(),
  costPrice: z.number().int().nonnegative().optional(),
  unit: z.string().trim().min(1),
  servings: z.number().int().positive(),
  origin: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  tier: z.enum(productTierValues),
  matrix: z.string().trim().min(1).optional(),
  hero: z.array(z.string().trim().min(1)),
  keyIngredients: z.array(keyIngredientSchema).min(1),
  scientificBasis: z.string().trim().min(1),
  howToUse: z.string().trim().min(1),
  warnings: z.array(z.string().trim().min(1)),
  certifications: z.array(z.string().trim().min(1)),
  stock: z.enum(productStockValues),
  badge: z.string().trim().min(1).optional(),
  shippingNote: z.string().trim().min(1).optional(),
  images: z.array(z.string().trim().min(1)).optional(),
  officialUrl: z.string().url().optional(),
  pddUrl: z.string().url().optional(),
});

export type ProductRecord = z.infer<typeof productSchema>;
