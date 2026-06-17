# Implementation Map

## Framework Detected

- Framework: Next.js App Router
- Next.js version: `^15.5.15`
- React version: `^19.0.0`
- Language: TypeScript
- Styling: Tailwind CSS
- Data/auth/runtime dependencies observed: Prisma, Supabase, Stripe, Zod
- Package manager lockfile: `package-lock.json`

## Routing Structure

Primary application routes live under `src/app`.

Important route groups:

- Homepage: `src/app/page.tsx`
- Unified assessment: `src/app/ai-consult/page.tsx`
- Assessment SEO entries: `src/app/assessment/[type]/page.tsx`
- Scenario solution pages: `src/app/solutions/[slug]/page.tsx`
- Product listing: `src/app/products/page.tsx`
- Product detail: `src/app/products/[slug]/page.tsx`
- Product bridge: `src/app/product-map/[id]/page.tsx`
- Articles: `src/app/articles/page.tsx`, `src/app/articles/[slug]/page.tsx`
- Personal report page: `src/app/dashboard/reports/[id]/page.tsx`
- Assessment report APIs: `src/app/api/assessment-reports/route.ts`, `src/app/api/assessment-reports/[id]/route.ts`
- Analytics API: `src/app/api/analytics/route.ts`
- Lead API: `src/app/api/lead/route.ts`
- Newsletter API: `src/app/api/newsletter/route.ts`

## Homepage File Path

- Route: `src/app/page.tsx`
- Main component: `src/components/ai/HomeAssessmentLanding.tsx`
- Layout wrapper: `src/app/layout.tsx`
- Global styles: `src/app/globals.css`

## Assessment Flow File Path

Main flow:

- Route: `src/app/ai-consult/page.tsx`
- Shell: `src/components/ai/ConsultExperience.tsx`
- Form: `src/components/ai/ConsultForm.tsx`
- Response panel: `src/components/ai/ConsultResponsePanel.tsx`
- Result renderer: `src/components/ai/ConsultResult.tsx`
- Stream UI: `src/components/ai/ConsultStream.tsx`
- Report save action: `src/components/ai/SaveAssessmentReportButton.tsx`
- Recommendation panel: `src/components/ai/RecommendationPanel.tsx`
- Risk UI: `src/components/ai/RiskCard.tsx`

Assessment schemas and logic:

- Health input schema: `src/schemas/health.ts`
- AI result schema: `src/schemas/ai-result.ts`
- Consultation response schema: `src/schemas/consultation-response.ts`
- Consult orchestration: `src/lib/health/consult.ts`
- Entry mapping: `src/lib/health/consult-entry.ts`
- Safety checks: `src/lib/health/safety.ts`
- Recommendation rules: `src/lib/health/recommendations.ts`
- Recommendation engine: `src/lib/health/recommendation-engine.ts`
- Solution mapping/content: `src/lib/health/solutions.ts`, `src/lib/health/mappings.ts`
- AI prompts: `src/lib/health/ai-prompts.ts`

Related APIs:

- AI consult API: `src/app/api/ai/consult/route.ts`
- AI consult stream API: `src/app/api/ai/consult/stream/route.ts`
- Health API: `src/app/api/health/route.ts`
- Recommendation API: `src/app/api/recommendations/route.ts`
- Assessment reports API: `src/app/api/assessment-reports/route.ts`

## Product Listing And Detail File Paths

Product listing:

- Route: `src/app/products/page.tsx`
- Client catalog: `src/components/product/ProductCatalogClient.tsx`
- Data access: `src/lib/data/products.ts`
- Static seed/data: `src/data/products.ts`

Product detail:

- Route: `src/app/products/[slug]/page.tsx`
- SEO helpers: `src/lib/seo.ts`
- Product data: `src/lib/data/products.ts`, `src/data/products.ts`

Product bridge:

- Route: `src/app/product-map/[id]/page.tsx`
- Client bridge: `src/components/ai/ProductRedirectClient.tsx`
- Click API: `src/app/api/pdd/click/route.ts`
- Click persistence: `src/lib/data/pdd-clicks.ts`
- PDD links: `src/data/pinduoduo-links.ts`

