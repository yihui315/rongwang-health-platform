import assert from "node:assert/strict";
import { test } from "node:test";

import { createGeneratedContentForProduct } from "../src/api/content";
import { createProductImportTask } from "../src/api/product";
import {
  getApprovedStorefrontProduct,
  listApprovedStorefrontProducts,
} from "../src/lib/repositories/product-repository";
import {
  resetMockStore,
  resetMockStoreToSeed,
} from "../src/lib/mock-store";

test("storefront reads remain available after the workflow writes are reloaded", async () => {
  resetMockStore();

  const imported = await createProductImportTask({
    sourceUrl: "https://item.jd.com/demo-vitamin.html",
    createdBy: "live-readiness",
  });

  await createGeneratedContentForProduct({
    productId: imported.product.id,
    createdBy: "live-readiness",
  });

  const storefrontProducts = await listApprovedStorefrontProducts();
  assert.equal(Array.isArray(storefrontProducts), true);
  assert.equal(await getApprovedStorefrontProduct(imported.product.id), undefined);
});

test.after(() => {
  resetMockStoreToSeed();
});
