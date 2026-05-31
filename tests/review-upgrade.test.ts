import assert from "node:assert/strict";
import { test } from "node:test";

import { runFetchProductAgent } from "../src/agents/fetch-product";
import { scanCompliance } from "../src/services/compliance-service";
import {
  createImportTask,
  getProductById,
  listAgentTasks,
  listApprovedStorefrontProducts,
  listMockProducts,
  resetMockStore,
  resetMockStoreToSeed,
  saveContentWithComplianceReview,
  saveImportedProduct,
} from "../src/lib/mock-store";

const latestPriceBatchId = "price-sheet-2026-05-27:";

function hasPendingAssetFollowUp(value: unknown): value is {
  status: "pending_manual_image_reference";
  searchKeywords: string[];
} {
  if (!value || typeof value !== "object") return false;

  const followUp = value as { status?: unknown; searchKeywords?: unknown };
  return (
    followUp.status === "pending_manual_image_reference" &&
    Array.isArray(followUp.searchKeywords) &&
    followUp.searchKeywords.length >= 2
  );
}

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

test("latest price sheet products seed as imported and stay hidden from the storefront", () => {
  resetMockStoreToSeed();

  const latestProducts = listMockProducts().filter((product) => product.externalId?.startsWith(latestPriceBatchId));
  const productsWithJdReferences = latestProducts.filter((product) => product.rawPayload.jdReference);

  assert.equal(latestProducts.length, 10);
  assert.ok(latestProducts.every((product) => product.status === "imported"));
  assert.ok(latestProducts.every((product) => product.rawPayload.sourceFile?.includes("产品价格体系2026-05-27.xls")));
  assert.equal(latestProducts.filter((product) => product.rawPayload.images?.length).length, 4);
  assert.equal(productsWithJdReferences.length, 4);
  assert.equal(
    latestProducts.filter((product) => !product.rawPayload.images?.length).length,
    6
  );
  assert.ok(
    latestProducts
      .filter((product) => !product.rawPayload.images?.length)
      .every((product) => hasPendingAssetFollowUp(product.rawPayload.importNotes?.assetFollowUp))
  );
  assert.ok(
    productsWithJdReferences.every((product) =>
      product.rawPayload.jdReference?.source?.includes("待人工确认")
    )
  );
  assert.ok(
    latestProducts.every(
      (product) => product.rawPayload.importNotes?.storefrontVisibility === "blocked_until_manual_approval"
    )
  );
  assert.ok(
    latestProducts.some(
      (product) =>
        product.externalId === `${latestPriceBatchId}uncle_darrens_bone_cycle` &&
        product.rawPayload.images?.length === 2 &&
        product.rawPayload.jdReference?.itemUrl.includes('10219799018088') &&
        product.rawPayload.importNotes?.jdVariantCandidates
    )
  );
  assert.ok(
    latestProducts.some(
      (product) =>
        product.externalId === `${latestPriceBatchId}uncle_darrens_brain_cycle` &&
        product.rawPayload.images?.length === 2 &&
        product.rawPayload.jdReference?.itemUrl.includes('10215367490540') &&
        product.rawPayload.jdReference?.itemUrl.includes('10215367490542') &&
        product.rawPayload.importNotes?.jdVariantCandidates
    )
  );
  assert.ok(
    latestProducts.some((product) =>
      product.rawPayload.sourceRows?.join(",") === "2,66,88"
    )
  );
  assert.ok(
    listApprovedStorefrontProducts().every((product) => !product.externalId?.startsWith(latestPriceBatchId))
  );
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
