# Compliance Rules

## Purpose

These rules apply to rongwang.hk and the Rongwang Health Triage Protocol / 荣旺健康分层协议.

Use this document when writing public copy, AI assessment flows, personalized reports, scenario solution pages, product pages, lead capture forms, email or WhatsApp follow-up, analytics payloads, metadata, schema, and PR descriptions.

The platform must remain educational, cautious, non-diagnostic, and risk-triage-first. Product guidance must be framed as suitability and nutrition support direction after risk routing allows it.

## Core Compliance Position

- Health education first.
- Risk triage before nutrition support.
- Professional care guidance before commerce on elevated-risk paths.
- Evidence and cautions before product conversion.
- No diagnosis, treatment, cure, disease prevention, disease reversal, or medication replacement claims.

## Strictly Prohibited Claims

Do not use these phrases or equivalent claims in public copy, AI outputs, product pages, scenario pages, ads, emails, WhatsApp follow-up, article CTAs, metadata, schema, analytics labels, or admin-generated public content:

- diagnose
- diagnosis
- treat
- treatment
- cure
- prevent disease
- disease prevention
- reverse disease
- repair liver
- treat insomnia
- improve depression
- lower blood pressure
- lower blood sugar
- anti-cancer
- replace medication
- medication replacement
- doctor-approved cure
- guaranteed result
- no side effects
- 诊断
- 治疗
- 治愈
- 预防疾病
- 逆转疾病
- 修复肝脏
- 治失眠
- 改善抑郁
- 降低血压
- 降低血糖
- 抗癌
- 替代药物
- 保证有效
- 无副作用

Avoid close variations that imply disease diagnosis, disease treatment, disease prevention, guaranteed results, professional endorsement, or medication replacement.

## Preferred Wording

Use safer wording such as:

- health education
- risk triage
- health risk segmentation
- risk-level reminder
- nutrition support direction
- lifestyle suggestion
- ingredient education
- suitability reminder
- consult a doctor or pharmacist
- not medical advice
- not diagnosis, treatment, or prescription
- 健康教育
- 风险分层
- 营养支持方向
- 生活方式建议
- 成分教育
- 适合性提示
- 咨询医生或药师
- 非诊断
- 不替代医生诊断、治疗或处方

Preferred wording must still be supported by context. Do not use compliant words to imply a restricted claim indirectly.

## Copy Linter

Run the lightweight copy linter before shipping user-facing health or fulfillment copy:

```bash
npm run compliance:copy
```

The default mode fails when prohibited marketing phrases are found in scanned source/content files. For local exploration, use:

```bash
npm run compliance:copy:warn
```

The term list lives in `scripts/compliance-copy-lint.mjs` as `prohibitedTerms`. Update that list when compliance review adds a new high-risk health, customs, delivery, or absolute-performance phrase. Each term should include safer alternatives so the linter output gives writers a usable replacement direction.

The linter allows boundary statements such as "not diagnosis, treatment, or prescription" because those are compliance disclaimers rather than marketing claims. For intentional documentation examples, add a nearby comment with a reason:

```ts
// compliance-copy-allow: documenting a forbidden example in compliance docs
```

Do not use allow comments for public marketing claims. Rewrite the copy unless the exception is a documented compliance example or a legal disclaimer.

## Risk Triage Rules

LOW risk:

- May show education, lifestyle suggestions, report save, nutrition support direction, and Product Passport entry.
- Product CTAs are allowed only after evidence, cautions, and suitability context.

MEDIUM risk:

- May show education, lifestyle suggestions, report save, retesting guidance, and cautious nutrition support direction.
- Product CTAs must be softer and should appear only after safety guidance and consultation reminders.
- If medication use, pregnancy, severe symptoms, or other red flags are present, suppress commerce and route to professional care.

HIGH risk:

- Do not show product purchase CTAs.
- Do not show product recommendations.
- Do not route directly to checkout, product bridge, product-first WhatsApp, or product-first email.
- Show education, report saving, doctor/pharmacist consultation guidance, and emergency guidance where appropriate.

Urgent or emergency language:

- Route to local emergency services or immediate professional care.
- Keep the page focused on safety, not lead capture or commerce.

## Product Passport Rules

Product Passport sections may support purchase decisions only after risk routing allows commerce.

Product Passport copy must show:

- Product identity and source.
- Ingredient education.
- Suitability direction.
- Groups who should consult a doctor/pharmacist first.
- Evidence or review status.
- Cross-border fulfillment and after-sales notes.
- A cautious purchase or support CTA only after the above content.

Product Passport sections must not:

- Present products as diagnosis, treatment, prevention, cure, or medicine replacement.
- Hide cautions behind low-visibility tabs.
- Use high-risk reports as purchase-entry pages.
- Leave missing evidence silently blank; use an `under review` state instead.

## Privacy And Consent Rules

- Required assessment consent and marketing consent must be separate.
- Marketing consent must be optional and not pre-checked.
- Do not export raw health answers by default.
- Do not send PII or raw health answers to analytics.
- Do not include sensitive health notes in URLs, metadata, logs, or analytics payloads.
- Personal health result pages must be noindex.
- Saved reports should use IDs that do not expose PII.

Forbidden analytics and vendor payload fields:

- Name
- Email
- Phone
- WeChat ID
- WhatsApp number
- Address
- Raw assessment answers
- Free-text health notes
- Medication details
- Lab values
- Order comments containing health details

Allowed coarse analytics fields:

- Event name
- Page type
- CTA id
- Chief complaint category
- Risk level
- Consent state
- Product slug
- Evidence state
- Locale
- Anonymous session/report ID

## SEO And Metadata Rules

- Public metadata, Open Graph copy, JSON-LD, sitemap targets, article snippets, and social previews must follow the same claim rules as visible copy.
- Core content should be SSR or SSG where possible.
- Avoid crawler-visible pages where the only meaningful content is `加载中`.
- Personal assessment result pages must be noindex.
- Health content should clearly state education-only use and professional consultation boundaries.

## Lead Capture And Follow-Up Rules

- Report save can request contact details only after the user understands the education-only nature of the result.
- Marketing opt-in must be separate from report delivery or account creation.
- Follow-up copy should start from the assessment report and safety context, not the catalog.
- HIGH risk follow-up must not include product recommendations or purchase CTAs.
- Email and WhatsApp follow-up must avoid disease claims and medicine replacement language.

## PR Compliance Checklist

Every PR that changes user-facing flows, public copy, AI outputs, analytics, SEO, lead capture, product pages, or follow-up must confirm:

- No strictly prohibited claims were added.
- Safer wording is used where health-support language is needed.
- LOW/MEDIUM/HIGH routing behavior is documented.
- HIGH risk paths do not show product purchase CTAs or recommendations.
- Doctor/pharmacist consultation guidance appears for HIGH risk paths.
- Marketing consent is optional, separate, and not pre-checked.
- Analytics payloads exclude PII and raw health answers.
- Personal health result pages are noindex.
- Product Passport evidence and cautions appear before commerce.
- Screenshots are included when UI changed.
- Tests or manual checks are listed.
