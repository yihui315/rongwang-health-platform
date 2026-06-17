# TASKS: Growth Funnel PR Plan

## V3.0 Source Of Truth

The current execution direction is `Rongwang Health Triage Protocol` / `荣旺健康分层协议`.

Use these documents before starting application code:

- `AGENTS.md`
- `docs/RONGWANG_PROTOCOL_PRD_V3.md`
- `docs/RONGWANG_PROTOCOL_DESIGN_SYSTEM_V3.md`
- `docs/RONGWANG_PROTOCOL_EXECUTION_PLAN_V3.md`
- `docs/COMPLIANCE_RULES.md`

The PR list below remains useful implementation inventory, but V3.0 protocol rules override older product-first or revenue-first wording. When there is a conflict, prefer: assessment-first, risk-first, evidence-first, privacy-safe analytics, and no commerce for HIGH or urgent risk.

## Repository Reading Summary

Current app structure:

- Home is `src/app/page.tsx`, which renders `src/components/ai/HomeAssessmentLanding.tsx`.
- Main AI assessment flow is `src/app/ai-consult/page.tsx` -> `src/components/ai/ConsultExperience.tsx` -> `src/components/ai/ConsultForm.tsx` and `src/components/ai/ConsultResponsePanel.tsx`.
- Assessment results render through `src/components/ai/ConsultResult.tsx`, `src/components/ai/RiskCard.tsx`, `src/components/ai/RecommendationPanel.tsx`, and `src/components/ai/SaveAssessmentReportButton.tsx`.
- AI consultation backend is `src/app/api/ai/consult/route.ts`, with risk and result logic in `src/lib/health/consult.ts`, `src/lib/health/safety.ts`, `src/lib/health/recommendations.ts`, and `src/lib/health/recommendation-engine.ts`.
- Scenario pages are `src/app/assessment/[type]/page.tsx` and `src/app/solutions/[slug]/page.tsx`, backed by `src/lib/health/solutions.ts` and `src/lib/health/mappings.ts`.
- Product surfaces are `src/app/products/[slug]/page.tsx`, `src/components/product/ProductCatalogClient.tsx`, `src/data/products.ts`, and `src/lib/data/products.ts`.
- Article surfaces are `src/app/articles/page.tsx`, `src/app/articles/[slug]/page.tsx`, `src/data/articles.ts`, `src/lib/cms.ts`, and `src/lib/seo.ts`.
- Analytics are validated in `src/lib/analytics.ts`, persisted through `src/app/api/analytics/route.ts` and `src/lib/data/analytics-events.ts`, and summarized by admin tests.
- Saved personal report pages are client-rendered in `src/app/dashboard/reports/[id]/page.tsx` and fetch from `src/app/api/assessment-reports/[id]/route.ts`.

Important current gaps:

- Live recommendations currently suppress only `urgent` risk in `src/lib/health/recommendations.ts` and `src/lib/health/recommendation-engine.ts`; compliance requires HIGH risk pages to suppress product purchase CTAs too.
- Saved reports already suppress `high` and `urgent` recommendation snapshots in `src/lib/data/assessment-reports.ts`, so live and saved behavior need to be aligned.
- Assessment submission has warning copy but no explicit required report consent or separate optional marketing consent in `src/components/ai/ConsultForm.tsx`.
- The legacy lead modal and `/api/lead` shape are not integrated into the post-assessment AI report flow and do not model separate marketing consent.
- Product detail pages include direct cart CTAs and product copy fields that need Product Passport structure and claim review before scaling traffic.
- Article detail pages include assessment CTAs, but the template does not yet provide a reusable article-to-assessment conversion block with privacy-safe analytics coverage.
- Personal report pages should be noindex; the current client page cannot export route metadata without being split into a server page plus client component.
- `src/app/loading.tsx` shows crawler-visible loading text and should be replaced with meaningful SSR/SSG content or non-indexable route-specific loading where needed.

## PR-001: Compliance Routing And High-Risk Result Safety

Business goal:

- Make LOW / MEDIUM / HIGH / urgent result routing compliant before adding more growth traffic.

Exact files and components to change:

- `src/lib/health/safety.ts`
  - Set `commerceAllowed` to false for `high` and `urgent`.
  - Keep clinician consultation guidance explicit for HIGH and urgent states.
- `src/lib/health/recommendations.ts`
  - Suppress recommendations for `high` and `urgent`, not only `urgent`.
  - Update recommendation reason copy to "risk-level reminder" and "consult doctor or pharmacist" language.
- `src/lib/health/recommendation-engine.ts`
  - Mirror the `high` and `urgent` suppression before database rule lookup.
