import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import robots from "@/app/robots";
import { metadata as assessmentResultMetadata } from "@/app/assessment/result/[id]/page";

test("root loading avoids crawler-visible loading text", () => {
  const loading = fs.readFileSync("src/app/loading.tsx", "utf8");

  assert.equal(loading.includes("加载中"), false);
  assert.equal(loading.includes("鍔犺浇"), false);
  assert.match(loading, /aria-busy="true"/);
});

test("homepage key content remains server-rendered", () => {
  const page = fs.readFileSync("src/app/page.tsx", "utf8");
  const home = fs.readFileSync(
    "src/components/ai/HomeAssessmentLanding.tsx",
    "utf8",
  );

  assert.match(page, /<HomeAssessmentLanding \/>/);
  assert.doesNotMatch(home, /^"use client";/);
  assert.match(home, /HomeHeroCtas/);
  assert.match(home, /HomeProductPassportPreview/);
});

test("personal result pages stay noindex and robots-disallowed", () => {
  assert.deepEqual(assessmentResultMetadata.robots, {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  });

  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
  const disallow = rules[0]?.disallow;
  const disallowList = Array.isArray(disallow) ? disallow : [disallow];

  assert.equal(disallowList.includes("/assessment/result/"), true);
});

test("homepage PR-013 view and click events have visible trigger surfaces", () => {
  const home = fs.readFileSync(
    "src/components/ai/HomeAssessmentLanding.tsx",
    "utf8",
  );
  const fulfillment = fs.readFileSync(
    "src/components/ai/HomeFulfillmentMap.tsx",
    "utf8",
  );
  const faq = fs.readFileSync(
    "src/components/ai/HomeFaqAndProtocolBasis.tsx",
    "utf8",
  );
  const finalCta = fs.readFileSync("src/components/ai/HomeFinalCta.tsx", "utf8");

  assert.match(home, /HomeFulfillmentMap/);
  assert.match(home, /HomeFaqAndProtocolBasis/);
  assert.match(home, /HomeFinalCta/);
  assert.match(fulfillment, /fulfillment_map_view/);
  assert.match(fulfillment, /shipping_policy_click/);
  assert.match(faq, /protocol_basis_view/);
  assert.match(faq, /faq_view/);
  assert.match(faq, /faq_item_expand/);
  assert.match(finalCta, /final_cta_click/);
});
