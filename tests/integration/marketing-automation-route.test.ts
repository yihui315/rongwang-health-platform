import test from "node:test";
import assert from "node:assert/strict";
import {
  GET as getMarketingAutomation,
  POST as postMarketingAutomation,
} from "@/app/api/marketing/automation/route";
import { GET as getOutboundQueue } from "@/app/api/admin/outbound-queue/route";
import { POST as postOutboundQueueReview } from "@/app/api/admin/outbound-queue/[id]/review/route";
import { getMemoryStore, resetMemoryStore } from "@/lib/data/memory-store";

async function withMarketingAutomationEnv<T>(fn: () => Promise<T>) {
  const previous = {
    adminToken: process.env.ADMIN_AUTH_TOKEN,
    featureMarketingAutomation: process.env.FEATURE_MARKETING_AUTOMATION,
    rateLimit: process.env.MARKETING_AUTOMATION_RATE_LIMIT,
    rateWindow: process.env.MARKETING_AUTOMATION_RATE_WINDOW_MS,
  };

  process.env.ADMIN_AUTH_TOKEN = "automation-admin";
  process.env.FEATURE_MARKETING_AUTOMATION = "true";
  process.env.MARKETING_AUTOMATION_RATE_LIMIT = "2";
  process.env.MARKETING_AUTOMATION_RATE_WINDOW_MS = "60000";
  process.env.RW_ENABLE_MEMORY_DB = "true";
  delete process.env.DATABASE_URL;
  resetMemoryStore();

  try {
    return await fn();
  } finally {
    process.env.ADMIN_AUTH_TOKEN = previous.adminToken;
    process.env.FEATURE_MARKETING_AUTOMATION = previous.featureMarketingAutomation;
    process.env.MARKETING_AUTOMATION_RATE_LIMIT = previous.rateLimit;
    process.env.MARKETING_AUTOMATION_RATE_WINDOW_MS = previous.rateWindow;
    delete process.env.RW_ENABLE_MEMORY_DB;
    resetMemoryStore();
  }
}

function marketingAutomationRequest(options: {
  token?: string;
  ip?: string;
  execute?: boolean;
}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.token) {
    headers.set("x-admin-token", options.token);
  }
  if (options.ip) {
    headers.set("x-forwarded-for", options.ip);
  }

  return new Request("http://localhost/api/marketing/automation", {
    method: "POST",
    headers,
    body: JSON.stringify({
      objective: "seo_growth",
      audience: "long-term fatigue and unstable sleep office workers",
      solution: "sleep",
      keyword: "sleep support plan",
      campaignSlug: "sleep-seo-test",
      channels: ["seo_article", "wechat"],
      execute: options.execute,
    }),
  });
}

function outboundQueueReviewRequest(options: {
  token?: string;
  action: string;
  note?: string;
  actor?: string;
}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.token) {
    headers.set("x-admin-token", options.token);
  }

  return new Request("http://localhost/api/admin/outbound-queue/outbound_1/review", {
    method: "POST",
    headers,
    body: JSON.stringify({
      action: options.action,
      note: options.note,
      actor: options.actor,
    }),
  });
}

test("GET /api/marketing/automation returns automation capabilities", async () => {
  const response = await getMarketingAutomation();
  assert.equal(response.status, 200);

  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(payload.capabilities.assessmentFirst, true);
  assert.equal(Array.isArray(payload.capabilities.channels), true);
  assert.equal(typeof payload.geoFlow.configured, "boolean");
});

test("POST /api/marketing/automation rejects unauthenticated planning requests", async () => {
  await withMarketingAutomationEnv(async () => {
    const response = await postMarketingAutomation(
      marketingAutomationRequest({ ip: "198.51.100.20" }),
    );

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: "admin_required" });
  });
});

