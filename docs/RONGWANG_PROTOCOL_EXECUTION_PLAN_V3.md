# Rongwang Protocol Execution Plan V3.0

## Goal

Engineer rongwang.hk from an AI health questionnaire site into the `Rongwang Health Triage Protocol` / `荣旺健康分层协议` platform.

The work must move in controlled PRs:

Rules file -> PRD -> Design system -> Independent PRs -> Compliance acceptance -> Data launch.

Do not freely rewrite the whole site in one implementation pass.

## PR-000: Rules, PRD, Design System, And Review Template

Business goal:

- Make the V3.0 protocol direction reusable by Codex, reviewers, and future implementation PRs.

Files:

- `AGENTS.md`
- `docs/RONGWANG_PROTOCOL_PRD_V3.md`
- `docs/RONGWANG_PROTOCOL_DESIGN_SYSTEM_V3.md`
- `docs/RONGWANG_PROTOCOL_EXECUTION_PLAN_V3.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/COMPLIANCE_RULES.md`
- `docs/TASKS.md`

Acceptance:

- `AGENTS.md` names the protocol platform direction and execution discipline.
- PRD defines funnel, module requirements, compliance, SEO, and analytics.
- Design system defines first-screen, selector, risk report, Product Passport, CTA, and copy rules.
- PR template enforces business goal, screenshots, analytics, tests, compliance, and rollback notes.
- No app code changes are required for this PR.

Tests:

- `npm run mojibake:scan`

## PR-001: Risk Routing And High-Risk Safety

Business goal:

- Make LOW / MEDIUM / HIGH / urgent result behavior safe before sending more traffic through the protocol.

Primary files:

- `src/lib/health/safety.ts`
- `src/lib/health/recommendations.ts`
- `src/lib/health/recommendation-engine.ts`
- `src/components/ai/ConsultResult.tsx`
- `src/components/ai/RecommendationPanel.tsx`
- `src/components/ai/RiskCard.tsx`
- New `src/components/ai/HighRiskActions.tsx` if needed.

Acceptance:

- HIGH and urgent live results show no product purchase CTA.
- HIGH and urgent saved report snapshots contain no recommendations.
- HIGH and urgent show education, report saving, retesting, and doctor/pharmacist guidance.
- MEDIUM uses education-first language and does not push aggressive commerce.
- LOW can show suitability and Product Passport entry when rules allow.

Tests:

- `npm run test:unit -- recommendations.test.ts`
- Relevant consult UI and assessment report tests.
- Manual desktop/mobile screenshot for result states if UI changes.

Analytics:

- `risk_segment_assigned`
- Existing recommendation/product events must not include raw health answers.

## PR-002: Consent And Post-Assessment Lead Capture

Business goal:

- Collect qualified follow-up after assessment while keeping consent compliant and privacy-safe.

Primary files:

- `src/components/ai/ConsultExperience.tsx`
- `src/components/ai/ConsultForm.tsx`
- New `src/components/ai/AssessmentConsent.tsx`
- New `src/components/ai/PostAssessmentLeadCapture.tsx`
- `src/app/api/lead/route.ts`
- Data or schema files only if existing storage cannot represent consent metadata.

Acceptance:

- Required assessment/report consent blocks submission.
- Optional marketing consent is separate and unchecked by default.
- Lead capture appears after assessment completion.
- Contact values and raw health answers are not sent to analytics.
- Consent version, timestamp, source, scenario, and coarse risk segment are auditable.

Tests:

- Consent default-state unit test.
- Lead API contract test.
- Analytics privacy regression test.

Analytics:

- `assessment_consent_submitted`
- `lead_capture_viewed`
- `lead_submitted`

## PR-003: Protocol Hero And Chief Complaint Selector

Business goal:

- Reframe the homepage around one protocol and one unified assessment engine.

Primary files:

- `src/app/page.tsx`
- `src/components/ai/HomeAssessmentLanding.tsx`
- `src/components/ai/HomeHeroCtas.tsx`
- `src/components/ai/HomeStateSelector.tsx`
- New `ProtocolHero` or `ChiefComplaintSelector` only if it reduces complexity.
- `src/lib/health/consult-entry.ts`
- `src/lib/analytics.ts`

Acceptance:

