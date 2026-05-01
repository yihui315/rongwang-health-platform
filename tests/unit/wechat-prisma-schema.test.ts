import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("prisma schema includes WeChat mini program commerce audit models", () => {
  const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
  const migration = fs.readFileSync(
    "prisma/migrations/20260429000000_wechat_commerce_models/migration.sql",
    "utf8",
  );

  for (const model of ["WechatUser", "WechatOrder", "WechatPayment"]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
    assert.match(migration, new RegExp(`CREATE TABLE "${model}"`));
  }

  assert.match(schema, /status\s+String\s+@default\("pending_payment"\)/);
  assert.match(schema, /paymentStatus\s+String\s+@default\("unpaid"\)/);
  assert.match(schema, /fulfillmentStatus\s+String\s+@default\("unfulfilled"\)/);
});
