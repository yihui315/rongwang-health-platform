# Tracking Spec

## Purpose

This spec defines privacy-safe analytics for Rongwang Health Triage Protocol / 荣旺健康分层协议.

Analytics must help measure the protocol funnel without sending PII, raw health answers, or sensitive health details to first-party or third-party analytics systems.

## Existing Tracking Surfaces

Current implementation areas:

- Vendor analytics loader: `src/components/layout/Analytics.tsx`
- First-party event client/schema: `src/lib/analytics.ts`
- First-party analytics API: `src/app/api/analytics/route.ts`
- Analytics persistence: `src/lib/data/analytics-events.ts`

Detected vendor providers:

- Google Analytics 4 via `NEXT_PUBLIC_GA4_ID`
- Meta Pixel via `NEXT_PUBLIC_META_PIXEL_ID`
- Plausible via `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

## Privacy Rules

Never send these fields to analytics:

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
- Diagnosis history
- Order comments containing health details

Allowed coarse properties:

- `page_type`
- `cta_id`
- `chief_complaint`
- `risk_level`
- `risk_bucket`
- `consent_state`
- `product_slug`
- `evidence_state`
- `locale`
- `source`
- `step`
- `anonymous_session_id`
- `anonymous_report_id`

Risk values should be coarse:

- `low`
- `medium`
- `high`
- `urgent`
- `unknown`

## Naming Rules

- Use snake_case event names.
- Use stable CTA IDs rather than button text when possible.
- Use coarse categories rather than user-entered text.
- Do not include disease names, raw symptoms, email, phone, or report content in event names or properties.
- Do not send optional marketing consent text; send only a coarse state such as `opted_in`, `opted_out`, or `not_shown`.

## Protocol Funnel Events

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `home_protocol_viewed` | Homepage protocol hero becomes visible | `page_type`, `locale`, `source` |
| `home_protocol_cta_clicked` | Homepage CTA click | `cta_id`, `page_type`, `source` |
| `chief_complaint_selected` | User selects chief complaint entry | `chief_complaint`, `source` |
| `assessment_started` | Unified assessment begins | `chief_complaint`, `source` |
| `assessment_consent_submitted` | Required consent submitted | `consent_state`, `marketing_consent_state` |
| `assessment_step_completed` | Non-sensitive assessment step completion | `step`, `chief_complaint` |
| `assessment_completed` | Assessment completes | `chief_complaint`, `risk_level` |
| `risk_triage_assigned` | LOW/MEDIUM/HIGH result assigned | `risk_level`, `chief_complaint` |
| `report_save_clicked` | User clicks save report | `risk_level`, `source` |
| `report_saved` | Report save succeeds | `risk_level`, `anonymous_report_id` |
| `lead_capture_viewed` | Lead capture surface appears | `risk_level`, `source` |
| `lead_submitted` | Lead submission succeeds | `risk_level`, `marketing_consent_state`, `channel` |
| `nutrition_direction_viewed` | Eligible result shows support direction | `risk_level`, `chief_complaint` |
| `product_passport_viewed` | Product Passport page/section viewed | `product_slug`, `risk_level`, `evidence_state` |
| `product_suitability_clicked` | User expands suitability/evidence | `product_slug`, `evidence_state` |
| `cross_border_trust_viewed` | Fulfillment trust section viewed | `product_slug`, `source` |
| `purchase_cta_clicked` | Eligible purchase CTA click | `product_slug`, `risk_level`, `source` |
| `whatsapp_followup_clicked` | WhatsApp/customer-service follow-up click | `risk_level`, `source` |
| `email_followup_clicked` | Email follow-up click | `risk_level`, `source` |

## Risk Guardrail Events

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `high_risk_product_cta_suppressed` | Product CTA is suppressed for HIGH/urgent result | `risk_level`, `source` |
| `privacy_payload_rejected` | Analytics payload rejected by validation | `reason_code`, `event_name` |
| `marketing_consent_optional_shown` | Optional marketing consent rendered | `source` |

These guardrail events must not include raw answers or PII.

## Event Property Dictionary

`chief_complaint` allowed values:

- `sleep`
- `fatigue`
- `alcohol_social_recovery`
- `immunity`
- `female_health`
- `male_health`
- `not_sure`

`cta_id` examples:

- `start_free_triage`
- `view_sample_report`
- `ai_help_me_choose`
- `save_report`
- `view_product_passport`
- `contact_customer_service`
- `continue_after_evidence`

`marketing_consent_state` values:

- `opted_in`
- `opted_out`
- `not_shown`

`evidence_state` values:

- `reviewed`
- `partial`
- `under_review`
- `missing`

## Implementation Requirements

- Validate client event payloads before sending to `/api/analytics`.
- Keep vendor analytics calls free of PII and raw health answers.
- Prefer first-party analytics for protocol events, then map only safe aggregate conversion events to vendor providers.
- Add tests for rejected analytics payloads when tracking schema changes.
- Add review notes in each PR listing added or changed events.

## PR Tracking Checklist

Each PR that changes tracking must list:

- Events added.
- Events changed.
- Properties added or removed.
- Whether vendor analytics receives the event.
- Validation tests run.
- Confirmation that no PII or raw health answers are sent.