- `src/components/ai/ConsultResult.tsx`
  - Route LOW to solution + suitability cards.
  - Route MEDIUM to education-first guidance with cautious product direction only if allowed by rules.
  - Route HIGH and urgent to no-purchase result actions.
- `src/components/ai/RecommendationPanel.tsx`
  - Rename from purchase-entry framing to suitability framing.
  - Render no purchase links when `response.safety.commerceAllowed` is false.
- `src/components/ai/RiskCard.tsx`
  - Make risk-level reminder and doctor/pharmacist recommendation visible for HIGH and urgent.
- New component: `src/components/ai/HighRiskActions.tsx`
  - Provide save report, doctor communication checklist download, reassessment reminder, and consult doctor/pharmacist guidance.
- New route or asset: `src/app/api/doctor-checklist/route.ts` or `public/doctor-communication-checklist.md`
  - Provide the downloadable doctor communication checklist.
- Tests:
  - `tests/unit/recommendations.test.ts`
  - `tests/unit/consult-ui-state.test.ts`
  - `tests/integration/assessment-reports-route.test.ts`

Acceptance criteria:

- HIGH and urgent live assessment results show no product purchase CTAs.
- HIGH and urgent saved report snapshots contain no recommendations.
- HIGH and urgent result pages allow saving report, downloading the checklist, and setting a reassessment reminder.
- Tests cover high-risk recommendation suppression.

## PR-002: Privacy-First Consent And Post-Assessment Lead Capture

Business goal:

- Increase qualified follow-up without collecting or sending sensitive data in unsafe ways.

Exact files and components to change:

- `src/components/ai/ConsultExperience.tsx`
  - Track consent state.
  - Submit only after required report consent is accepted.
  - Show lead capture after assessment completion, before full report unlock if product or follow-up CTA is needed.
- `src/components/ai/ConsultForm.tsx`
  - Add required report consent checkbox.
  - Add separate optional marketing consent checkbox, default unchecked.
  - Add privacy-safe copy before submission.
- New component: `src/components/ai/AssessmentConsent.tsx`
  - Encapsulate required report consent and optional marketing consent UI.
- New component: `src/components/ai/PostAssessmentLeadCapture.tsx`
  - Capture email and/or WhatsApp after completion.
  - Include optional marketing opt-in, default unchecked.
- `src/components/ui/LeadCaptureModal.tsx`
  - Either refactor for reuse or retire from the AI assessment path in favor of `PostAssessmentLeadCapture`.
- `src/app/api/lead/route.ts`
  - Accept scenario, coarse risk level, report consent version, marketing consent, and contact channel.
  - Avoid storing raw health answers by default.
  - Mask or avoid logging PII.
- `prisma/schema.prisma`
  - Use existing `Lead` model if possible; otherwise add consent fields only if persistence cannot fit existing `payload`.
- `src/lib/data/consultations.ts`
  - Store report consent metadata with consultation records if needed for auditability.
- Tests:
  - New or updated `tests/integration/api-contracts.test.ts`
  - New or updated `tests/integration/assessment-reports-route.test.ts`
  - New unit test for consent default state.

Acceptance criteria:

- Required report consent blocks assessment submission until checked.
- Marketing opt-in is separate and never pre-checked.
- Lead capture happens after assessment completion.
- Analytics and logs do not include raw health answers, phone numbers, emails, or free-text health data.

## PR-003: Outcome-Led Homepage And Scenario Funnel Entry

Business goal:

- Make the homepage start the fastest monetization funnel for sleep support, fatigue recovery, and social drinking / after-entertainment recovery.

Exact files and components to change:

- `src/components/ai/HomeAssessmentLanding.tsx`
  - Replace generic hero with outcome-led scenario selector for the three priority scenarios.
  - Route CTAs to `/ai-consult?focus=sleep`, `/ai-consult?focus=fatigue`, and `/ai-consult?focus=liver`.
  - Add privacy-first and cross-border direct shipping trust cues above the fold.
  - Remove or rewrite any product-first hero language.
- `src/app/page.tsx`
  - Keep SSR entry and add metadata only if needed.
- `src/components/sections/TrustSection.tsx`
  - Add cross-border direct shipping trust details: origin, delivery expectation, support channel, and transparent product identity.
- `src/lib/health/solutions.ts`
  - Ensure sleep, fatigue, and liver scenario labels match PRD language.
- `src/lib/health/consult-entry.ts`
  - Confirm scenario query mapping supports priority scenarios.
- `src/lib/analytics.ts`
  - Add `home_hero_viewed`, `home_hero_cta_clicked`, and `shipping_trust_viewed`.
- Tests:
  - New homepage render test or snapshot-style static markup test.
  - Update `tests/unit/analytics.test.ts`.

Acceptance criteria:

