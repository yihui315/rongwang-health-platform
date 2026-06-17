import test from "node:test";
import assert from "node:assert/strict";
import {
  productPassportPreviewGroups,
  productPassportPreviewRequiredFields,
} from "@/lib/product-passport-preview";

const requiredFields = [
  "产品名称",
  "品牌",
  "规格",
  "原产地",
  "发货地",
  "SKU / 批次号",
  "主要成分",
  "成分含量",
  "适用场景",
  "适用人群",
  "不适用人群",
  "过敏原提示",
  "孕期 / 哺乳期提示",
  "用药 / 慢病提示",
  "检测 / 追溯资料",
  "标签照片",
  "生产日期 / 有效期",
  "第三方认证，如适用",
  "供应商资料，如适用",
  "预计配送时效",
  "物流追踪方式",
  "跨境申报说明",
  "清关提示",
  "售后政策",
  "退货条件",
  "破损 / 错发处理",
];

test("product passport preview exposes concrete evidence and fulfillment fields", () => {
  for (const field of requiredFields) {
    assert.ok(
      productPassportPreviewRequiredFields.includes(field),
      `Expected passport preview to include ${field}`,
    );
  }
});

test("missing proof and certification data is marked pending instead of overclaimed", () => {
  const allRows = productPassportPreviewGroups.flatMap((group) => group.fields);
  const proofRows = allRows.filter((row) =>
    ["检测 / 追溯资料", "标签照片", "第三方认证，如适用", "供应商资料，如适用"].includes(row.label),
  );

  assert.ok(proofRows.length >= 4);
  assert.ok(proofRows.every((row) => row.value === "待补充"));
});

test("product passport preview avoids empty trust slogans and treatment claims", () => {
  const text = JSON.stringify(productPassportPreviewGroups);
  assert.equal(text.includes("正品保证"), false);
  assert.equal(text.includes("治疗"), false);
  assert.equal(text.includes("治愈"), false);
  assert.equal(text.includes("预防疾病"), false);
});
