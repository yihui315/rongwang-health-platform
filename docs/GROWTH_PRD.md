# Growth PRD: 14-Day Monetization Funnel

## Summary

Goal: launch the fastest monetization funnel for rongwang.hk within 14 days.

North Star Metric: revenue generated within 7 days after AI assessment completion.

Core funnel:

Home -> AI Assessment -> Lead Capture -> Personalized Report -> Scenario Solution -> Product -> WhatsApp/Email Follow-up.

Priority scenarios:

1. Sleep support
2. Fatigue recovery
3. Social drinking / after-entertainment recovery

This PRD positions Rongwang as an assessment-first health education, risk segmentation, nutrition support direction, lifestyle suggestion, and cross-border direct shipping platform. Product guidance must remain suitability-based and compliant, with doctor/pharmacist consultation prompts where risk is elevated.

## Launch Principles

- Lead with user outcomes and scenario clarity before product merchandising.
- Gate commerce by LOW / MEDIUM / HIGH risk routing; HIGH risk paths must not show purchase CTAs.
- Make marketing consent optional, separate, and not pre-checked.
- Keep analytics privacy-safe: do not send raw health answers, phone numbers, emails, or sensitive health data.
- Prefer SSR/SSG for core pages and avoid crawler-visible empty loading states.
- Measure the full funnel from first visit to 7-day post-assessment revenue.

## 14-Day Delivery Plan

| Window | Focus | Ship Criteria |
| --- | --- | --- |
| Days 1-3 | Funnel foundation | Homepage hero, assessment consent, risk routing, and lead capture copy are implemented behind compliant language. |
| Days 4-7 | Conversion surfaces | Personalized report, scenario solution pages, product suitability cards, trust section, and Product Passport fields are live for the three priority scenarios. |
| Days 8-11 | Content and SEO | Article-to-assessment template, schema updates, SSR/SSG fixes, and internal links are live. |
| Days 12-14 | Measurement and follow-up | Analytics events, WhatsApp/email follow-up handoff, QA, screenshots, and compliance review are complete. |

## Module Requirements

### 1. Outcome-Led Homepage Hero

| Field | Detail |
| --- | --- |
| Current pain point | The homepage does not clearly connect the visitor's scenario to the AI assessment and 7-day monetization path. Users may browse products before understanding the assessment value. |
| Implementation logic | Replace product-first hero messaging with an outcome-led scenario selector for sleep support, fatigue recovery, and after-entertainment recovery. Primary CTA starts AI Assessment. Secondary CTA explains privacy and cross-border shipping trust. Hero copy must use health education and nutrition support direction language. |
| Expected lift | Higher assessment starts from qualified visitors and stronger alignment between homepage intent and revenue within 7 days after assessment completion. |
| Acceptance criteria | Hero appears above the fold on desktop and mobile; primary CTA routes to AI Assessment with scenario context; copy avoids restricted health claims; page remains SSR/SSG where possible; analytics records `home_hero_cta_clicked` without sensitive data. |

### 2. Privacy-First Assessment Consent

| Field | Detail |
| --- | --- |
| Current pain point | Users need confidence before sharing health-related answers, and consent must not bundle required assessment consent with marketing follow-up consent. |
| Implementation logic | Add a clear consent step before assessment submission. Required consent covers assessment processing and report generation. Marketing consent is optional, separate, and not pre-checked. Explain that analytics receives only non-sensitive funnel events. |
| Expected lift | Better lead quality and reduced privacy/compliance friction at assessment start and lead capture. |
| Acceptance criteria | Assessment cannot submit without required consent; marketing consent defaults unchecked; privacy text is visible before submission; raw health answers, phone numbers, and emails are excluded from analytics payloads; consent state is stored with timestamp and source. |

### 3. LOW / MEDIUM / HIGH Risk Result Routing

| Field | Detail |
| --- | --- |
| Current pain point | A single result path can over-promote products to users who should receive education, retesting, or professional consultation prompts first. |
| Implementation logic | Route assessment results into LOW, MEDIUM, or HIGH. LOW can show scenario solution and product suitability cards. MEDIUM prioritizes education, lifestyle suggestion, and consult doctor/pharmacist prompts before any soft product direction. HIGH shows no purchase CTA and routes to safety guidance, education, retesting, and professional consultation. |
| Expected lift | Better compliance, trust, and long-term conversion quality by matching CTA intensity to risk level. |
| Acceptance criteria | Result pages render distinct LOW, MEDIUM, and HIGH content states; HIGH has no product purchase CTA; MEDIUM uses cautious education-first language; routing decision is testable from structured assessment output; analytics records only coarse risk segment. |

### 4. Lead Capture After Assessment

| Field | Detail |
| --- | --- |
| Current pain point | Capturing contact details too early can reduce assessment completion, while capturing too late weakens follow-up and 7-day revenue attribution. |
| Implementation logic | Ask for email and/or WhatsApp after assessment completion and before full personalized report access. Show a concise value promise: save report, receive scenario guidance, and get cross-border shipping support. Marketing consent remains optional and separate. |
| Expected lift | More qualified leads because users have already invested in the assessment and understand the report value. |
| Acceptance criteria | Lead capture appears only after assessment completion; users can see required privacy context; marketing consent is not required; contact fields are validated; lead source, scenario, and coarse risk segment are stored; analytics excludes raw contact values. |

### 5. Product Suitability Cards

