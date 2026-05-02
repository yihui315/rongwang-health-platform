import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/auth/customer-shared";

test("middleware redirects anonymous dashboard requests to customer login", () => {
  const request = new NextRequest("http://localhost/dashboard?tab=orders");
  const response = middleware(request);

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("location"),
    "http://localhost/auth/login?next=%2Fdashboard%3Ftab%3Dorders",
  );
});

test("middleware allows dashboard requests with a customer session cookie", () => {
  const request = new NextRequest("http://localhost/dashboard", {
    headers: {
      cookie: `${CUSTOMER_SESSION_COOKIE_NAME}=test-token`,
    },
  });
  const response = middleware(request);

  assert.equal(response.headers.get("location"), null);
});

test("middleware marks attribution cookies secure in production", () => {
  const env = process.env as Record<string, string | undefined>;
  const originalNodeEnv = env.NODE_ENV;
  env.NODE_ENV = "production";

  try {
    const request = new NextRequest("https://rongwang.hk/?utm_source=wechat&utm_medium=post&ref=creator");
    const response = middleware(request);
    const setCookie = response.headers.get("set-cookie") ?? "";

    assert.match(setCookie, /rw_session=.*Secure/i);
    assert.match(setCookie, /rw_ab_group=.*Secure/i);
    assert.match(setCookie, /rw_utm=.*Secure/i);
    assert.match(setCookie, /rw_ref=.*Secure/i);
  } finally {
    env.NODE_ENV = originalNodeEnv;
  }
});
