# Analytics Event Taxonomy — rongwang.hk

> Canonical reference for all analytics events emitted by the rongwang.hk frontend.
> Maintained alongside Stage 5. All events follow the schema defined in `src/lib/analytics.ts`.

---

## Overview

Events are grouped into two tiers:

| Tier | Description |
|------|-------------|
| **Core** | Pre-existing events used by the marketing, mini-program, and AI-assessment flows |
| **Conversion (Stage 5)** | New events tracking key user journeys on solution pages, product pages, advisor CTAs, and the homepage hero |

All events are sent as JSON to `POST /api/analytics` via `navigator.sendBeacon` (fallback: `fetch` with `keepalive`). The payload conforms to the `AnalyticsEvent` Zod schema.

---

## Tier 1 — Core Events

These events were defined before Stage 5 and are emitted by the marketing and AI-assessment flows.

| Event name | When fired | Key fields |
|-----------|------------|------------|
| `assessment_started` | User begins an AI health assessment | `sessionId`, `source` |
| `assessment_completed` | User finishes an AI health assessment | `sessionId`, `consultationId`, `source` |
| `recommendation_clicked` | User clicks a product/solution recommendation | `solutionSlug`, `productId`, `metadata` |
| `pdd_redirect_clicked` | User clicks a Pinduoduo affiliate link | `productId`, `metadata` |
| `tool_completed` | User completes a free health tool | `sessionId`, `metadata` |
| `marketing_campaign_planned` | Internal marketing event | `metadata` |
| `marketing_asset_generated` | Internal marketing event | `metadata` |
| `marketing_geoflow_task_created` | Geoflow automation task created | `metadata` |
| `marketing_autopilot_run` | Autopilot sequence started | `metadata` |
| `miniprogram_product_viewed` | Product viewed in WeChat mini-program | `productId` |
| `miniprogram_pdd_clicked` | PDD link clicked from mini-program | `productId` |
| `wechat_article_published` | WeChat article published | `metadata` |
| `wechat_article_cta_clicked` | CTA inside WeChat article clicked | `metadata` |

---

## Tier 2 — Conversion Events (Stage 5)

Added in Stage 5 to cover the primary conversion paths on rongwang.hk.

### `solution_page_viewed`

**Fired when:** A user lands on a solution detail page (`/solutions/[slug]`).

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `"solution_page_viewed"` | ✓ | Const string enum |
| `solutionSlug` | `string` | ✓ | Slug from the route, e.g. `"sleep"`, `"fatigue"`, `"immune"` |

**Trigger:** Mounted as a client component (`TrackSolutionPageViewClient`) inside the solution detail page shell; fires once via `useEffect` on mount.

---

### `solution_cta_clicked`

**Fired when:** A user clicks the primary CTA on a solution detail page that leads to the AI assessment flow.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `"solution_cta_clicked"` | ✓ | |
| `solutionSlug` | `string` | ✓ | The solution page the click originated from |
| `metadata.href` | `string` | | The `href` destination (e.g. `/ai-consult?focus=sleep`) |

**Triggers:**
- Hero CTA button "先做 AI 评估 →" on `/solutions/[slug]`
- Both buttons inside the "顾问支援" section (AI 评估 link and WeChat CTA)

---

### `product_page_viewed`

**Fired when:** A user lands on a product detail page (`/products/[slug]`).

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `"product_page_viewed"` | ✓ | |
| `productId` | `string` | ✓ | Product SKU |
| `metadata.productName` | `string` | | Product display name for logging |

**Trigger:** `TrackProductPageViewClient` mounted in the product detail page shell.

---

### `product_add_to_cart_clicked`

**Fired when:** A user clicks the "加入购物车" (Add to Cart) button on a product detail page.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `"product_add_to_cart_clicked"` | ✓ | |
| `productId` | `string` | ✓ | Product SKU |
| `metadata.productName` | `string` | | Product display name |

**Trigger:** `onClick` prop passed to `AddToCartButton` in `/products/[slug]` page.

---

### `advisor_cta_clicked`

**Fired when:** A user clicks any CTA in the "顾问支援" (Advisor Support) section of a solution page that opens the WeChat contact flow.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `"advisor_cta_clicked"` | ✓ | |
| `solutionSlug` | `string` | ✓ | The solution page context |
| `metadata.context` | `string` | | `"wechat_link"` or `"ai_consult"` |

**Triggers:**
- WeChat CTA "在微信中打开 →" link in `WeChatCTA` component
- "先做 AI 评估" link inside the advisor section (also covered by `solution_cta_clicked`; deduplicated by backend)

---

### `homepage_cta_clicked`

**Fired when:** A user clicks either CTA button in the homepage Hero section.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `"homepage_cta_clicked"` | ✓ | |
| `metadata.cta` | `"primary"` \| `"secondary"` | ✓ | `"primary"` = AI 评估, `"secondary"` = 查看方案 |
| `metadata.href` | `string` | | Destination URL |

**Trigger:** `TrackHomepageCTA` client component wrapping both Hero buttons.

---

## Event Schema (TypeScript)

```typescript
export const analyticsEventSchema = z.object({
  name: z.enum(analyticsEventNames),
  sessionId: z.string().optional(),
  consultationId: z.string().optional(),
  source: z.string().optional(),
  solutionSlug: z.string().optional(),
  productId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
```

---

## Implementation Notes

### Client components

All Stage 5 events require a client component because `trackAnalyticsEvent` calls `window`. The following components were created:

| Component | Purpose |
|-----------|---------|
| `src/components/analytics/TrackSolutionPageViewClient.tsx` | Fires `solution_page_viewed` on mount |
| `src/components/analytics/TrackProductPageViewClient.tsx` | Fires `product_page_viewed` on mount |
| `src/components/analytics/TrackCTAClicks.tsx` | Exposes `fireCTAClick()` helper; no visual output |
| `src/components/analytics/TrackHomepageCTA.tsx` | Client wrapper for homepage hero CTA buttons |

### Existing tracking helpers (`src/components/layout/Analytics.tsx`)

`Analytics.tsx` exposes additional helpers that fire directly to GA4 and Meta Pixel (not to the `/api/analytics` endpoint):

- `trackAddToCart(productName, price, currency)`
- `trackBeginCheckout(value, currency)`
- `trackPurchase(transactionId, value, currency)`
- `trackNewsletterSignup(email?)`
- `trackViewProduct(productName, price, currency)`

These are **orthogonal** to the server `/api/analytics` pipeline and should continue to be used for standard e-commerce funnel events.

### WeChatCTA component

`WeChatCTA` now accepts an optional `onClick?: () => void` prop. When provided, it is attached to the "在微信中打开 →" anchor element. This is used on solution pages to fire `advisor_cta_clicked`.

### AddToCartButton component

`AddToCartButton` now accepts an optional `onClick?: () => void` prop called after the cart item is added. This is used on product detail pages to fire `product_add_to_cart_clicked`.

---

## Backend Processing

The `POST /api/analytics` endpoint receives events, validates them against the schema, and dispatches to:

1. **Server-side GA4** Measurement Protocol (for cross-domain stitching)
2. **Plausible** custom event API (if configured)
3. Any future integrations (CRM, email automation, etc.)

Events are stored server-side before dispatch to ensure no loss due to ad-blockers.

---

## Adding New Events

1. Add the event name to `analyticsEventNames` in `src/lib/analytics.ts`
2. Document the event in this file
3. Create a client helper or inline `onClick` to fire the event
4. Ensure the backend `/api/analytics` handler routes the new event appropriately