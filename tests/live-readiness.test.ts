import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { createBrowserFunnelEvent } from "../src/lib/analytics/events";
import { resolvePddProductUrl } from "../src/data/pdd-products";
import { pddProducts } from "../src/data/pdd-products";

afterEach(() => {
  Reflect.deleteProperty(globalThis as Record<string, unknown>, "window");
  Reflect.deleteProperty(globalThis as Record<string, unknown>, "document");
});

test("resolvePddProductUrl prefers product URL and falls back to owner-managed links", () => {
  const product = { ...pddProducts[0], pddUrl: "" };

  assert.equal(resolvePddProductUrl({ ...product, pddUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=primary" }), "https://mobile.yangkeduo.com/goods.html?goods_id=primary");
  assert.equal(
    resolvePddProductUrl(product, {
      [product.id]: "https://mobile.yangkeduo.com/goods.html?goods_id=fallback",
    }),
    "https://mobile.yangkeduo.com/goods.html?goods_id=fallback"
  );
  assert.equal(resolvePddProductUrl(product, {}), "");
});

test("createBrowserFunnelEvent emits flattened tracking fields for live GTM verification", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
    location: {
      href: "https://rongwang.hk/solutions/sleep-support?utm_source=test&utm_medium=cpc&utm_campaign=launch&utm_content=hero",
      search: "?utm_source=test&utm_medium=cpc&utm_campaign=launch&utm_content=hero",
    },
    navigator: {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile",
    },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      referrer: "https://example.com/source",
    },
  });

  const event = createBrowserFunnelEvent("pdd_click", {
    scenarioSlug: "sleep-support",
    productId: "sleep-support-001",
    ctaId: "solution_primary_product",
  });

  assert.equal(event?.event, "pdd_click");
  assert.equal(event?.scenarioSlug, "sleep-support");
  assert.equal(event?.productId, "sleep-support-001");
  assert.equal(event?.ctaId, "solution_primary_product");
  assert.equal(event?.currentUrl, "https://rongwang.hk/solutions/sleep-support?utm_source=test&utm_medium=cpc&utm_campaign=launch&utm_content=hero");
  assert.equal(event?.referrer, "https://example.com/source");
  assert.equal(event?.utm_source, "test");
  assert.equal(event?.utm_medium, "cpc");
  assert.equal(event?.utm_campaign, "launch");
  assert.equal(event?.utm_content, "hero");
  assert.equal(event?.device, "mobile");
  assert.match(event?.userAgent ?? "", /iPhone/);
  assert.ok(event?.timestamp);
});
