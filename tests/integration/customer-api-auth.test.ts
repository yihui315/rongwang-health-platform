import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET as getOrders } from "@/app/api/orders/route";
import {
  GET as getSubscriptions,
  POST as postSubscriptions,
} from "@/app/api/subscriptions/route";

test("GET /api/orders rejects anonymous customer data reads", async () => {
  const response = await getOrders(new NextRequest("http://localhost/api/orders"));

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Unauthorized" });
});

test("GET /api/subscriptions rejects anonymous customer data reads", async () => {
  const response = await getSubscriptions(
    new NextRequest("http://localhost/api/subscriptions"),
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Unauthorized" });
});

test("POST /api/subscriptions rejects anonymous subscription creation", async () => {
  const response = await postSubscriptions(
    new NextRequest("http://localhost/api/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        planSlug: "sleep",
        tier: "monthly",
        userId: "attacker-user-id",
      }),
    }),
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Unauthorized" });
});
