import assert from "node:assert/strict";
import { test } from "node:test";

import { buildUtmUrl } from "../src/lib/marketing/utm";

test("buildUtmUrl appends default fast funnel UTM parameters", () => {
  const url = buildUtmUrl({
    baseUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=123",
    content: "solution_primary_product",
  });

  assert.match(url, /^https:\/\/mobile\.yangkeduo\.com\/goods\.html\?/);
  assert.match(url, /goods_id=123/);
  assert.match(url, /utm_source=rongwang/);
  assert.match(url, /utm_medium=pdd_referral/);
  assert.match(url, /utm_campaign=fast_funnel_v2/);
  assert.match(url, /utm_content=solution_primary_product/);
});

test("buildUtmUrl supports Chinese URLs and custom UTM fields", () => {
  const url = buildUtmUrl({
    baseUrl: "https://mobile.yangkeduo.com/搜索?keyword=睡眠支持",
    source: "rongwang_home",
    term: "睡眠与压力",
    content: "hero_card",
  });

  assert.match(url, /utm_source=rongwang_home/);
  assert.match(url, /utm_term=%E7%9D%A1%E7%9C%A0%E4%B8%8E%E5%8E%8B%E5%8A%9B/);
  assert.match(url, /keyword=%E7%9D%A1%E7%9C%A0%E6%94%AF%E6%8C%81/);
});

test("buildUtmUrl returns an empty string for empty or invalid base URLs", () => {
  assert.equal(buildUtmUrl({ baseUrl: "", content: "empty" }), "");
  assert.equal(buildUtmUrl({ baseUrl: "not a url", content: "invalid" }), "");
});