## Article And Content File Paths

Public content:

- Article listing: `src/app/articles/page.tsx`
- Article detail: `src/app/articles/[slug]/page.tsx`
- Static article data: `src/data/articles.ts`
- CMS helper: `src/lib/cms.ts`
- SEO helper: `src/lib/seo.ts`
- Landing pages: `src/app/lp/[slug]/page.tsx`, `src/data/landing-pages.ts`
- Plan pages: `src/app/plans/sleep/page.tsx`, `src/app/plans/fatigue/page.tsx`, `src/app/plans/immune/page.tsx`, `src/app/plans/stress/page.tsx`
- Tool pages: `src/app/tools/[slug]/page.tsx`

Admin/content support:

- Admin knowledge: `src/app/admin/knowledge/page.tsx`
- Admin rules: `src/app/admin/rules/page.tsx`
- Admin marketing: `src/app/admin/marketing/page.tsx`
- Knowledge data: `src/lib/data/knowledge.ts`
- Marketing automation: `src/lib/marketing/automation.ts`, `src/lib/marketing/autopilot.ts`, `src/lib/marketing/playbooks.ts`

## Existing Analytics Provider

Vendor analytics:

- `src/components/layout/Analytics.tsx` loads GA4, Meta Pixel, and Plausible in production when these env vars exist:
  - `NEXT_PUBLIC_GA4_ID`
  - `NEXT_PUBLIC_META_PIXEL_ID`
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

First-party analytics:

- Event schema/client: `src/lib/analytics.ts`
- API route: `src/app/api/analytics/route.ts`
- Persistence: `src/lib/data/analytics-events.ts`

PR-008 should review payload validation and ensure no PII or raw health answers can be sent.

## Existing CRM / Email / WhatsApp Integration

Email/newsletter:

- Newsletter API: `src/app/api/newsletter/route.ts`
- Supports Mailchimp via `MAILCHIMP_API_KEY` and `MAILCHIMP_LIST_ID`
- Supports Brevo via `BREVO_API_KEY` and `BREVO_LIST_ID`
- Email sequence content: `src/data/email-sequences.ts`
- Marketing email API: `src/app/api/marketing/email/route.ts`

WeChat / customer service:

- Customer service CTA component: `src/components/ui/WeChatCTA.tsx`
- WeChat Official Account helper: `src/lib/marketing/wechat.ts`
- WeChat publish audit/helper: `src/lib/marketing/wechat-publish.ts`
- WeChat readiness config: `src/lib/wechat/config.ts`
- Mini Program APIs under `src/app/api/wechat/miniprogram`

WhatsApp:

- No dedicated WhatsApp integration file was found in the inspected route/component map.
- Later PRs should add WhatsApp follow-up as a compliant customer-service channel only after consent and risk routing are clear.

Lead capture:

- Legacy lead API: `src/app/api/lead/route.ts`
- PR-004 should audit this endpoint because it currently sits in the lead/report area and must not send raw health answers to analytics or product-first follow-up.

## Existing SEO / Meta Implementation

- Root metadata and organization JSON-LD: `src/app/layout.tsx`
- SEO helper utilities: `src/lib/seo.ts`
- Robots config: `src/app/robots.ts`
- Sitemap config: `src/app/sitemap.ts`
- LLMs text route: `src/app/llms.txt/route.ts`
- App loading state: `src/app/loading.tsx`

PR-009 should verify personal result pages are noindex and that crawler-visible loading states do not replace meaningful SSR/SSG content.

## Test And Build Commands Detected

From `package.json`:

- `npm run dev`
- `npm run mojibake:scan`
- `npm run test:unit`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run smoke`
- `npm run acceptance`
- `npm run seed:verify`
- `npm run prisma:validate`
- `npm run audit:prod`
- `npm run verify`
- `npm run env:check`
- `npm run env:check:production`
- `npm run env:check:selfhost`
- `npm run wechat:check`
- `npm run wechat:check:production`
- `npm run wechat:check:draft`
- `npm run wechat:check:pay`

## Suggested Files For PR-001 To PR-010

PR-001 Homepage Protocol Hero and chief complaint entry:

- `src/app/page.tsx`
- `src/components/ai/HomeAssessmentLanding.tsx`
- Suggested new component: `src/components/ai/HomeChiefComplaintSelector.tsx`
- Suggested new component: `src/components/ai/HomeProtocolHero.tsx`
- Suggested tests: `tests/unit/analytics.test.ts` if homepage tracking changes

PR-002 Unified assessment route and consent model:

- `src/app/ai-consult/page.tsx`
- `src/components/ai/ConsultExperience.tsx`
- `src/components/ai/ConsultForm.tsx`
- `src/schemas/health.ts`
- `src/lib/health/consult-entry.ts`
- `src/app/api/ai/consult/route.ts`
- `src/app/api/ai/consult/stream/route.ts`

PR-003 LOW/MEDIUM/HIGH result templates:

- `src/components/ai/ConsultResult.tsx`
- `src/components/ai/RiskCard.tsx`
- `src/components/ai/RecommendationPanel.tsx`
- `src/lib/health/safety.ts`
- `src/lib/health/recommendations.ts`
- `src/lib/health/recommendation-engine.ts`
- `src/schemas/ai-result.ts`

PR-004 Report save and lead capture compliance:

- `src/components/ai/SaveAssessmentReportButton.tsx`
- `src/app/api/assessment-reports/route.ts`
- `src/app/api/assessment-reports/[id]/route.ts`
- `src/app/dashboard/reports/[id]/page.tsx`
- `src/app/api/lead/route.ts`
- `src/lib/data/assessment-reports.ts`

PR-005 Nutrition support direction layer:

- `src/components/ai/RecommendationPanel.tsx`
- `src/lib/health/recommendations.ts`
- `src/lib/health/solutions.ts`
- `src/lib/health/mappings.ts`
- `src/app/solutions/[slug]/page.tsx`
- `src/app/assessment/[type]/page.tsx`

PR-006 Product Passport information architecture:

- `src/app/products/page.tsx`
- `src/app/products/[slug]/page.tsx`
- `src/components/product/ProductCatalogClient.tsx`
- `src/lib/data/products.ts`
- `src/data/products.ts`
- Suggested new component: `src/components/product/ProductPassport.tsx`

PR-007 Cross-border fulfillment trust layer:

- `src/app/shipping/page.tsx`
- `src/app/products/[slug]/page.tsx`
- `src/app/product-map/[id]/page.tsx`
- `src/components/ai/ProductRedirectClient.tsx`
- `src/app/api/pdd/click/route.ts`
- `src/lib/wechat/pdd-link.ts`

PR-008 Privacy-safe analytics implementation:

- `src/lib/analytics.ts`
- `src/app/api/analytics/route.ts`
- `src/lib/data/analytics-events.ts`
- `src/components/layout/Analytics.tsx`
- `tests/unit/analytics.test.ts`

PR-009 SEO, metadata, noindex, and structured data compliance:

- `src/app/layout.tsx`
- `src/lib/seo.ts`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/loading.tsx`
- `src/app/dashboard/reports/[id]/page.tsx`
- `src/app/articles/[slug]/page.tsx`
- `src/app/products/[slug]/page.tsx`

PR-010 Compliance acceptance, QA, and launch checklist:

- `docs/COMPLIANCE_RULES.md`
- `docs/TRACKING_SPEC.md`
- `docs/COPY_BANK.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `tests/unit/analytics.test.ts`
- `tests/unit/marketing-autopilot.test.ts`
- `tests/unit/marketing-playbooks.test.ts`

## PR-000 Scope Guard

PR-000 should include only:

- `AGENTS.md`
- `docs/RONGWANG_PROTOCOL_PRD.md`
- `docs/COMPLIANCE_RULES.md`
- `docs/COPY_BANK.md`
- `docs/TRACKING_SPEC.md`
- `docs/IMPLEMENTATION_MAP.md`

PR-000 should exclude existing or unrelated application changes in `src/`, `tests/`, `tmp/`, and any V3 draft docs not listed above unless the reviewer explicitly asks to include them.