- First viewport names `荣旺健康分层协议`.
- All chief complaint options route into `/ai-consult` or the unified assessment entry.
- Homepage does not present multiple independent health tests.
- Required CTAs are used unless this PR explicitly documents a funnel strategy change.
- Core content remains SSR/SSG friendly.

Tests:

- Homepage static/render test if available.
- Analytics event schema test.
- Desktop/mobile screenshot.

Analytics:

- `home_protocol_viewed`
- `chief_complaint_selected`
- `assessment_started`

## PR-004: Report Save, Nutrition Direction, And Product Passport

Business goal:

- Make post-assessment conversion evidence-first instead of product-first.

Primary files:

- `src/components/ai/ConsultResult.tsx`
- `src/components/ai/SaveAssessmentReportButton.tsx`
- `src/components/ai/RecommendationPanel.tsx`
- `src/app/products/[slug]/page.tsx`
- New `src/components/product/ProductPassport.tsx`
- `src/data/products.ts`
- `src/schemas/product.ts`
- `src/lib/data/products.ts`

Acceptance:

- Low-risk users can see nutrition support direction and suitable Product Passport entry.
- Medium-risk users see education-first support and consult guidance before product direction.
- High-risk users do not see product purchase CTAs.
- Product Passport displays cautions before purchase actions.
- Missing Passport fields render a visible review state.

Tests:

- Product seed/passport validation.
- Recommendation suppression and suitability tests.
- Product page render check.

Analytics:

- `nutrition_direction_viewed`
- `product_passport_viewed`
- `product_suitability_clicked`
- `shipping_trust_viewed`

## PR-005: Article Conversion, SEO, And Noindex

Business goal:

- Convert SEO traffic into the protocol while protecting personal health pages.

Primary files:

- `src/app/articles/[slug]/page.tsx`
- New `src/components/marketing/ArticleAssessmentCTA.tsx`
- `src/data/articles.ts`
- `src/lib/seo.ts`
- `src/app/loading.tsx`
- `src/app/dashboard/reports/[id]/page.tsx`
- New dashboard report client component if needed.
- `src/app/robots.ts`
- `src/app/sitemap.ts`

Acceptance:

- Articles use inline and final protocol CTAs.
- Article CTAs pass scenario context to the unified assessment.
- Public page schema matches visible content and avoids prohibited claims.
- Personal report pages are noindex.
- Crawler-visible `加载中` is avoided where it hides meaningful content.

Tests:

- Robots/noindex tests.
- Article CTA render test.
- SEO helper tests.

Analytics:

- `article_assessment_cta_clicked`
- `report_viewed`

## PR-006: Funnel Analytics And Data Launch

Business goal:

- Make the protocol measurable without exposing sensitive health data.

Primary files:

- `src/lib/analytics.ts`
- `src/app/api/analytics/route.ts`
- `src/lib/data/analytics-events.ts`
- Admin analytics page and tests if summaries change.

Acceptance:

- Full V3.0 event map is represented.
- Event payloads allow only anonymous/pseudonymous ID, scenario, coarse risk, page type, CTA ID, locale, and referrer category.
- Raw answers, contact values, names, and free-text health notes are rejected or stripped.
- Seven-day revenue attribution is documented and testable.

Tests:

- Analytics event schema tests.
- Analytics API privacy tests.
- Admin summary tests if changed.

## Compliance Acceptance For Every PR

Every implementation PR must answer:

- What business goal does this PR serve?
- Which protocol stage changed?
- Which files changed?
- Which screenshots were captured?
- Which analytics events were added or changed?
- Which tests were run?
- Were any prohibited claims added?
- Do HIGH and urgent paths suppress product purchase CTAs?
- Is marketing consent optional, separate, and unchecked by default?
- Are analytics payloads free of raw health answers and PII?
- What is the rollback path?

## Data Launch Review

Before declaring V3.0 live:

- Confirm homepage protocol events are flowing.
- Confirm chief complaint selection is tracked only as coarse scenario.
- Confirm assessment completion and risk segment events are present.
- Confirm lead submission excludes contact values from analytics.
- Confirm Product Passport views and suitability clicks fire only when commerce is allowed.
- Confirm high-risk reports produce no product purchase events.
- Confirm personal report pages are noindex.

