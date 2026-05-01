export type PddLinkMode = "mini_program" | "copy_link" | "web_bridge";
export type PddFallbackMode = "copy_link" | "web_bridge" | "customer_service";

export interface PddActionProduct {
  slug: string;
  name: string;
  pddUrl?: string;
}

export interface PddAttributionContext {
  sessionId?: string;
  source?: string;
  campaign?: string;
  solutionSlug?: string;
}

interface PddActionBase {
  label: string;
  tracking: {
    productSlug: string;
    source: string;
    campaign?: string;
    solutionSlug?: string;
    sessionId?: string;
  };
  bridgeHref: string;
  warning?: string;
}

export type PddMiniProgramAction = PddActionBase & {
  type: "mini_program";
  appId: string;
  path: string;
};

export type PddCopyLinkAction = PddActionBase & {
  type: "copy_link";
};

export type PddWebBridgeAction = PddActionBase & {
  type: "web_bridge";
};

export type PddCustomerServiceAction = PddActionBase & {
  type: "customer_service";
};

export type PddMiniProgramCtaAction =
  | PddMiniProgramAction
  | PddCopyLinkAction
  | PddWebBridgeAction
  | PddCustomerServiceAction;

function envValue(key: string) {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeMode(value: string | undefined): PddLinkMode {
  if (value === "mini_program" || value === "copy_link" || value === "web_bridge") {
    return value;
  }

  return "web_bridge";
}

function normalizeFallbackMode(value: string | undefined): PddFallbackMode {
  if (value === "copy_link" || value === "web_bridge" || value === "customer_service") {
    return value;
  }

  return "web_bridge";
}

function buildTracking(product: PddActionProduct, context: PddAttributionContext) {
  return {
    productSlug: product.slug,
    source: context.source ?? "miniprogram",
    campaign: context.campaign,
    solutionSlug: context.solutionSlug,
    sessionId: context.sessionId,
  };
}

function appendIfPresent(search: URLSearchParams, key: string, value?: string) {
  if (value) {
    search.set(key, value);
  }
}

export function buildPddBridgeHref(product: PddActionProduct, context: PddAttributionContext = {}) {
  const tracking = buildTracking(product, context);
  const search = new URLSearchParams();
  search.set("source", tracking.source);
  appendIfPresent(search, "campaign", tracking.campaign);
  appendIfPresent(search, "solutionSlug", tracking.solutionSlug);
  appendIfPresent(search, "sessionId", tracking.sessionId);

  return `/product-map/${encodeURIComponent(product.slug)}?${search.toString()}`;
}

function interpolatePath(template: string, product: PddActionProduct, context: PddAttributionContext) {
  const tracking = buildTracking(product, context);
  const replacements: Record<string, string> = {
    productSlug: tracking.productSlug,
    source: tracking.source,
    campaign: tracking.campaign ?? "",
    solutionSlug: tracking.solutionSlug ?? "",
    sessionId: tracking.sessionId ?? "",
  };

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) =>
    encodeURIComponent(replacements[key] ?? ""),
  );
}

function fallbackAction(
  mode: PddFallbackMode,
  product: PddActionProduct,
  context: PddAttributionContext,
  warning?: string,
): PddCopyLinkAction | PddWebBridgeAction | PddCustomerServiceAction {
  const base = {
    tracking: buildTracking(product, context),
    bridgeHref: buildPddBridgeHref(product, context),
    warning,
  };

  if (mode === "copy_link") {
    return {
      ...base,
      type: "copy_link",
      label: "复制拼多多口令/短链",
    };
  }

  if (mode === "customer_service") {
    return {
      ...base,
      type: "customer_service",
      label: "联系客服获取购买入口",
    };
  }

  return {
    ...base,
    type: "web_bridge",
    label: "打开站内中转说明",
  };
}

export function getPddLinkReadiness() {
  const mode = normalizeMode(envValue("PDD_SHORT_LINK_MODE"));
  const fallbackMode = normalizeFallbackMode(envValue("PDD_LINK_FALLBACK_MODE"));
  const missing: string[] = [];

  if (mode === "mini_program") {
    if (!envValue("PDD_MINIPROGRAM_APPID")) {
      missing.push("PDD_MINIPROGRAM_APPID");
    }
    if (!envValue("PDD_MINIPROGRAM_PATH_TEMPLATE")) {
      missing.push("PDD_MINIPROGRAM_PATH_TEMPLATE");
    }
  }

  return {
    mode,
    fallbackMode,
    configured: missing.length === 0,
    missing,
    degradeHint: missing.length > 0
      ? `Set PDD_LINK_FALLBACK_MODE to copy_link or web_bridge until PDD mini program parameters are approved.`
      : null,
  };
}

export function buildMiniProgramPddAction(
  product: PddActionProduct,
  context: PddAttributionContext = {},
): PddMiniProgramCtaAction {
  const mode = normalizeMode(envValue("PDD_SHORT_LINK_MODE"));
  const fallbackMode = normalizeFallbackMode(envValue("PDD_LINK_FALLBACK_MODE"));
  const tracking = buildTracking(product, context);
  const bridgeHref = buildPddBridgeHref(product, context);

  if (mode === "mini_program") {
    const appId = envValue("PDD_MINIPROGRAM_APPID");
    const pathTemplate = envValue("PDD_MINIPROGRAM_PATH_TEMPLATE");

    if (appId && pathTemplate) {
      return {
        type: "mini_program",
        label: "去拼多多查看/购买",
        appId,
        path: interpolatePath(pathTemplate, product, context),
        bridgeHref,
        tracking,
      };
    }

    return fallbackAction(
      fallbackMode,
      product,
      context,
      "PDD mini program parameters are missing; using the configured fallback action.",
    );
  }

  if (mode === "copy_link") {
    return fallbackAction("copy_link", product, context);
  }

  return fallbackAction("web_bridge", product, context);
}
