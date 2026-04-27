# Rongwang Marketing Automation

This document defines the launch-safe marketing automation layer for Rongwang.

## Goal

Turn GEOFlow, AI-first assessment pages, UTM attribution, and marketing generators into one controlled workflow:

1. Plan a campaign.
2. Generate channel assets.
3. Create GEOFlow task drafts for SEO content.
4. Keep all CTAs assessment-first.
5. Track performance through UTM and analytics events.
6. Publish only after compliance review.

## Public Interfaces

- `GET /api/marketing/automation`
  - Returns supported objectives, channels, feature status, and GEOFlow readiness.
- `POST /api/marketing/automation`
  - Requires admin authorization.
  - Returns a structured campaign plan.
  - Defaults to `dry_run`.
  - `execute=true` requires admin authorization and `MARKETING_AUTO_PUBLISH_GEOFLOW=true`.
- `/admin/marketing`
  - Read-first operations dashboard for campaign planning, GEOFlow readiness, and launch checklist.
- `/tools/[slug]`
  - Public free health tools generated from the shared free-tool catalog.
  - Every page keeps the primary CTA on `/ai-consult` and avoids direct product or checkout links.
- `GET /api/marketing/autopilot`
  - Returns the AI marketing autopilot capabilities, rollout flags, and GEOFlow readiness.
- `POST /api/marketing/autopilot`
  - Requires admin authorization.
  - Reads funnel signals, PDD attribution, and GEOFlow status.
  - Returns a run with campaign plans, recommended actions, growth playbooks, free-tool ideas, lifecycle flows, content opportunities, GEOFlow task drafts, and experiments.
  - Defaults to `dry_run`.
  - `execute=true` requires admin authorization, `MARKETING_AUTOPILOT_EXECUTE=true`, and publish-ready GEOFlow settings.

## Channels

- `seo_article`: creates a GEOFlow task draft.
- `landing_page`: creates landing-page copy direction.
- `xiaohongshu`: creates social note direction.
- `wechat`: creates owned-media article direction.
- `douyin`: creates short-video script direction.
- `email`: creates lifecycle email direction.

## Safety Rules

- Primary CTA always points to `/ai-consult`, with `focus=<solution>` when canonical.
- AI can produce content directions, but product recommendations remain rule-based.
- Marketing copy must not diagnose, prescribe, promise treatment, claim 100% efficacy, or imply no risk.
- Urgent health scenarios must point users to professional care, not products.
- GEOFlow publishing is disabled by default.

## GEOFlow Requirements

Set these before enabling auto-publish:

- `GEOFLOW_API_URL`
- `GEOFLOW_API_TOKEN`
- `GEOFLOW_DEFAULT_TITLE_LIBRARY_ID`
- `GEOFLOW_DEFAULT_PROMPT_ID`
- `GEOFLOW_DEFAULT_AI_MODEL_ID`

Optional:

- `GEOFLOW_DEFAULT_IMAGE_LIBRARY_ID`
- `GEOFLOW_DEFAULT_AUTHOR_ID`
- `GEOFLOW_DEFAULT_KNOWLEDGE_BASE_ID`
- `GEOFLOW_DEFAULT_CATEGORY_ID`
- `GEOFLOW_DEFAULT_DRAFT_LIMIT`
- `GEOFLOW_DEFAULT_PUBLISH_INTERVAL`

## Launch Mode

Recommended production default:

```env
FEATURE_MARKETING_AUTOMATION=true
FEATURE_MARKETING_AUTOPILOT=true
FEATURE_MARKETING_CONTENT_AI=false
FEATURE_MARKETING_EMAIL_AI=false
FEATURE_MARKETING_LANDING_AI=false
MARKETING_AUTOMATION_RATE_LIMIT=12
MARKETING_AUTOPILOT_RATE_LIMIT=12
MARKETING_EMAIL_RATE_LIMIT=12
MARKETING_LANDING_RATE_LIMIT=12
MARKETING_AUTO_PUBLISH_GEOFLOW=false
MARKETING_AUTOPILOT_EXECUTE=false
```

When the GEOFlow defaults are verified and admin review is ready:

```env
MARKETING_AUTO_PUBLISH_GEOFLOW=true
```

Only after dry-run, compliance review, and GEOFlow publishing checks are passing:

```env
MARKETING_AUTOPILOT_EXECUTE=true
```

Use `execute=true` only from an authenticated admin context. The autopilot is intentionally conservative: if GEOFlow is missing, if defaults are incomplete, or if compliance warnings exist, it stays in `dry_run`.
Keep `FEATURE_MARKETING_CONTENT_AI`, `FEATURE_MARKETING_EMAIL_AI`, and `FEATURE_MARKETING_LANDING_AI` disabled until provider cost controls, logs, and admin review are confirmed; fallback generation remains deterministic and assessment-first.

## Autopilot Signals

The autopilot combines:

- Assessment start and completion counts.
- Free-tool completion counts such as `tool_completed`.
- Recommendation click rate.
- PDD redirect rate.
- Top traffic sources.
- Top clicked solution types.
- GEOFlow credential and default-library readiness.

The output is a controlled operations run, not a black-box publishing bot. It always keeps `/ai-consult` as the primary CTA and keeps product recommendations behind the rule engine.

## Growth Playbook Engine

The autopilot now translates the useful parts of `Marketing-for-Founders` into Rongwang-safe operating playbooks:

- `aeo_geo_cluster`: LLM SEO / AEO / GEO content clusters for assessment and solution pages.
- `free_tool`: free mini tools that lead users into the full AI assessment.
- `lifecycle_email`: behavior-based education emails for incomplete or stalled journeys.
- `social_listening`: Xiaohongshu, Zhihu, Douyin, and WeChat topic briefs from user questions.
- `cro_experiment`: conversion experiments for forms, recommendation cards, and PDD bridge pages.
- `launch_directory`: AI/health directory and community launch checklists.
- `content_distribution`: repurposing one education page into multiple channel assets.
- `referral_affiliate`: draft-only referral and partner materials for later governance.

Every playbook is `draft` by default and carries the same guardrails: assessment-first CTA, medical compliance, no automatic external publishing, rule-based product recommendations, and UTM attribution.
