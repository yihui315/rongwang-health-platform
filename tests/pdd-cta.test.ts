import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PddCtaButton from "../src/components/marketing/PddCtaButton";
import { pddProducts } from "../src/data/pdd-products";
import { buildUtmUrl } from "../src/lib/marketing/utm";

test("PddCtaButton renders third-party purchase disclosure and UTM link when configured", () => {
  const product = {
    ...pddProducts[0],
    pddUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=123",
  };
  const markup = renderToStaticMarkup(
    React.createElement(PddCtaButton, {
      product,
      scenarioSlug: "sleep-support",
      ctaId: "solution_primary_product",
    })
  );

  assert.match(markup, /前往拼多多国际购买/);
  assert.match(markup, /购买将在第三方平台完成/);
  assert.match(markup, /target="_blank"/);
  assert.match(markup, /noopener noreferrer nofollow sponsored/);
  assert.match(markup, /utm_campaign=fast_funnel_v2/);
  assert.match(markup, /utm_content=solution_primary_product/);
});

test("PddCtaButton does not generate fake purchase links when PDD URL is empty", () => {
  const product = { ...pddProducts[0], pddUrl: "" };
  const markup = renderToStaticMarkup(
    React.createElement(PddCtaButton, {
      product,
      scenarioSlug: "sleep-support",
      ctaId: "solution_primary_product",
    })
  );

  assert.match(markup, /购买链接配置中/);
  assert.match(markup, /复制产品名称/);
  assert.doesNotMatch(markup, /href="https:\/\/mobile\.yangkeduo\.com/);
});

test("UTM builder keeps PDD CTA link generation separate from empty-link state", () => {
  assert.equal(buildUtmUrl({ baseUrl: "", content: "solution_primary_product" }), "");
});
