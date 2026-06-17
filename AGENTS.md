# AGENTS.md

## Scope

These instructions apply to the entire repository.

## Rongwang Business Context

rongwang.hk is being transformed from an AI health questionnaire landing page into a professional health decision and risk triage platform.

Core product:

- `Rongwang Health Triage Protocol`
- `荣旺健康分层协议`

Primary philosophy:

- Protect users first, support users second.
- Risk triage first, nutrition support second.
- Evidence first, conversion second.

Keep Rongwang assessment-first and education-first. Do not turn homepage journeys, reports, SEO pages, article CTAs, follow-up messages, or product pages into product-first supplement sales flows.

## Primary Conversion Funnel

Use this funnel as the default product spine unless a PR explicitly changes the strategy:

`Homepage Protocol Hero -> Chief Complaint Selector -> Unified Health Assessment -> LOW / MEDIUM / HIGH Risk Triage -> Report Save / Lead Capture -> Nutrition Support Direction -> Product Passport -> Cross-border Fulfillment Trust -> Purchase / WhatsApp / Email Follow-up`

Critical homepage rule:

- Do not present multiple independent tests.
- Sleep, fatigue, alcohol/social recovery, immunity, female health, and male health are chief complaint entry points into one unified assessment engine.
- The homepage should make the protocol feel like a risk triage and education pathway, not a generic quiz collection or product catalog.

Homepage copy constants:

- Top label: `荣旺健康分层协议 · 非诊断 · 健康教育用途 · 高风险先就医`
- Primary H1: `先完成健康风险分层，再判断是否适合营养支持`
- Primary CTA: `开始免费健康分层`
- Secondary CTA: `查看报告样例`
- Fallback CTA: `不确定？AI 先帮我判断`

## Compliance Rules

Do not claim diagnosis, treatment, cure, disease prevention, disease reversal, liver repair, insomnia treatment, depression improvement, blood pressure reduction, blood sugar reduction, anti-cancer effects, or medication replacement.

Do not add public copy or AI outputs using claims such as:

- diagnose
- diagnosis
- treatment
- treat
- cure
- prevent disease
- reverse disease
- repair liver
- treat insomnia
- improve depression
- lower blood pressure
- lower blood sugar
- anti-cancer
- replace medication
- guaranteed result
- no side effects

Use safer wording such as:

- 健康教育
- 风险分层
- 营养支持方向
- 生活方式建议
- 成分教育
- 适合性提示
- 咨询医生或药师
- not medical advice
- not diagnosis, treatment, or prescription

High-risk result pages must not show product CTAs, product recommendations, checkout entry points, or product-first follow-up. Route high-risk users toward education, saving the report, retesting when appropriate, and consulting a doctor or pharmacist.

## Privacy Rules

- Marketing consent must be optional, separate from required consent, and not pre-checked.
- Do not send raw health answers, names, email addresses, phone numbers, free-text health notes, or sensitive health data to analytics.
- Do not expose raw third-party commerce URLs to clients when a backend bridge is available.
- Use anonymous or pseudonymous IDs where journey continuity is needed.
- Result pages containing personal health data must be protected from indexing.

## SEO Rules

- Core homepage content should be server-rendered or statically generated where possible.
- Core entry pages should be SSR or SSG where possible, especially unified assessment entry pages, report entry states, scenario solution pages, product pages, articles, and trust pages.
- Avoid crawler-visible `加载中` as the only meaningful content.
- Personal assessment result pages must use `noindex`.
- Metadata and schema copy must follow the same compliance rules as visible page copy.

## Analytics Rules

- Track funnel progression with privacy-safe event names and coarse properties only.
- Allowed analytics properties include page type, CTA id, chief complaint category, coarse risk level, product slug, evidence state, consent state, locale, and anonymous session/report IDs.
- Forbidden analytics properties include raw answers, health notes, name, email, phone, WeChat ID, WhatsApp number, address, order comments, and any sensitive personal health detail.
- Vendor analytics such as GA4, Meta Pixel, and Plausible must not receive PII or raw health answers.

## Execution Discipline

Codex should not rewrite the whole site in one pass.

Strategic work should move in this order:

1. Rules file updates.
2. PRD.
3. Design system.
4. Independent implementation PRs.
5. Compliance acceptance.
6. Analytics and data launch review.

Create one PR at a time. Each implementation PR should be scoped to one business outcome and one reviewable surface. Do not mix homepage redesign, assessment logic, product pages, analytics, SEO, admin workflows, and data migrations unless the user explicitly asks for a combined release.

PR-000 is documentation-only. It must not change application UI, routing behavior, business logic, tests, database schema, or runtime configuration.

## PR Checklist

Every PR must include:

- Business goal
- Files changed
- Screenshots if UI changed
- Analytics events added
- Compliance checklist
- Tests run
- Rollback notes

Compliance checklist for user-facing PRs:

- No prohibited health claims were added.
- HIGH risk paths do not show product purchase CTAs or recommendations.
- Marketing consent is optional, separate, and not pre-checked.
- Analytics payloads exclude PII and raw health answers.
- Personal result pages are noindex.
- Product Passport evidence and cautions appear before commerce actions.

## Test Commands

Codex inspected `package.json`. Use these commands according to PR scope:

- Local dev server: `npm run dev`
- Mojibake/content encoding scan: `npm run mojibake:scan`
- Unit tests: `npm run test:unit`
- Full test suite: `npm run test`
- TypeScript check: `npm run typecheck`
- Lint alias: `npm run lint`
- Production build: `npm run build`
- Smoke checks: `npm run smoke`
- Acceptance checks: `npm run acceptance`
- Product seed verification: `npm run seed:verify`
- Prisma schema validation: `npm run prisma:validate`
- Production audit: `npm run audit:prod`
- Full verification chain: `npm run verify`
- Environment readiness: `npm run env:check`, `npm run env:check:production`, `npm run env:check:selfhost`
- WeChat readiness when WeChat code changes: `npm run wechat:check`, `npm run wechat:check:production`, `npm run wechat:check:draft`, `npm run wechat:check:pay`
