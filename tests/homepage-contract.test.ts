import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import HomePageV3 from "../src/components/home/HomePageV3";

function countMatches(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

function decodeEncodedSegments(markup: string): string {
  return markup.replace(/%[0-9A-Fa-f]{2}/g, (segment) => decodeURIComponent(segment));
}

test("homepage contract matches the supplied reference direction", () => {
  const markup = renderToStaticMarkup(React.createElement(HomePageV3));
  const normalizedMarkup = decodeEncodedSegments(markup);
  const visibleText = normalizedMarkup.replace(/<[^>]+>/g, "");

  assert.match(visibleText, /荣旺健康/);
  assert.match(visibleText, /RONGWANG HEALTH/);
  assert.match(visibleText, /先选健康场景/);
  assert.match(visibleText, /再查看适合的营养支持方案/);
  assert.match(normalizedMarkup, /rongwang-health-logo-header\.png/);
  assert.equal(countMatches(visibleText, "按健康场景查看方案"), 1);
  assert.equal(countMatches(visibleText, "开始3分钟AI健康评估"), 1);
  assert.match(normalizedMarkup, /home-hero-family/);
  assert.match(normalizedMarkup, /family-group-v4\.png/);
  assert.match(normalizedMarkup, /home-hero-disclaimer-card/);
  assert.match(normalizedMarkup, /home-hero-trust-strip/);
  assert.match(normalizedMarkup, /home-scenario-icon-wrap/);
  assert.match(normalizedMarkup, /home-product-bottle-wrap/);
  assert.match(normalizedMarkup, /home-product-price/);
  assert.match(normalizedMarkup, /01-sleep-pressure\.png/);
  assert.match(normalizedMarkup, /08-women-health\.png/);
  assert.match(normalizedMarkup, /01-sleep-support\.png/);
  assert.match(normalizedMarkup, /06-energy-support\.png/);
  assert.match(visibleText, /10万\+/);
  assert.match(visibleText, /98\.5%/);
  assert.match(visibleText, /香港注册/);
  assert.match(visibleText, /本品不能替代药物/);
  assert.match(visibleText, /本商品符合原产国标准/);
  assert.match(normalizedMarkup, /href="\/compliance"/);
  assert.match(normalizedMarkup, /href="\/privacy"/);
  assert.match(normalizedMarkup, /href="\/terms"/);
  assert.match(normalizedMarkup, /href="\/contact"/);
  assert.match(visibleText, /隐私政策/);
  assert.match(visibleText, /服务条款/);
});
