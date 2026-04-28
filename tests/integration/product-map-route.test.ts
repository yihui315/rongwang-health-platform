import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ProductMapPage from "@/app/product-map/[id]/page";
import { products } from "@/data/products";

const prismaGlobal = globalThis as typeof globalThis & {
  React?: typeof React;
  __rongwangPrisma?: unknown;
};

test("/product-map uses the managed PDD URL stored on the product record", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousPrisma = prismaGlobal.__rongwangPrisma;
  const previousReact = prismaGlobal.React;
  const product = products[0];
  const pddUrl = "https://mobile.yangkeduo.com/goods.html?goods_id=987654";

  process.env.DATABASE_URL = "postgresql://unit-test";
  prismaGlobal.React = React;
  prismaGlobal.__rongwangPrisma = {
    product: {
      findUnique: async ({ where }: { where: { slug: string } }) => {
        assert.equal(where.slug, product.slug);

        return {
          ...product,
          id: "product-test",
          sku: product.sku,
          costPrice: product.costPrice ?? null,
          matrix: product.matrix ?? null,
          hero: product.hero,
          keyIngredients: product.keyIngredients,
          badge: product.badge ?? null,
          shippingNote: product.shippingNote ?? null,
          images: product.images ?? [],
          officialUrl: "https://brand.example/product",
          pddUrl,
          active: true,
          metadata: null,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        };
      },
    },
  };

  try {
    const html = renderToStaticMarkup(
      await ProductMapPage({
        params: Promise.resolve({ id: product.slug }),
        searchParams: Promise.resolve({ source: "unit-test" }),
      }),
    );

    assert.match(html, /https:\/\/mobile\.yangkeduo\.com\/goods\.html\?goods_id=987654/);
    assert.doesNotMatch(html, /https:\/\/brand\.example\/product/);
  } finally {
    process.env.DATABASE_URL = previousDatabaseUrl;
    prismaGlobal.__rongwangPrisma = previousPrisma;
    prismaGlobal.React = previousReact;
  }
});
