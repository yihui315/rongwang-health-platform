import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("website product detail adds actual product slugs to the cart", () => {
  const productDetailPage = fs.readFileSync("src/app/products/[slug]/page.tsx", "utf8");
  const addToCartButton = fs.readFileSync("src/components/ui/AddToCartButton.tsx", "utf8");
  const cartTypes = fs.readFileSync("src/types/index.ts", "utf8");

  assert.match(productDetailPage, /slug=\{product\.slug\}/);
  assert.doesNotMatch(productDetailPage, /slug=\{product\.plans\[0\]/);
  assert.match(addToCartButton, /slug: string/);
  assert.match(cartTypes, /slug: string/);
});
