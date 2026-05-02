# WeChat Mini Program Mall MVP

This document defines the first Mini Program commerce slice for Rongwang. It is
not a replacement for the assessment-first website; it is a native WeChat
commerce surface that reuses the same product authority and health guardrails.

## User Flow

```txt
Mini Program entry
-> product catalog
-> product detail
-> AI assessment guidance
-> website mall bridge for product details and site cart
-> PDD guided redirect action
-> PDD / site bridge fallback
```

The product catalog still links users back to AI assessment guidance. Direct
PDD links are not exposed in Mini Program product API responses. Website mall
links point only to Rongwang-owned `/products` and `/products/[slug]` pages with
WeChat UTM attribution; they do not open `/checkout` directly.

Local Mini Program endpoints are centralized in `miniprogram/config.js`. Keep
`project.config.json` on `touristappid` for repository-safe development, and
replace it with the real AppID only in the WeChat Developer Tools workspace
before simulator, preview, or real-device validation.

## MVP Pages

- `pages/index`: entry page with assessment-first message and product catalog.
- `pages/products/index`: product list from `GET /api/wechat/miniprogram/products`.
- `pages/products/detail`: product detail using the same safe product payload.
- `pages/assessment/index`: copies or opens the website AI assessment entry.
- `pages/mall-bridge/index`: explains the website mall handoff and copies the controlled site URL.
- `pages/pdd-bridge/index`: explains external redirect and copies the controlled bridge URL.
- `pages/mine/index`: service and customer-support entry.

## API Contracts

- `GET /api/wechat/status`: sanitized readiness for Official Account, Mini Program, and payment.
- `POST /api/wechat/miniprogram/login`: exchanges WeChat `code` only after app credentials are configured.
- `GET /api/wechat/miniprogram/products`: safe product list with website mall actions, no raw `pddUrl`.
- `GET /api/wechat/miniprogram/products/[slug]`: safe product detail with website mall and PDD CTA attribution.
- `POST /api/wechat/miniprogram/orders`: creates a `pending_payment` order contract.
- `POST /api/wechat/pay/prepay`: disabled until payment credentials and signing are live.
- `POST /api/wechat/pay/notify`: disabled until callback verification is live.

## PDD Redirect Adapter

The first version sells through PDD, not through WeChat Pay. Configure:

- `PDD_SHORT_LINK_MODE=web_bridge`, `copy_link`, or `mini_program`
- `PDD_LINK_FALLBACK_MODE=web_bridge`, `copy_link`, or `customer_service`
- `PDD_MINIPROGRAM_APPID` when direct `navigateToMiniProgram` is allowed
- `PDD_MINIPROGRAM_PATH_TEMPLATE` with placeholders such as `{productSlug}`, `{source}`, `{campaign}`, `{solutionSlug}`, `{sessionId}`

The native utility calls `wx.navigateToMiniProgram` only when the backend returns a `mini_program` action. Otherwise it uses `wx.setClipboardData` or the internal bridge page. The utility must not reference or expose raw product PDD URLs.
Before taking any PDD action, the native utility logs a best-effort
`/api/pdd/click` event using the action tracking payload. Logging failure must
not block navigation, copy-link, or the bridge fallback.

## Launch Guardrails

- WeChat Pay must remain disabled until merchant credentials, private key, serial number, and notify URL are verified.
- Product recommendations stay rule-based; AI does not choose SKUs for sale.
- Urgent health scenarios do not show purchase prompts.
- Health copy stays educational and does not diagnose, prescribe, or promise treatment.
- The Mini Program must not be a thin shell whose only purpose is to jump to PDD.
