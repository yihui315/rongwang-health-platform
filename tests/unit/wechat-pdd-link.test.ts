import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMiniProgramPddAction,
  getPddLinkReadiness,
  type PddActionProduct,
} from "@/lib/wechat/pdd-link";

const product: PddActionProduct = {
  slug: "sleep-support",
  name: "Sleep Support",
  pddUrl: "https://pinduoduo.example/sleep-support",
};

async function withEnv<T>(env: Record<string, string | undefined>, fn: () => T | Promise<T>) {
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

test("PDD mini program mode returns a controlled mini program action with attribution", async () => {
  await withEnv({
    PDD_SHORT_LINK_MODE: "mini_program",
    PDD_MINIPROGRAM_APPID: "wx-pdd",
    PDD_MINIPROGRAM_PATH_TEMPLATE: "pages/deeplink/index?sku={productSlug}&source={source}&campaign={campaign}",
  }, () => {
    const action = buildMiniProgramPddAction(product, {
      source: "miniprogram",
      campaign: "wechat-sleep",
      solutionSlug: "sleep",
      sessionId: "rw-session",
    });

    assert.equal(action.type, "mini_program");
    assert.equal(action.label, "去拼多多查看/购买");
    assert.equal(action.appId, "wx-pdd");
    assert.equal(action.path, "pages/deeplink/index?sku=sleep-support&source=miniprogram&campaign=wechat-sleep");
    assert.equal(action.tracking.productSlug, "sleep-support");
    assert.equal(JSON.stringify(action).includes("pddUrl"), false);
    assert.equal(JSON.stringify(action).includes("pinduoduo.example"), false);
  });
});

test("PDD adapter supports copy-link and web-bridge fallback modes without exposing raw PDD URL", async () => {
  await withEnv({
    PDD_SHORT_LINK_MODE: "copy_link",
    PDD_LINK_FALLBACK_MODE: "web_bridge",
  }, () => {
    const copyAction = buildMiniProgramPddAction(product, { source: "miniprogram" });

    assert.equal(copyAction.type, "copy_link");
    assert.equal(copyAction.label, "复制拼多多口令/短链");
    assert.match(copyAction.bridgeHref, /^\/product-map\/sleep-support\?/);
    assert.equal(JSON.stringify(copyAction).includes("pinduoduo.example"), false);
  });

  await withEnv({
    PDD_SHORT_LINK_MODE: "web_bridge",
  }, () => {
    const bridgeAction = buildMiniProgramPddAction(product, { source: "miniprogram", solutionSlug: "sleep" });

    assert.equal(bridgeAction.type, "web_bridge");
    assert.equal(bridgeAction.label, "打开站内中转说明");
    assert.match(bridgeAction.bridgeHref, /source=miniprogram/);
    assert.match(bridgeAction.bridgeHref, /solutionSlug=sleep/);
    assert.equal(JSON.stringify(bridgeAction).includes("pinduoduo.example"), false);
  });
});

test("PDD readiness fails mini program mode closed when required PDD config is missing", async () => {
  await withEnv({
    PDD_SHORT_LINK_MODE: "mini_program",
    PDD_MINIPROGRAM_APPID: undefined,
    PDD_MINIPROGRAM_PATH_TEMPLATE: undefined,
  }, () => {
    const readiness = getPddLinkReadiness();

    assert.equal(readiness.configured, false);
    assert.deepEqual(readiness.missing, ["PDD_MINIPROGRAM_APPID", "PDD_MINIPROGRAM_PATH_TEMPLATE"]);
    assert.ok(readiness.degradeHint);
    assert.match(readiness.degradeHint, /copy_link/);
  });
});