- Homepage first screen is assessment-first and scenario-led.
- All priority scenario CTAs preserve focus context.
- Trust section appears on homepage without restricted claims.
- Analytics events are privacy-safe and schema-valid.

## PR-004: Product Suitability Cards And Product Passport

Business goal:

- Improve product confidence for LOW-risk users while keeping product pages compliant and cross-border-ready.

Exact files and components to change:

- `src/components/ai/RecommendationPanel.tsx`
  - Render product suitability cards with suitability reason, cautions, and "not suitable when" guidance.
  - Track `product_suitability_clicked` instead of generic recommendation clicks where appropriate.
- `src/lib/health/recommendations.ts`
  - Extend `ProductRecommendation` with suitability fields if needed.
  - Keep product selection rule-based.
- `src/schemas/consultation-response.ts`
  - Add suitability fields to recommendation schema if backend returns them.
- `src/app/products/[slug]/page.tsx`
  - Add Product Passport section.
  - Make cautions visible before cart or purchase CTA.
  - Ensure product page encourages assessment when suitability is unknown.
- New component: `src/components/product/ProductPassport.tsx`
  - Render product identity, brand/manufacturer, origin, key ingredients, nutrition support direction, suitability notes, cautions, storage guidance, cross-border shipping notes, and support contact path.
- `src/data/products.ts`
  - Add or normalize Product Passport fields in static seed data.
  - Claim-review existing product text before exposing it in passport or schema.
- `src/schemas/product.ts`
  - Validate new passport fields.
- `src/lib/data/products.ts`
  - Map new database/static passport fields.
- `prisma/schema.prisma`
  - Add product passport fields only if they cannot be safely stored in existing product `metadata`.
- Tests:
  - `tests/unit/seed-products.test.ts`
  - `tests/unit/recommendations.test.ts`
  - New product detail render test.

Acceptance criteria:

- Product suitability cards appear only when commerce is allowed.
- Product detail pages show Product Passport before purchase action.
- Product copy uses nutrition support direction and education language.
- Cautions and doctor/pharmacist guidance are visible before purchase CTA.

## PR-005: Article Conversion, Analytics Coverage, SEO, And Noindex

Business goal:

- Convert article and SEO traffic into assessments while keeping personal health pages private and core pages crawlable.

Exact files and components to change:

- `src/app/articles/[slug]/page.tsx`
  - Replace one-off related-plan CTA with reusable article-to-assessment conversion template.
  - Remove direct cart CTA from article conversion blocks.
  - Pass article topic and scenario context into `/ai-consult`.
- New component: `src/components/marketing/ArticleAssessmentCTA.tsx`
  - Render inline and end-of-article assessment CTAs.
  - Track `article_assessment_cta_clicked`.
- `src/app/articles/page.tsx`
  - Consider moving client search/filter into a child component so the article index keeps useful SSR content.
- `src/data/articles.ts`
  - Add scenario context fields for priority scenario articles where missing.
- `src/lib/seo.ts`
  - Add or verify Article, FAQ, BreadcrumbList, Organization, and Product schema helpers.
  - Avoid schema descriptions that contain restricted claims.
- `src/app/loading.tsx`
  - Remove crawler-visible empty loading text and replace with meaningful fallback copy or route-specific loading.
- `src/app/dashboard/reports/[id]/page.tsx`
  - Split into a server page with `robots: { index: false, follow: false }` metadata and a client component for fetching/rendering.
- New component: `src/components/dashboard/DashboardReportDetailClient.tsx`
  - Move current client report detail UI here.
- `src/app/robots.ts`
  - Explicitly disallow `/dashboard/` and keep `/product-map/` disallowed.
- `src/app/sitemap.ts`
  - Ensure personal dashboard/report routes are excluded.
- `src/lib/analytics.ts`
  - Add full funnel event names from `docs/GROWTH_PRD.md`.
- `src/lib/data/analytics-events.ts`
  - Update summary fields for lead, report, product suitability, support follow-up, and 7-day revenue attribution where needed.
- Tests:
  - `tests/unit/analytics.test.ts`
  - `tests/unit/analytics-summary.test.ts`
  - `tests/unit/robots.test.ts`
  - New article CTA render test.

Acceptance criteria:

- Articles have inline and final assessment CTAs.
- Article CTAs pass scenario context and track privacy-safe events.
- Core public pages expose meaningful SSR/SSG content.
- Personal health result pages are noindex and excluded from robots/sitemap.
- Full-funnel analytics event names are schema-valid.

## Docs Created

- `AGENTS.md`
- `docs/GROWTH_PRD.md`
- `docs/COMPLIANCE_RULES.md`
- `docs/TASKS.md`

No application code should be changed before PR-001 starts.
