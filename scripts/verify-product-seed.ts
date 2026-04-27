import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { products } from "../src/data/products";
import { productSchema } from "../src/schemas/product";

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

function verifyStaticSeedSource() {
  const slugs = new Set<string>();
  const skus = new Set<string>();

  for (const product of products) {
    productSchema.parse(product);
    assert.equal(slugs.has(product.slug), false, `duplicate product slug: ${product.slug}`);
    assert.equal(skus.has(product.sku), false, `duplicate product sku: ${product.sku}`);
    slugs.add(product.slug);
    skus.add(product.sku);
  }

  assert.ok(products.length > 0, "static product seed source must not be empty");
  return { slugs, skus };
}

function shouldVerifyDatabaseSeed() {
  return process.env.VERIFY_DATABASE_SEED === "true";
}

async function verifyDatabaseSeed() {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, "DATABASE_URL is required when VERIFY_DATABASE_SEED=true");

  const prisma = new PrismaClient();

  try {
    const rows = await prisma.product.findMany({
      orderBy: { slug: "asc" },
      select: {
        slug: true,
        sku: true,
        plans: true,
        officialUrl: true,
        pddUrl: true,
      },
    });

    assert.equal(
      rows.length,
      products.length,
      `database product count (${rows.length}) must match static seed count (${products.length})`,
    );

    const bySlug = new Map(rows.map((row) => [row.slug, row]));

    for (const product of products) {
      const row = bySlug.get(product.slug);
      assert.ok(row, `missing seeded product in database: ${product.slug}`);
      assert.equal(row.sku, product.sku, `sku mismatch for ${product.slug}`);
      assert.deepEqual([...row.plans].sort(), [...product.plans].sort(), `plans mismatch for ${product.slug}`);
      assert.equal(row.officialUrl ?? undefined, product.officialUrl, `officialUrl mismatch for ${product.slug}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  verifyStaticSeedSource();

  if (shouldVerifyDatabaseSeed()) {
    await verifyDatabaseSeed();
    console.log(`[seed:verify] static source and database seed match (${products.length} products)`);
    return;
  }

  console.log(`[seed:verify] static product seed source is valid (${products.length} products)`);
  console.log("[seed:verify] database count check skipped; set VERIFY_DATABASE_SEED=true after running prisma seed");
}

main().catch((error) => {
  console.error("[seed:verify] failed");
  console.error(error);
  process.exitCode = 1;
});
