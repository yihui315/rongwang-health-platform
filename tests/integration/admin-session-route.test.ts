import test from "node:test";
import assert from "node:assert/strict";
import {
  DELETE as deleteAdminSession,
  POST as postAdminSession,
} from "@/app/api/admin/session/route";

async function withAdminToken<T>(fn: () => Promise<T>) {
  const previous = process.env.ADMIN_AUTH_TOKEN;
  process.env.ADMIN_AUTH_TOKEN = "session-secret";

  try {
    return await fn();
  } finally {
    process.env.ADMIN_AUTH_TOKEN = previous;
  }
}

function postRequest(token: string) {
  return new Request("http://localhost/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

test("POST /api/admin/session sets a secure admin session cookie for a valid token", async () => {
  await withAdminToken(async () => {
    const response = await postAdminSession(postRequest("session-secret"));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });

    const setCookie = response.headers.get("set-cookie") ?? "";
    assert.match(setCookie, /rw_admin_token=session-secret/);
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Strict/i);
    assert.match(setCookie, /Path=\//i);
    assert.match(setCookie, /Max-Age=28800/i);
    assert.doesNotMatch(setCookie, /Secure/i);
  });
});

test("POST /api/admin/session returns 401 for an invalid token", async () => {
  await withAdminToken(async () => {
    const response = await postAdminSession(postRequest("wrong"));

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { ok: false, error: "invalid_admin_token" });
  });
});

test("DELETE /api/admin/session clears the admin session cookie", async () => {
  const response = await deleteAdminSession();

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });

  const setCookie = response.headers.get("set-cookie") ?? "";
  assert.match(setCookie, /rw_admin_token=/);
  assert.match(setCookie, /Max-Age=0/i);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
});
