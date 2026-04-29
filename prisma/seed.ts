import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { products } from "../src/data/products";
import { upsertDefaultKnowledgeSeed } from "../src/lib/data/knowledge";

function parseEnvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const equalIndex = trimmed.indexOf("=");
  if (equalIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, equalIndex).trim();
  let value = trimmed.slice(equalIndex + 1).trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return [key, value] as const;
}

function loadLocalEnv() {
  const envFiles = [".env", ".env.local"];
  const loaded: Record<string, string> = {};

  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }

      const [key, value] = parsed;
      loaded[key] = value;
    }
  }

  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const prisma = new PrismaClient();

const defaultRecommendationRules = [
  { id: "default-rule-sleep", name: "Default sleep support", solutionType: "sleep", plans: ["sleep", "stress"], priority: 100 },
  { id: "default-rule-fatigue", name: "Default fatigue recovery", solutionType: "fatigue", plans: ["fatigue", "stress"], priority: 110 },
  { id: "default-rule-liver", name: "Default liver support", solutionType: "liver", plans: ["liver", "immune"], priority: 120 },
  { id: "default-rule-immune", name: "Default immune support", solutionType: "immune", plans: ["immune"], priority: 130 },
  { id: "default-rule-male-health", name: "Default male health support", solutionType: "male_health", plans: ["fatigue", "liver", "stress"], priority: 140 },
  { id: "default-rule-female-health", name: "Default female health support", solutionType: "female_health", plans: ["beauty", "fatigue", "sleep"], priority: 145 },
  { id: "default-rule-general", name: "Default general support", solutionType: "general", plans: ["fatigue", "immune"], priority: 150 },
] as const;

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        sku: product.sku,
        name: product.name,
        englishName: product.englishName,
        brand: product.brand,
        category: product.category,
        plans: product.plans,
        price: product.price,
        memberPrice: product.memberPrice,
        costPrice: product.costPrice ?? null,
        unit: product.unit,
        servings: product.servings,
        origin: product.origin,
        tagline: product.tagline,
        tier: product.tier,
        matrix: product.matrix ?? null,
        hero: product.hero,
        keyIngredients: product.keyIngredients,
        scientificBasis: product.scientificBasis,
        howToUse: product.howToUse,
        warnings: product.warnings,
        certifications: product.certifications,
        stock: product.stock,
        badge: product.badge ?? null,
        shippingNote: product.shippingNote ?? null,
        images: product.images ?? [],
        officialUrl: product.officialUrl ?? null,
      },
      create: {
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        englishName: product.englishName,
        brand: product.brand,
        category: product.category,
        plans: product.plans,
        price: product.price,
        memberPrice: product.memberPrice,
        costPrice: product.costPrice ?? null,
        unit: product.unit,
        servings: product.servings,
        origin: product.origin,
        tagline: product.tagline,
        tier: product.tier,
        matrix: product.matrix ?? null,
        hero: product.hero,
        keyIngredients: product.keyIngredients,
        scientificBasis: product.scientificBasis,
        howToUse: product.howToUse,
        warnings: product.warnings,
        certifications: product.certifications,
        stock: product.stock,
        badge: product.badge ?? null,
        shippingNote: product.shippingNote ?? null,
        images: product.images ?? [],
        officialUrl: product.officialUrl ?? null,
      },
    });
  }

  for (const rule of defaultRecommendationRules) {
    const productIds = products
      .filter((product) => product.plans.some((plan) => rule.plans.includes(plan as never)))
      .map((product) => product.slug);

    if (productIds.length === 0) {
      continue;
    }

    await prisma.recommendationRule.upsert({
      where: { id: rule.id },
      update: {
        name: rule.name,
        condition: {
          solutionTypes: [rule.solutionType],
          riskLevels: ["low", "medium", "high"],
        },
        productIds,
        priority: rule.priority,
        active: true,
        note: "Seeded default rule mirroring the static recommendation plan mapping.",
      },
      create: {
        id: rule.id,
        name: rule.name,
        condition: {
          solutionTypes: [rule.solutionType],
          riskLevels: ["low", "medium", "high"],
        },
        productIds,
        priority: rule.priority,
        active: true,
        note: "Seeded default rule mirroring the static recommendation plan mapping.",
      },
    });
  }

  await upsertDefaultKnowledgeSeed(prisma);
}

main()
  .catch((error) => {
    console.error("[prisma seed] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
