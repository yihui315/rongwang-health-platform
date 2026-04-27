import test from "node:test";
import assert from "node:assert/strict";
import { filterConsultationListItems, type ConsultationListItem } from "@/lib/data/consultations";

const rows: ConsultationListItem[] = [
  {
    id: "urgent-1",
    createdAt: "2026-04-26T00:00:00.000Z",
    riskLevel: "urgent",
    symptoms: ["胸痛", "呼吸困难"],
    source: "ai-consult",
    clickCount: 0,
  },
  {
    id: "medium-1",
    createdAt: "2026-04-26T00:01:00.000Z",
    riskLevel: "medium",
    symptoms: ["容易疲劳", "熬夜后不适"],
    source: "ai-consult",
    clickCount: 2,
  },
];

test("consultation filters match risk, symptom and click state", () => {
  assert.deepEqual(
    filterConsultationListItems(rows, {
      riskLevel: "medium",
      symptom: "疲劳",
      hasClick: true,
    }).map((row) => row.id),
    ["medium-1"],
  );

  assert.deepEqual(
    filterConsultationListItems(rows, {
      riskLevel: "urgent",
      hasClick: false,
    }).map((row) => row.id),
    ["urgent-1"],
  );
});
