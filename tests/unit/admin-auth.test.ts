import test from "node:test";
import assert from "node:assert/strict";
import {
  getAdminCookieOptions,
  getAdminTokenFromRequest,
  isAdminAuthRequired,
  isAdminTokenValid,
} from "@/lib/auth/admin";

test("admin auth is required in production even if token is missing", () => {
  const previous = process.env.ADMIN_AUTH_TOKEN;
  delete process.env.ADMIN_AUTH_TOKEN;

  assert.equal(isAdminAuthRequired("production"), true);
  assert.equal(isAdminAuthRequired("development"), false);

  process.env.ADMIN_AUTH_TOKEN = previous;
});

test("admin session cookie is secure and strict in production", () => {
  const productionOptions = getAdminCookieOptions("production");
  const developmentOptions = getAdminCookieOptions("development");

  assert.equal(productionOptions.httpOnly, true);
  assert.equal(productionOptions.secure, true);
  assert.equal(productionOptions.sameSite, "strict");
  assert.equal(productionOptions.path, "/");
  assert.equal(productionOptions.maxAge, 60 * 60 * 8);
  assert.equal(developmentOptions.secure, false);
});

test("admin token ignores query candidates and prefers header before cookie", () => {
  const previous = process.env.ADMIN_AUTH_TOKEN;
  process.env.ADMIN_AUTH_TOKEN = "secret";

  assert.equal(isAdminTokenValid("secret"), true);
  assert.equal(isAdminTokenValid("wrong"), false);
  assert.equal(
    getAdminTokenFromRequest({
      cookieToken: "cookie",
      headerToken: "header",
      queryToken: "secret",
    }),
    "header",
  );
  assert.equal(
    getAdminTokenFromRequest({
      cookieToken: "cookie",
      queryToken: "secret",
    }),
    "cookie",
  );
  assert.equal(
    getAdminTokenFromRequest({
      queryToken: "secret",
    }),
    "",
  );

  process.env.ADMIN_AUTH_TOKEN = previous;
});
