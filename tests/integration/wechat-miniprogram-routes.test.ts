import test from "node:test";
import assert from "node:assert/strict";
import { POST as loginMiniProgram } from "@/app/api/wechat/miniprogram/login/route";
import { GET as listMiniProgramProducts } from "@/app/api/wechat/miniprogram/products/route";
import { GET as getMiniProgramProduct } from "@/app/api/wechat/miniprogram/products/[slug]/route";
import { POST as createMiniProgramOrder } from "@/app/api/wechat/miniprogram/orders/route";
import { POST as createWechatPayPrepay } from "@/app/api/wechat/pay/prepay/route";
import { POST as receiveWechatPayNotify } from "@/app/api/wechat/pay/notify/route";

async function withWechatEnv<T>(env: Record<string, string | undefined>, fn: () => Promise<T>) {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) {
    previous[key] = process.env[key];
    if (env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  }

  try {
    return await fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("mini program login fails closed when credentials are not configured", async () => {
  await withWechatEnv({
    WECHAT_MINIPROGRAM_APPID: undefined,
    WECHAT_MINIPROGRAM_SECRET: undefined,
  }, async () => {
    const response = await loginMiniProgram(jsonRequest("http://localhost/api/wechat/miniprogram/login", { code: "js-code" }));

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      success: false,
      error: "wechat_miniprogram_not_configured",
    });
  });
});

test("mini program product API exposes safe product data without direct PDD URLs", async () => {
  const response = await listMiniProgramProducts();

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(Array.isArray(payload.products), true);
  assert.equal(payload.products.length > 0, true);
  assert.equal(typeof payload.products[0].pddManaged, "boolean");
  assert.equal("pddUrl" in payload.products[0], false);
  assert.match(payload.primaryCta.href, /^\/ai-consult/);
});

test("mini program product detail returns a PDD CTA with attribution but no raw PDD URL", async () => {
  const response = await getMiniProgramProduct(
    new Request("http://localhost/api/wechat/miniprogram/products/msr-nadh-tipsynox?source=miniprogram_detail&campaign=wechat-launch&solutionSlug=sleep"),
    { params: Promise.resolve({ slug: "msr-nadh-tipsynox" }) },
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  const serialized = JSON.stringify(payload);

  assert.equal(payload.success, true);
  assert.equal(payload.product.slug, "msr-nadh-tipsynox");
  assert.equal(typeof payload.product.pddManaged, "boolean");
  assert.equal(payload.product.pddAction.tracking.source, "miniprogram_detail");
  assert.equal(payload.product.pddAction.tracking.campaign, "wechat-launch");
  assert.equal(payload.product.pddAction.tracking.solutionSlug, "sleep");
  assert.equal(serialized.includes("pddUrl"), false);
  assert.equal(serialized.includes("pinduoduo"), false);
});

test("mini program order contract creates a pending payment order shape", async () => {
  const response = await createMiniProgramOrder(jsonRequest("http://localhost/api/wechat/miniprogram/orders", {
    openId: "openid-test",
    items: [{ slug: "msr-nadh-tipsynox", quantity: 1 }],
    customer: { name: "Test User", phone: "12345678" },
  }));

  assert.equal(response.status, 201);
  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(payload.order.status, "pending_payment");
  assert.equal(payload.order.paymentStatus, "unpaid");
  assert.equal(payload.order.fulfillmentStatus, "unfulfilled");
});

test("wechat pay prepay and notify fail closed without payment credentials", async () => {
  await withWechatEnv({
    WECHAT_PAY_MCH_ID: undefined,
    WECHAT_PAY_API_V3_KEY: undefined,
    WECHAT_PAY_CERT_SERIAL_NO: undefined,
    WECHAT_PAY_PRIVATE_KEY: undefined,
    WECHAT_PAY_NOTIFY_URL: undefined,
  }, async () => {
    const prepay = await createWechatPayPrepay(jsonRequest("http://localhost/api/wechat/pay/prepay", {
      orderNo: "RW-WX-TEST",
      openId: "openid-test",
    }));
    const notify = await receiveWechatPayNotify();

    assert.equal(prepay.status, 503);
    assert.equal((await prepay.json()).error, "wechat_pay_not_configured");
    assert.equal(notify.status, 503);
    assert.equal((await notify.json()).error, "wechat_pay_not_configured");
  });
});
