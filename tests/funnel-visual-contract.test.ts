import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import ProductMapPage from "../app/product-map/[id]/page";
import SolutionPage from "../app/solutions/[slug]/page";

async function renderSolution(slug: string): Promise<string> {
  const markup = renderToStaticMarkup(
    await SolutionPage({ params: Promise.resolve({ slug }) })
  );
  return decodeURIComponent(markup);
}

async function renderProductMap(id: string): Promise<string> {
  const markup = renderToStaticMarkup(
    await ProductMapPage({ params: Promise.resolve({ id }) })
  );
  return decodeURIComponent(markup);
}

test("solution page extends the Home V3 visual baseline", async () => {
  const markup = await renderSolution("sleep-support");

  assert.match(markup, /solution-brand-rail/);
  assert.match(markup, /01-sleep-pressure\.png/);
  assert.match(markup, /solution-hero-visual/);
  assert.match(markup, /solution-trust-strip/);
  assert.match(markup, /查看推荐产品/);
  assert.match(markup, /先做 AI 健康评估/);
  assert.match(markup, /场景方案 · 适用方向 · 风险提示/);
  assert.match(markup, /合规健康教育提示/);
  assert.match(markup, /跨境商品的清关、配送时效及售后规则可能因平台政策和地区而异/);
  assert.match(markup, /solution-product-media/);
});

test("product map page shares the same visual baseline and product media language", async () => {
  const markup = await renderProductMap("sleep-support-001");

  assert.match(markup, /solution-brand-rail/);
  assert.match(markup, /01-sleep-support\.png/);
  assert.match(markup, /product-map-hero-card/);
  assert.match(markup, /solution-trust-strip/);
  assert.match(markup, /购买前复核/);
  assert.match(markup, /第三方平台购买说明/);
  assert.match(markup, /返回场景方案/);
  assert.match(markup, /购买前复核 · 适用确认 · 风险提示/);
  assert.match(markup, /合规提示/);
  assert.match(markup, /第三方平台页面为准/);
});
