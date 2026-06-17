# Rongwang Health Triage Protocol PRD

## Product Definition

Rongwang Health Triage Protocol / 荣旺健康分层协议 is the primary product experience for rongwang.hk.

The platform should feel like a health decision and risk triage protocol, not a collection of independent AI quizzes and not a product-first supplement store.

Primary philosophy:

- Protect users first, support users second.
- Risk triage first, nutrition support second.
- Evidence first, conversion second.

## Business Goal

Transform rongwang.hk from an AI health questionnaire landing page into a trusted health education, risk segmentation, and cross-border nutrition support decision platform.

The redesign should increase qualified assessment starts, report saves, safe follow-up consent, and Product Passport engagement while reducing unsafe product-first journeys.

## Primary Funnel

`Homepage Protocol Hero -> Chief Complaint Selector -> Unified Health Assessment -> LOW / MEDIUM / HIGH Risk Triage -> Report Save / Lead Capture -> Nutrition Support Direction -> Product Passport -> Cross-border Fulfillment Trust -> Purchase / WhatsApp / Email Follow-up`

## Homepage Requirements

The homepage must introduce one unified protocol.

Required copy:

- Top label: `荣旺健康分层协议 · 非诊断 · 健康教育用途 · 高风险先就医`
- H1: `先完成健康风险分层，再判断是否适合营养支持`
- Primary CTA: `开始免费健康分层`
- Secondary CTA: `查看报告样例`
- Fallback CTA: `不确定？AI 先帮我判断`

Chief complaint entry points:

- Sleep
- Fatigue
- Alcohol/social recovery
- Immunity
- Female health
- Male health

These are not independent tests. They are entry points into one unified assessment engine.

## Unified Assessment Requirements

The assessment must:

- Collect structured health context.
- Explain education-only use before sensitive input.
- Separate required consent from optional marketing consent.
- Run safety and red-flag checks before any nutrition support direction.
- Return a LOW, MEDIUM, or HIGH risk triage state.
- Avoid diagnosis, treatment, cure, prevention, or medication replacement language.
- Avoid sending raw health answers or PII to analytics.

## Risk Triage Requirements

LOW risk:

- Show education summary.
- Show lifestyle suggestions.
- Offer report save.
- Allow nutrition support direction.
- Allow Product Passport entry after evidence and cautions.

MEDIUM risk:

- Show education summary.
- Show lifestyle suggestions and professional consultation reminders.
- Offer report save.
- Allow cautious nutrition support direction only when no red flags are present.
- Keep product CTAs secondary and evidence-gated.

HIGH risk:

- Show safety-first guidance.
- Recommend consulting a doctor/pharmacist or urgent care where appropriate.
- Offer report save and doctor communication checklist.
- Do not show product CTAs or product recommendations.

## Report Save And Lead Capture

Report save should help users preserve their education-only result and prepare for follow-up.

Requirements:

- Contact collection must be minimal and explicit.
- Marketing consent must be optional, separate, and not pre-checked.
- Copy must explain what the user will receive.
- Personal result pages must be noindex.
- Analytics must record only coarse, non-sensitive events.

## Nutrition Support Direction

Nutrition support direction is allowed only after triage.

It should:

- Explain why a direction may be relevant.
- Include lifestyle suggestions first.
- Avoid disease claims.
- Show cautions and consultation reminders.
- Link to Product Passport only when the risk state permits commerce.

## Product Passport

Product Passport is the evidence and trust layer before commerce.

It should include:

- Product identity.
- Ingredient education.
- Suitability direction.
- Evidence or review status.
- Cautions and consult-first groups.
- Cross-border fulfillment notes.
- Purchase, WhatsApp, or email follow-up CTA only after the above content.

## Cross-Border Fulfillment Trust

Cross-border trust content should clarify:

- Product source and identity.
- Fulfillment route.
- Delivery expectations.
- Return or after-sales boundaries.
- Customer service channel.
- Compliance disclaimer.

It must not imply medical endorsement or guaranteed health outcomes.

## Non-Goals

PR-000 does not implement application changes.

The redesign must not:

- Add multiple independent homepage tests.
- Make product pages the first step of health journeys.
- Add disease treatment or medicine replacement claims.
- Send raw health answers or PII to analytics.
- Show product CTAs on HIGH risk result pages.

## Success Metrics

Primary metrics:

- Homepage protocol CTA click rate.
- Chief complaint selection rate.
- Unified assessment start rate.
- Unified assessment completion rate.
- Risk triage assignment rate.
- Report save rate.
- Optional marketing consent rate.
- Nutrition support direction view rate for eligible results.
- Product Passport view rate.
- Cross-border trust engagement.

Guardrail metrics:

- HIGH risk product CTA exposure should remain zero.
- Analytics events with PII or raw answers should remain zero.
- Personal result pages indexed by search engines should remain zero.

## Rollout Plan

- PR-000: Repository rules and implementation map.
- PR-001: Homepage Protocol Hero and chief complaint entry architecture.
- PR-002: Unified assessment route and consent model.
- PR-003: LOW/MEDIUM/HIGH risk result templates.
- PR-004: Report save and lead capture compliance.
- PR-005: Nutrition support direction layer.
- PR-006: Product Passport information architecture.
- PR-007: Cross-border fulfillment trust layer.
- PR-008: Privacy-safe analytics implementation.
- PR-009: SEO, metadata, noindex, and structured data compliance.
- PR-010: Compliance acceptance, QA, and launch checklist.

## Acceptance Criteria

- PR-000 creates the protocol rules and implementation map only.
- No application behavior changes in PR-000.
- Later PRs have exact target files and components.
- Test/build commands are identified from `package.json`.
- Compliance and analytics rules are available before implementation starts.
