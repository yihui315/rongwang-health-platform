import test from "node:test";
import assert from "node:assert/strict";
import { PATCH as patchProduct } from "@/app/api/admin/products/[slug]/route";
import { PATCH as patchRule } from "@/app/api/admin/rules/[id]/route";

async function withAdminEnv<T>(fn: () => Promise<T>) {
  const previous = {
    adminToken: process.env.ADMIN_AUTH_TOKEN,
    databaseUrl: process.env.DATABASE_URL,
  };

  process.env.ADMIN_AUTH_TOKEN = "test-admin";
  delete process.env.DATABASE_URL;

  try {
    return await fn();
  } finally {
    process.env.ADMIN_AUTH_TOKEN = previous.adminToken;
    process.env.DATABASE_URL = previous.databaseUrl;
  }
}

test("admin product writes require a valid admin token", async () => {
  await withAdminEnv(async () => {
    const response = await patchProduct(
      new Request("http://localhost/api/admin/products/msr-nadh-tipsynox", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: false }),
      }),
      { params: Promise.resolve({ slug: "msr-nadh-tipsynox" }) },
    );

    assert.equal(response.status, 401);
  });
});

test("admin rule writes validate payload before database writes", async () => {
  await withAdminEnv(async () => {
    const response = await patchRule(
      new Request("http://localhost/api/admin/rules/rule-1", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-token": "test-admin",
        },
        body: JSON.stringify({ priority: -1 }),
      }),
      { params: Promise.resolve({ id: "rule-1" }) },
    );

    assert.equal(response.status, 400);
  });
});
