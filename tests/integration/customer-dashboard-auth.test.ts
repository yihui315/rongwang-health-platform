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
