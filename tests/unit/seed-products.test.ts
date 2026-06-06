import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { products } from "@/data/products";
import { productSchema } from "@/schemas/product";

test("static product seed source is schema-valid and has unique identifiers", () => {
  const slugs = new Set<string>();
  const skus = new Set<string>();

  for (const product of products) {
    productSchema.parse(product);
    assert.equal(slugs.has(product.slug), false, `duplicate product slug: ${product.slug}`);
    assert.equal(skus.has(product.sku), false, `duplicate product sku: ${product.sku}`);
    slugs.add(product.slug);
    skus.add(product.sku);
  }

  assert.ok(products.length > 0);
});

test("static product seed includes approved UNCLE DARREN'S storefront display batch", () => {
  const approvedProducts = products.filter((product) => product.brand === "UNCLE DARREN'S");

  assert.equal(approvedProducts.length, 12);

  for (const product of approvedProducts) {
    assert.equal(product.stock, "in");
    assert.match(product.shippingNote ?? "", /联系顾问人工确认/);
    assert.ok(product.images?.[0], `${product.slug} should include a storefront image`);
    assert.ok(
      existsSync(join(process.cwd(), "public", product.images![0].replace(/^\//, ""))),
      `${product.slug} image should exist on disk`,
    );
    assert.ok(
      product.warnings.some((warning) => warning.includes("本品不能替代药物")),
      `${product.slug} should keep the health disclaimer`,
    );
    assert.equal(product.pddUrl, undefined);
  }
});
