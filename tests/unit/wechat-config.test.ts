import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const requiredWechatEnvKeys = [
  "WECHAT_APPID",
  "WECHAT_SECRET",
  "WECHAT_AUTHOR",
  "WECHAT_DEFAULT_COVER_PATH",
  "WECHAT_DEFAULT_COVER_MEDIA_ID",
  "WECHAT_DRAFT_UPLOAD_ENABLED",
  "WECHAT_OFFICIAL_DRY_RUN",
  "MD2WECHAT_BASE_URL",
  "WECHAT_MINIPROGRAM_APPID",
  "WECHAT_MINIPROGRAM_SECRET",
  "WECHAT_PAY_MCH_ID",
  "WECHAT_PAY_API_V3_KEY",
  "WECHAT_PAY_CERT_SERIAL_NO",
  "WECHAT_PAY_PRIVATE_KEY",
  "WECHAT_PAY_NOTIFY_URL",
  "WECHAT_AUTO_PUBLISH",
  "PDD_MINIPROGRAM_APPID",
  "PDD_MINIPROGRAM_PATH_TEMPLATE",
  "PDD_SHORT_LINK_MODE",
  "PDD_LINK_FALLBACK_MODE",
];

test("wechat launch env variables are documented in the example env file", () => {
  const envExample = fs.readFileSync(".env.example", "utf8");

  for (const key of requiredWechatEnvKeys) {
    assert.match(envExample, new RegExp(`^${key}=`, "m"));
  }
});

test("wechat operational commands are exposed as explicit npm scripts", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

  assert.equal(pkg.scripts["wechat:check"], "node scripts/wechat-readiness.mjs");
  assert.equal(pkg.scripts["wechat:check:production"], "node scripts/wechat-readiness.mjs --production");
  assert.equal(pkg.scripts["wechat:check:draft"], "node scripts/wechat-readiness.mjs --draft");
  assert.equal(pkg.scripts["wechat:check:pay"], "node scripts/wechat-readiness.mjs --production --pay");
  assert.equal(pkg.scripts["wechat:article"], "tsx scripts/wechat-generate-article.ts");
  assert.equal(pkg.scripts["wechat:inspect"], "node scripts/wechat-md2wechat.mjs --inspect");
  assert.equal(pkg.scripts["wechat:preview"], "node scripts/wechat-md2wechat.mjs --preview");
  assert.equal(pkg.scripts["wechat:draft"], "node scripts/wechat-md2wechat.mjs --draft");
  assert.equal(pkg.scripts.verify.includes("wechat:check"), false);
});
