import assert from "node:assert/strict";
import { test } from "node:test";

import { runFetchProductAgent } from "../src/agents/fetch-product";
import { scanCompliance } from "../src/services/compliance-service";
import {
  createImportTask,
  getProductById,
  listAgentTasks,
  listApprovedStorefrontProducts,
  resetMockStore,
  resetMockStoreToSeed,
  saveContentWithComplianceReview,
  saveImportedProduct,
} from "../src/lib/mock-store";

test("rejects unsupported product source URLs before import", async () => {
  await assert.rejects(
    () => runFetchProductAgent({ sourceUrl: "https://example.com/product/1" }),
    /Unsupported product source/
  );
});

test("records import task lifecycle and persists the normalized product", () => {
  resetMockStore();
  const task = createImportTask({ sourceUrl: "https://item.jd.com/demo-vitamin.html", createdBy: "review-test" });
  const product = saveImportedProduct(
    {
      source: "jd",
      sourceUrl: "https://item.jd.com/demo-vitamin.html",
      externalId: null,
      title: "测试维生素",
      subtitle: null,
      brand: "Rongwang",
      originCountry: "Australia",
      category: "营养补充",
      priceText: "¥199",
      specs: { 规格: "60 粒" },
      rawPayload: {
        source: "jd",
        sourceUrl: "https://item.jd.com/demo-vitamin.html",
        title: "测试维生素",
        price: "¥199",
        specs: { 规格: "60 粒" },
      },
    },
    task.id
  );

  assert.equal(product.status, "imported");
  assert.equal(getProductById(product.id)?.title, "测试维生素");

  const storedTask = listAgentTasks().find((item) => item.id === task.id);
  assert.equal(storedTask?.status, "completed");
  assert.equal(storedTask?.targetId, product.id);
  assert.equal(storedTask?.taskType, "fetch_product");
});

test("content generation stores compliance review and blocks risky content from approval", () => {
  resetMockStore();
  const product = saveImportedProduct({
    source: "jd",
    sourceUrl: "https://item.jd.com/demo-vitamin.html",
    externalId: null,
    title: "测试鱼油",
    subtitle: null,
    brand: "Rongwang",
    originCountry: "New Zealand",
    category: "营养补充",
    priceText: "¥299",
    specs: { 规格: "90 粒" },
    rawPayload: {
      source: "jd",
      sourceUrl: "https://item.jd.com/demo-vitamin.html",
      title: "测试鱼油",
      price: "¥299",
      specs: { 规格: "90 粒" },
    },
  });
  const stored = saveContentWithComplianceReview(product.id, {
    shortTitle: "测试鱼油",
    shortDescription: "用于治疗疲劳的描述",
    longDescription: "本草稿缺少安全边界。",
    seoKeywords: ["鱼油"],
    faqDraft: ["是否可以替代处方药？"],
    disclaimer: "",
    riskFlags: [],
  });

  assert.equal(stored.content.status, "compliance_flagged");
  assert.equal(stored.review.reviewStatus, "compliance_flagged");
  assert.match(stored.review.riskFlags.join(","), /治疗/);
  assert.match(stored.review.riskFlags.join(","), /missing_health_disclaimer/);
});

test("only approved products are exposed to storefront queries", () => {
  resetMockStore();
  const imported = saveImportedProduct({
    source: "jd",
    sourceUrl: "https://item.jd.com/imported.html",
    externalId: null,
    title: "未审核商品",
    subtitle: null,
    brand: "Rongwang",
    originCountry: "Australia",
    category: "营养补充",
    priceText: "¥199",
    specs: { 规格: "60 粒" },
    rawPayload: {
      source: "jd",
      sourceUrl: "https://item.jd.com/imported.html",
      title: "未审核商品",
      price: "¥199",
      specs: { 规格: "60 粒" },
    },
  });
  saveContentWithComplianceReview(imported.id, {
    shortTitle: "未审核商品",
    shortDescription: "草稿",
    longDescription: "草稿",
    seoKeywords: [],
    faqDraft: [],
    disclaimer: "本品不能替代药物。本商品符合原产国标准，可能与中国相关标准存在差异，请消费者知悉后谨慎选购。",
    riskFlags: [],
  });

  assert.deepEqual(listApprovedStorefrontProducts(), []);
});

test("compliance scan catches banned terms and missing required disclaimers", () => {
  const result = scanCompliance("这是一段治疗承诺文案", "");

  assert.equal(result.reviewStatus, "compliance_flagged");
  assert.ok(result.riskFlags.includes("治疗"));
  assert.ok(result.riskFlags.includes("missing_health_disclaimer"));
  assert.ok(result.riskFlags.includes("missing_cross_border_disclaimer"));
});

test.after(() => {
  resetMockStoreToSeed();
});
