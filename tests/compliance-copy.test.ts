import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CONSULT_PROFESSIONAL_WARNING,
  CROSS_BORDER_NOTICE,
  NOT_MEDICAL_ADVICE,
  ORIGIN_STANDARD_DIFFERENCE_NOTICE,
  PRODUCT_NOT_MEDICINE_NOTICE,
  THIRD_PARTY_PURCHASE_DISCLAIMER,
} from "../src/lib/compliance/copy";

test("shared compliance copy keeps required health and cross-border warnings", () => {
  assert.match(NOT_MEDICAL_ADVICE, /不构成医疗诊断/);
  assert.match(CONSULT_PROFESSIONAL_WARNING, /咨询医生或药师/);
  assert.match(THIRD_PARTY_PURCHASE_DISCLAIMER, /第三方平台/);
  assert.match(CROSS_BORDER_NOTICE, /跨境商品/);
  assert.match(PRODUCT_NOT_MEDICINE_NOTICE, /本品不能替代药物/);
  assert.match(ORIGIN_STANDARD_DIFFERENCE_NOTICE, /可能与中国相关标准存在差异/);
});