test("POST /api/marketing/automation returns an authorized dry-run campaign plan by default", async () => {
  await withMarketingAutomationEnv(async () => {
    const response = await postMarketingAutomation(
      marketingAutomationRequest({
        token: "automation-admin",
        ip: "198.51.100.21",
      }),
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.equal(payload.mode, "dry_run");
    assert.equal(payload.plan.solutionSlug, "sleep");
    assert.match(payload.plan.primaryCta.href, /focus=sleep/);
    assert.equal(payload.plan.geoFlow.tasks.length, 1);
    const wechatAsset = payload.plan.assets.find((asset: { channel: string }) => asset.channel === "wechat");
    assert.equal(wechatAsset.wechatArticle.kind, "official_account_article");
    assert.match(wechatAsset.wechatArticle.markdown, /\/ai-consult\?focus=sleep/);
    assert.match(wechatAsset.wechatArticle.markdown, /\/products\?utm_source=wechat/);
    assert.doesNotMatch(wechatAsset.wechatArticle.markdown, /\/checkout|\/product-map/);
    assert.equal(payload.wechatPublication.length, 1);
    assert.equal(payload.wechatPublication[0].status, "draft_only");
    assert.equal(payload.wechatPublication[0].publishAllowed, false);
    assert.equal(payload.storedPlan.status, "pending_manual_review");
    assert.equal(payload.storedPlan.outboundQueue.length, 2);
    assert.equal(payload.storedPlan.outboundQueue.every((entry: { status: string }) => entry.status === "blocked"), true);
  });
});

test("GET /api/admin/outbound-queue requires admin and returns blocked queue entries", async () => {
  await withMarketingAutomationEnv(async () => {
    await postMarketingAutomation(
      marketingAutomationRequest({
        token: "automation-admin",
        ip: "198.51.100.23",
      }),
    );

    const unauthorized = await getOutboundQueue(new Request("http://localhost/api/admin/outbound-queue"));
    assert.equal(unauthorized.status, 401);

    const authorized = await getOutboundQueue(
      new Request("http://localhost/api/admin/outbound-queue", {
        headers: { "x-admin-token": "automation-admin" },
      }),
    );
    assert.equal(authorized.status, 200);
    const payload = await authorized.json();
    assert.equal(payload.success, true);
    assert.equal(payload.queue.length >= 1, true);
    assert.equal(payload.queue[0].status, "blocked");
    assert.equal(payload.queue[0].blockedReasons.includes("manual_send_review_required"), true);
  });
});

test("POST /api/admin/outbound-queue/[id]/review records manual review decisions without sending", async () => {
  await withMarketingAutomationEnv(async () => {
    const planResponse = await postMarketingAutomation(
      marketingAutomationRequest({
        token: "automation-admin",
        ip: "198.51.100.24",
      }),
    );
    assert.equal(planResponse.status, 200);
    const planPayload = await planResponse.json();
    const queueEntry = planPayload.storedPlan.outboundQueue[0];
    assert.equal(queueEntry.status, "blocked");

    const context = { params: Promise.resolve({ id: queueEntry.id }) };
    const unauthorized = await postOutboundQueueReview(
      outboundQueueReviewRequest({
        action: "reviewed_blocked",
        note: "Keep blocked until compliance and provider gates are cleared.",
      }),
      context,
    );
    assert.equal(unauthorized.status, 401);

    const invalid = await postOutboundQueueReview(
      outboundQueueReviewRequest({
        token: "automation-admin",
        action: "approve_and_send",
        note: "This must never be accepted by the review API.",
      }),
      context,
    );
    assert.equal(invalid.status, 400);

    const reviewed = await postOutboundQueueReview(
      outboundQueueReviewRequest({
        token: "automation-admin",
        action: "reviewed_blocked",
        note: "Compliance and provider blockers reviewed; keep blocked.",
        actor: "ops-reviewer",
      }),
      context,
    );
    assert.equal(reviewed.status, 200);
    const reviewedPayload = await reviewed.json();
    assert.equal(reviewedPayload.success, true);
    assert.equal(reviewedPayload.entry.id, queueEntry.id);
    assert.equal(reviewedPayload.entry.status, "blocked");
    assert.equal(reviewedPayload.entry.metadata.reviewHistory.length, 1);
    assert.equal(reviewedPayload.entry.metadata.reviewHistory[0].action, "reviewed_blocked");
    assert.equal(reviewedPayload.entry.metadata.reviewHistory[0].actor, "ops-reviewer");

    const cancelled = await postOutboundQueueReview(
      outboundQueueReviewRequest({
        token: "automation-admin",
        action: "cancelled",
        note: "Cancel this draft outbound item after manual review.",
        actor: "ops-reviewer",
      }),
      context,
    );
    assert.equal(cancelled.status, 200);
    const cancelledPayload = await cancelled.json();
    assert.equal(cancelledPayload.success, true);
    assert.equal(cancelledPayload.entry.status, "cancelled");
    assert.equal(cancelledPayload.entry.metadata.reviewHistory.length, 2);
    assert.equal(cancelledPayload.entry.metadata.reviewHistory[1].action, "cancelled");

    const store = getMemoryStore();
    assert.equal(store.sendEvents.size, 0);
    assert.equal(
      Array.from(store.auditEvents.values()).some((event) => event.action === "outbound_queue_reviewed"),
      true,
    );
    assert.equal(
      Array.from(store.auditEvents.values()).some((event) => event.action === "outbound_queue_cancelled"),
      true,
    );
  });
});

test("POST /api/admin/outbound-queue/[id]/review refuses already sent entries", async () => {
  await withMarketingAutomationEnv(async () => {
    const store = getMemoryStore();
    store.outboundQueue.set("outbound_sent", {
      id: "outbound_sent",
      marketingPlanId: "marketing_plan_sent",
      leadId: null,
      channel: "wechat",
      destination: null,
      status: "sent",
      blockedReasons: [],
      gateSnapshot: {
        marketingPlanStatus: "approved",
        complianceApproved: true,
        automatedMarketingEnabled: true,
        channelProviderConfigured: true,
        manualApprovalRequired: false,
      },
      payload: { title: "Already sent message" },
      metadata: {},
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    });

    const response = await postOutboundQueueReview(
      outboundQueueReviewRequest({
        token: "automation-admin",
        action: "cancelled",
        note: "This sent item must not be changed by manual review.",
        actor: "ops-reviewer",
      }),
      { params: Promise.resolve({ id: "outbound_sent" }) },
    );

    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), {
      error: "outbound queue entry cannot be reviewed from current status",
      status: "sent",
    });
    assert.equal(store.outboundQueue.get("outbound_sent")?.status, "sent");
    assert.equal(store.auditEvents.size, 0);
    assert.equal(store.sendEvents.size, 0);
  });
});

test("POST /api/marketing/automation rate limits authorized planning requests", async () => {
  await withMarketingAutomationEnv(async () => {
    const ip = "198.51.100.22";
    const first = await postMarketingAutomation(
      marketingAutomationRequest({ token: "automation-admin", ip }),
    );
    const second = await postMarketingAutomation(
      marketingAutomationRequest({ token: "automation-admin", ip }),
    );
    const third = await postMarketingAutomation(
      marketingAutomationRequest({ token: "automation-admin", ip }),
    );

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.deepEqual(await third.json(), { success: false, error: "rate_limited" });
  });
});
