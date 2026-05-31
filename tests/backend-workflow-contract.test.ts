import assert from "node:assert/strict";
import { test } from "node:test";

import { createGeneratedContent } from "../src/api/content";
import { createProductImportTask, getProductImportStatus } from "../src/api/product";
import {
  listAgentTasks,
  listComplianceReviews,
  listGeneratedContents,
  resetMockStore,
  resetMockStoreToSeed,
} from "../src/lib/mock-store";

test("backend workflow imports a product, generates content, and records task/review status", async () => {
  resetMockStore();

  const imported = await createProductImportTask({
    sourceUrl: "https://item.jd.com/demo-vitamin.html",
    createdBy: "backend-contract",
  });

  assert.equal(imported.ok, true);
  assert.equal(imported.taskStatus, "completed");
  assert.equal(imported.product.status, "imported");
  assert.match(imported.task.id, /^task_/);
  assert.equal(imported.task.targetId, imported.product.id);

  const importStatus = getProductImportStatus(imported.task.id);
  assert.equal(importStatus?.status, "completed");
  assert.equal(importStatus?.targetId, imported.product.id);

  const generated = await createGeneratedContent({
    productId: imported.product.id,
    createdBy: "backend-contract",
  });

  assert.equal(generated.ok, true);
  assert.equal(generated.taskStatus, "completed");
  assert.equal(generated.content.productId, imported.product.id);
  assert.match(generated.review.reviewStatus, /pending_manual_review|compliance_flagged/);
  assert.equal(generated.task.targetId, generated.content.id);
  assert.equal(generated.task.outputPayload.reviewId, generated.review.id);

  assert.equal(listAgentTasks().length, 2);
  assert.equal(listGeneratedContents().length, 1);
  assert.equal(listComplianceReviews().length, 1);
});

test("content generation fails safely for an unknown product id", async () => {
  resetMockStore();

  await assert.rejects(
    () => createGeneratedContent({ productId: "missing-product", createdBy: "backend-contract" }),
    /Product not found/
  );

  assert.equal(listAgentTasks().length, 0);
});

test.after(() => {
  resetMockStoreToSeed();
});
