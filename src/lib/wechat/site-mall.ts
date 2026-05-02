export interface SiteMallActionProduct {
  slug: string;
  name: string;
}

export interface SiteMallAttributionContext {
  source?: string;
  campaign?: string;
  solutionSlug?: string;
  sessionId?: string;
}

export interface WeChatSiteMallAction {
  type: "site_mall";
  label: string;
  href: string;
  tracking: {
    source: string;
    campaign: string;
    productSlug?: string;
    solutionSlug?: string;
    sessionId?: string;
  };
}

function appendIfPresent(search: URLSearchParams, key: string, value?: string) {
  if (value) {
    search.set(key, value);
  }
}

function buildTracking(product: SiteMallActionProduct | null, context: SiteMallAttributionContext) {
  return {
    source: context.source ?? "wechat",
    campaign: context.campaign ?? "wechat_mall",
    productSlug: product?.slug,
    solutionSlug: context.solutionSlug,
    sessionId: context.sessionId,
  };
}

export function buildSiteMallHref(
  product: SiteMallActionProduct | null = null,
  context: SiteMallAttributionContext = {},
) {
  const tracking = buildTracking(product, context);
  const path = product ? `/products/${encodeURIComponent(product.slug)}` : "/products";
  const search = new URLSearchParams();

  search.set("utm_source", "wechat");
  search.set("utm_medium", tracking.source.includes("miniprogram") ? "miniprogram" : "official_account");
  search.set("utm_campaign", tracking.campaign);
  search.set("ref", tracking.source);
  appendIfPresent(search, "solution", tracking.solutionSlug);
  appendIfPresent(search, "sessionId", tracking.sessionId);

  return `${path}?${search.toString()}`;
}

export function buildMiniProgramSiteMallAction(
  product: SiteMallActionProduct | null = null,
  context: SiteMallAttributionContext = {},
): WeChatSiteMallAction {
  const tracking = buildTracking(product, {
    source: context.source ?? "miniprogram",
    campaign: context.campaign ?? "wechat_miniprogram",
    solutionSlug: context.solutionSlug,
    sessionId: context.sessionId,
  });

  return {
    type: "site_mall",
    label: product ? "在官网商城查看详情" : "打开荣旺官网商城",
    href: buildSiteMallHref(product, tracking),
    tracking,
  };
}
