import assert from "node:assert/strict";
import { test } from "node:test";

import { createGeneratedContentForProduct } from "../src/api/content";
import { createProductImportTask, getProductImportStatus } from "../src/api/product";
import {
  getApprovedStorefrontProduct,
  getProductById,
  listAgentTasks,
  listComplianceReviews,
  listGeneratedContents,
  listProducts,
  type StoredProduct,
} from "../src/lib/repositories/product-repository";
import {
  resetMockStore,
  resetMockStoreToSeed,
  reloadMockStoreFromDisk,
} from "../src/lib/mock-store";

test("backend workflow imports a product, generates content, and persists the workflow records", async () => {
  resetMockStore();

  const imported = await createProductImportTask({
    sourceUrl: "https://item.jd.com/demo-vitamin.html",
    createdBy: "backend-contract",
  });

  assert.equal(imported.ok, true);
  assert.equal(imported.taskStatus, "completed");
  assert.equal(imported.product.status, "imported");

  const taskStatus = await getProductImportStatus(imported.task.id);
  assert.equal(taskStatus?.status, "completed");
  assert.equal(taskStatus?.targetId, imported.product.id);

  const generated = await createGeneratedContentForProduct({
    productId: imported.product.id,
    createdBy: "backend-contract",
  });

  assert.equal(generated.ok, true);
  assert.equal(generated.taskStatus, "completed");
  assert.equal(generated.content.productId, imported.product.id);
  assert.equal(generated.review.contentId, generated.content.id);

  reloadMockStoreFromDisk();
  const allProducts = await listProducts();
  const storedProduct = allProducts.find((item: StoredProduct) => item.id === imported.product.id);
  assert.ok(storedProduct);
  assert.equal((await getProductById(imported.product.id))?.title, imported.product.title);
  assert.equal((await listGeneratedContents()).length, 1);
  assert.equal((await listComplianceReviews()).length, 1);
  assert.equal((await listAgentTasks()).length, 2);
  assert.equal(await getApprovedStorefrontProduct(imported.product.id), undefined);
});

test("content generation fails safely for an unknown product id", async () => {
  resetMockStore();

  await assert.rejects(
    () => createGeneratedContentForProduct({ productId: "missing-product", createdBy: "backend-contract" }),
    /Product not found/
  );

  assert.equal((await listAgentTasks()).length, 0);
});

test.after(() => {
  resetMockStoreToSeed();
});
