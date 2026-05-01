import test from "node:test";
import assert from "node:assert/strict";
import {
  createWeChatPublicationDecision,
  createWeChatPublicationAuditEvent,
} from "@/lib/marketing/wechat-publish";
import type { WeChatArticleDraft } from "@/lib/marketing/wechat";

const approvedDraft: WeChatArticleDraft = {
  kind: "official_account_article",
  title: "Sleep support",
  author: "Rongwang Health",
  digest: "Assessment first health education.",
  fileName: "sleep-support.md",
  primaryCtaHref: "/ai-consult?focus=sleep&utm_source=wechat",
  markdown: "Start with AI assessment.\n\n本内容仅供健康教育和一般参考。",
  compliance: {
    approved: true,
    warnings: [],
    safeDisclaimer: "本内容仅供健康教育和一般参考。",
  },
};

const blockedDraft: WeChatArticleDraft = {
  ...approvedDraft,
  title: "Bad claim",
  markdown: "保证治愈，立即购买。",
  compliance: {
    approved: false,
    warnings: ["avoid absolute treatment claims"],
    safeDisclaimer: "本内容仅供健康教育和一般参考。",
  },
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

test("WeChat auto publish defaults to draft-only when the publish switch is off", async () => {
  await withEnv({
    WECHAT_DRAFT_UPLOAD_ENABLED: "true",
    WECHAT_AUTO_PUBLISH: "false",
  }, () => {
    const decision = createWeChatPublicationDecision({
      draft: approvedDraft,
      campaignSlug: "sleep-wechat",
      requestPublish: true,
      adminAuthorized: true,
      nodeEnv: "production",
    });

    assert.equal(decision.status, "draft_ready");
    assert.equal(decision.publishAllowed, false);
    assert.match(decision.reason, /WECHAT_AUTO_PUBLISH/);
  });
});

test("WeChat auto publish blocks non-compliant health claims even when switches are enabled", async () => {
  await withEnv({
    WECHAT_DRAFT_UPLOAD_ENABLED: "true",
    WECHAT_AUTO_PUBLISH: "true",
  }, () => {
    const decision = createWeChatPublicationDecision({
      draft: blockedDraft,
      campaignSlug: "sleep-wechat",
      requestPublish: true,
      adminAuthorized: true,
      nodeEnv: "production",
    });

    assert.equal(decision.status, "blocked");
    assert.equal(decision.publishAllowed, false);
    assert.match(decision.reason, /compliance/);
  });
});

test("WeChat publication audit event is sanitized and records publish-ready decisions", async () => {
  await withEnv({
    WECHAT_DRAFT_UPLOAD_ENABLED: "true",
    WECHAT_AUTO_PUBLISH: "true",
    WECHAT_SECRET: "do-not-leak",
  }, () => {
    const decision = createWeChatPublicationDecision({
      draft: approvedDraft,
      campaignSlug: "sleep-wechat",
      requestPublish: true,
      adminAuthorized: true,
      nodeEnv: "production",
      md2wechatOutput: { draftId: "draft-123", publishId: "publish-456" },
    });
    const event = createWeChatPublicationAuditEvent(decision);
    const serialized = JSON.stringify(event);

    assert.equal(decision.status, "publish_ready");
    assert.equal(decision.publishAllowed, true);
    assert.equal(event.name, "wechat_article_published");
    assert.equal(event.source, "wechat-official-account");
    assert.equal(serialized.includes("do-not-leak"), false);
    assert.equal(serialized.includes("publish-456"), true);
  });
});
