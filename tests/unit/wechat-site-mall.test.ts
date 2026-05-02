import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMiniProgramSiteMallAction,
  buildSiteMallHref,
} from "@/lib/wechat/site-mall";

test("WeChat site mall links keep assessment-first attribution on the website mall", () => {
  const href = buildSiteMallHref(null, {
    source: "official_account",
    campaign: "sleep-wechat",
    solutionSlug: "sleep",
  });

  assert.match(href, /^\/products\?/);
  assert.match(href, /utm_source=wechat/);
  assert.match(href, /utm_medium=official_account/);
  assert.match(href, /utm_campaign=sleep-wechat/);
  assert.match(href, /solution=sleep/);
  assert.equal(href.includes("/checkout"), false);
  assert.equal(href.includes("/product-map"), false);
});

test("Mini Program site mall actions point at website product pages without exposing PDD URLs", () => {
  const action = buildMiniProgramSiteMallAction(
    { slug: "msr-nadh-tipsynox", name: "NADH" },
    {
      source: "miniprogram_detail",
      campaign: "wechat-launch",
      sessionId: "session-test",
    },
  );

  const serialized = JSON.stringify(action);

  assert.equal(action.type, "site_mall");
  assert.equal(action.tracking.productSlug, "msr-nadh-tipsynox");
  assert.match(action.href, /^\/products\/msr-nadh-tipsynox\?/);
  assert.match(action.href, /utm_medium=miniprogram/);
  assert.match(action.href, /sessionId=session-test/);
  assert.equal(serialized.includes("pddUrl"), false);
  assert.equal(serialized.includes("pinduoduo"), false);
});