| Field | Detail |
| --- | --- |
| Current pain point | Product cards can look like generic ecommerce tiles and may not explain why a product is or is not suitable for a user's scenario and risk route. |
| Implementation logic | Add suitability cards that map scenario, eligibility, cautions, ingredient education, and cross-border availability. Cards should show "suitable direction", "not suitable when", and "ask doctor/pharmacist if unsure". Product selection remains rule-based. |
| Expected lift | Higher product click quality and better purchase confidence for LOW-risk users while reducing unsuitable commerce exposure. |
| Acceptance criteria | Cards appear only where allowed by risk routing; HIGH result pages show no purchase CTA; each card includes suitability reason and caution language; card clicks are tracked as `product_suitability_clicked`; no sensitive answer data is included in events. |

### 6. Cross-Border Shipping Trust Section

| Field | Detail |
| --- | --- |
| Current pain point | Users may hesitate because they do not understand shipping origin, customs expectations, delivery timing, support channel, or after-sales process. |
| Implementation logic | Add a trust section near product and scenario conversion points. Cover direct shipping model, expected delivery range, support availability, transparent product identity, and customer service follow-up through WhatsApp/email. |
| Expected lift | Reduced purchase hesitation after scenario solution and product evaluation, improving 7-day post-assessment revenue. |
| Acceptance criteria | Trust section appears on homepage, scenario solution pages, and product detail pages where relevant; wording avoids overpromising delivery or health outcomes; includes support channel CTA; analytics records `shipping_trust_viewed` and `support_followup_clicked`. |

### 7. Product Passport On Product Detail Pages

| Field | Detail |
| --- | --- |
| Current pain point | Product detail pages may not provide enough structured trust signals for cross-border purchase decisions. |
| Implementation logic | Add a Product Passport section with product identity, brand/manufacturer, origin, key ingredients, nutrition support direction, suitability notes, cautions, storage guidance, cross-border shipping notes, and support contact path. |
| Expected lift | Higher confidence on product detail pages and fewer customer service objections before purchase. |
| Acceptance criteria | Product Passport appears on every monetization product detail page; fields are structured and reusable for SEO schema where appropriate; copy uses education and nutrition support wording; cautions are visible before purchase CTA; missing passport data falls back to a visible "under review" state rather than hiding the section. |

### 8. Article-To-Assessment Conversion Template

| Field | Detail |
| --- | --- |
| Current pain point | Articles can generate traffic without pushing visitors into the assessment funnel that drives personalization, lead capture, and follow-up. |
| Implementation logic | Create a reusable article template with scenario intro, education-first body, inline assessment CTA, end-of-article assessment CTA, FAQ, and internal links to relevant scenario solution pages. The CTA should pass article topic and scenario context into AI Assessment. |
| Expected lift | More SEO visitors convert into assessment starts, especially for sleep support, fatigue recovery, and after-entertainment recovery content. |
| Acceptance criteria | Template supports Article and FAQ schema; at least one inline and one final assessment CTA are present; CTAs use scenario context; no restricted claims appear in article conversion copy; analytics records `article_assessment_cta_clicked`. |

### 9. Analytics Events For Full Funnel

| Field | Detail |
| --- | --- |
| Current pain point | Revenue within 7 days after assessment completion cannot be optimized without consistent privacy-safe event coverage across every funnel step. |
| Implementation logic | Add a shared event map for the full funnel: `home_hero_viewed`, `home_hero_cta_clicked`, `assessment_started`, `assessment_consent_submitted`, `assessment_completed`, `lead_capture_viewed`, `lead_submitted`, `report_viewed`, `scenario_solution_viewed`, `product_suitability_clicked`, `product_detail_viewed`, `shipping_trust_viewed`, `purchase_cta_clicked`, `support_followup_clicked`, and `seven_day_revenue_attributed`. |
| Expected lift | Faster funnel diagnosis and clearer prioritization of experiments tied to the North Star Metric. |
| Acceptance criteria | Events use a shared naming convention; payloads include only non-sensitive scenario, coarse risk segment, page type, CTA id, and anonymous/pseudonymous id; raw health answers and contact values are never sent; events are documented for PR review; revenue attribution window is 7 days after assessment completion. |

### 10. SEO Schema And SSR/SSG Improvements

| Field | Detail |
| --- | --- |
| Current pain point | Core funnel pages may lose SEO value or crawler clarity if they rely on client-only rendering or empty loading text. |
| Implementation logic | Make core pages SSR/SSG where possible: Home, AI Assessment entry pages, Scenario Solution pages, Product pages, and article pages. Add structured schema for Organization, Article, FAQ, BreadcrumbList, and Product where appropriate. Keep meaningful server-rendered content visible even when client personalization is loading. |
| Expected lift | Better organic discovery, better AI-search extractability, and higher conversion from scenario traffic to assessment starts. |
| Acceptance criteria | Core pages expose meaningful HTML without client-only loading shells; crawler-visible empty loading text is avoided; relevant schema validates; metadata includes scenario-specific titles and descriptions; internal links connect articles, assessments, scenario solutions, and product pages. |

## Measurement Plan

Primary metric:

- Revenue generated within 7 days after AI assessment completion.

Supporting metrics:

- Home hero CTA click rate
- Assessment start rate
- Assessment completion rate
- Lead capture submit rate
- Report view rate
- Scenario solution click-through rate
- Product suitability click-through rate
- Product detail purchase CTA click rate
- WhatsApp/email follow-up click rate
- 7-day attributed revenue by scenario and coarse risk segment

Privacy constraints:

- Analytics events must not include raw assessment answers, phone numbers, emails, free-text health notes, or sensitive health data.
- Use anonymous or pseudonymous identifiers and coarse segmentation only.

## PR Checklist

Every implementation PR for this PRD must include:

- Business goal
- Files changed
- Screenshots if UI changed
- Tests run
- Analytics events added
- Compliance risks checked
