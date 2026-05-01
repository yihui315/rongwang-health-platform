import test from "node:test";
import assert from "node:assert/strict";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  getCustomerLoginPath,
  getCustomerLoginRedirectUrl,
  getCustomerSessionCookieOptions,
  getCookieValue,
  getSafeCustomerNextPath,
  isCustomerProtectedPath,
} from "@/lib/auth/customer-shared";

test("customer auth helpers protect dashboard routes only", () => {
  assert.equal(isCustomerProtectedPath("/dashboard"), true);
  assert.equal(isCustomerProtectedPath("/dashboard/orders"), true);
  assert.equal(isCustomerProtectedPath("/auth/login"), false);
  assert.equal(isCustomerProtectedPath("/subscription"), false);
});

test("customer auth helpers build safe login redirects", () => {
  assert.equal(CUSTOMER_SESSION_COOKIE_NAME, "rw_customer_session");
  assert.equal(getCookieValue("a=1; rw_customer_session=token%201", CUSTOMER_SESSION_COOKIE_NAME), "token 1");
  assert.equal(getCookieValue("a=1; other=2", CUSTOMER_SESSION_COOKIE_NAME), undefined);
  assert.equal(getSafeCustomerNextPath("//evil.example"), "/dashboard");
  assert.equal(getSafeCustomerNextPath("https://evil.example"), "/dashboard");
  assert.equal(getSafeCustomerNextPath("/dashboard?tab=orders"), "/dashboard?tab=orders");
  assert.equal(getCustomerLoginPath("/dashboard?tab=orders"), "/auth/login?next=%2Fdashboard%3Ftab%3Dorders");
  assert.equal(
    getCustomerLoginRedirectUrl("http://localhost/dashboard?tab=orders").toString(),
    "http://localhost/auth/login?next=%2Fdashboard%3Ftab%3Dorders",
  );
});

test("customer session cookie is httpOnly and production secure", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = "production";

  try {
    const options = getCustomerSessionCookieOptions(120);
    assert.equal(options.httpOnly, true);
    assert.equal(options.secure, true);
    assert.equal(options.sameSite, "lax");
    assert.equal(options.path, "/");
    assert.equal(options.maxAge, 120);
  } finally {
    env.NODE_ENV = previousNodeEnv;
  }
});
