import test from "node:test";
import assert from "node:assert/strict";
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
