import test from "node:test";
import assert from "node:assert/strict";
import {
  assertKnowledgeDoesNotSelectSku,
  defaultKnowledgeEntries,
  filterPublicKnowledgeEntries,
} from "@/lib/data/knowledge";

test("public health knowledge uses reviewed entries only", () => {
  const publicEntries = filterPublicKnowledgeEntries(defaultKnowledgeEntries);

  assert.equal(publicEntries.length > 0, true);
  assert.equal(publicEntries.every((entry) => entry.status === "reviewed"), true);
  assert.equal(publicEntries.some((entry) => entry.status === "draft"), false);
});

test("knowledge product links are educational and do not choose SKUs for the AI", () => {
  assert.equal(defaultKnowledgeEntries.every(assertKnowledgeDoesNotSelectSku), true);
});

test("reviewed safety entries keep red flags ahead of commerce", () => {
  const safetyEntry = defaultKnowledgeEntries.find((entry) => entry.slug === "fatigue-red-flags");

  assert.ok(safetyEntry);
  assert.equal(safetyEntry.status, "reviewed");
  assert.equal(safetyEntry.redFlags.length > 0, true);
  assert.deepEqual(safetyEntry.productLinks, []);
});
