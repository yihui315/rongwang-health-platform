import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const miniprogramRoot = path.join(process.cwd(), "miniprogram");

test("native mini program skeleton exposes the required Rongwang pages", () => {
  const projectConfig = JSON.parse(fs.readFileSync(path.join(miniprogramRoot, "project.config.json"), "utf8"));
  const appConfig = JSON.parse(fs.readFileSync(path.join(miniprogramRoot, "app.json"), "utf8"));

  assert.equal(projectConfig.compileType, "miniprogram");
  assert.equal(projectConfig.miniprogramRoot, "./");
  assert.deepEqual(appConfig.pages, [
    "pages/index/index",
    "pages/products/index",
    "pages/products/detail",
    "pages/assessment/index",
    "pages/mall-bridge/index",
    "pages/pdd-bridge/index",
    "pages/mine/index",
  ]);
  assert.equal(appConfig.window.navigationBarTitleText, "Rongwang Health");
});

test("mini program client uses site APIs and keeps PDD actions controlled", () => {
  const appJs = fs.readFileSync(path.join(miniprogramRoot, "app.js"), "utf8");
  const configJs = fs.readFileSync(path.join(miniprogramRoot, "config.js"), "utf8");
  const apiUtil = fs.readFileSync(path.join(miniprogramRoot, "utils", "api.js"), "utf8");
  const mallUtil = fs.readFileSync(path.join(miniprogramRoot, "utils", "mall.js"), "utf8");
  const pddUtil = fs.readFileSync(path.join(miniprogramRoot, "utils", "pdd.js"), "utf8");
  const productDetail = fs.readFileSync(path.join(miniprogramRoot, "pages", "products", "detail.js"), "utf8");

  assert.match(appJs, /require\("\.\/config"\)/);
  assert.match(configJs, /apiBaseUrl/);
  assert.match(configJs, /aiConsultUrl/);
  assert.match(configJs, /siteMallUrl/);
  assert.match(apiUtil, /\/api\/wechat\/miniprogram\/products/);
  assert.match(apiUtil, /\/api\/wechat\/miniprogram\/login/);
  assert.match(apiUtil, /\/api\/pdd\/click/);
  assert.match(apiUtil, /productId: tracking\.productSlug/);
  assert.match(mallUtil, /\/pages\/mall-bridge\/index/);
  assert.match(mallUtil, /buildAbsoluteMallHref/);
  assert.match(productDetail, /siteMallAction/);
  assert.match(productDetail, /runMallAction/);
  assert.match(pddUtil, /navigateToMiniProgram/);
  assert.match(pddUtil, /setClipboardData/);
  assert.match(pddUtil, /logPddClick/);
  assert.match(pddUtil, /\/product-map\//);
  assert.equal(pddUtil.includes("pddUrl"), false);
});
