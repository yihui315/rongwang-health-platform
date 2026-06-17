import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("website product detail adds actual product slugs to the cart", () => {
  const productDetailPage = fs.readFileSync("src/app/products/[slug]/page.tsx", "utf8");
  const suitabilityActions = fs.readFileSync(
    "src/components/product/ProductSuitabilityActions.tsx",
    "utf8",
  );
  const addToCartButton = fs.readFileSync("src/components/ui/AddToCartButton.tsx", "utf8");
  const cartTypes = fs.readFileSync("src/types/index.ts", "utf8");

  assert.match(productDetailPage, /productSlug=\{product\.slug\}/);
  assert.match(suitabilityActions, /slug=\{productSlug\}/);
  assert.doesNotMatch(productDetailPage, /slug=\{product\.plans\[0\]/);
  assert.match(addToCartButton, /slug: string/);
  assert.match(cartTypes, /slug: string/);
});

test("product suitability CTAs keep products assessment-first", () => {
  const productCatalog = fs.readFileSync(
    "src/components/product/ProductCatalogClient.tsx",
    "utf8",
  );
  const suitabilityActions = fs.readFileSync(
    "src/components/product/ProductSuitabilityActions.tsx",
    "utf8",
  );
  const suitabilityRules = fs.readFileSync("src/lib/product-suitability.ts", "utf8");

  assert.match(suitabilityActions, /先确认是否适合我/);
  assert.match(suitabilityActions, /查看适合我的产品方案/);
  assert.match(suitabilityRules, /你的评估结果建议优先咨询医生或药师，暂不展示购买入口。/);
  assert.match(suitabilityActions, /highRiskPurchaseHiddenMessage/);
  assert.match(suitabilityActions, /product_cta_hidden_high_risk/);
  assert.match(suitabilityActions, /product_purchase_ready_click/);
  assert.match(productCatalog, /ProductEvidenceLink/);
  assert.match(productCatalog, /getProductSuitableForCopy/);
  assert.match(productCatalog, /getProductUnsuitableWarnings\(product\.warnings\)/);
  assert.match(suitabilityRules, /孕期 \/ 哺乳期/);
  assert.match(suitabilityRules, /症状严重、持续或快速加重/);
});
