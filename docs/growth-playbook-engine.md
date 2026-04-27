# Rongwang Growth Playbook Engine

This document defines how Rongwang absorbs the useful parts of `Marketing-for-Founders` into a safe, automated operations system.

## Goal

Turn founder-growth methods into structured, auditable, draft-first workflows:

1. Read funnel and attribution signals.
2. Pick the most relevant growth playbooks.
3. Generate campaign plans, GEOFlow drafts, content opportunities, lifecycle flows, free-tool ideas, and CRO experiments.
4. Keep every CTA assessment-first.
5. Require human review before any external publishing.

## Playbooks

- `aeo_geo_cluster`: Builds AI-search-friendly education clusters around canonical health solutions.
- `free_tool`: Proposes mini tools such as sleep score, fatigue check, and female-health check.
- `lifecycle_email`: Creates education-first email flows based on user behavior.
- `social_listening`: Converts high-intent user questions into content briefs for Chinese channels.
- `cro_experiment`: Recommends reversible experiments when funnel rates are weak.
- `launch_directory`: Creates launch and directory submission packs.
- `content_distribution`: Repurposes one education asset into multiple channel briefs.
- `referral_affiliate`: Keeps referral and partner materials draft-only until governance exists.

## Selection Rules

- No funnel data: prioritize `aeo_geo_cluster`, `free_tool`, and `launch_directory`.
- Low assessment completion: prioritize `cro_experiment` and `lifecycle_email`.
- Free-tool completions: use `tool_completed` as the handoff signal into the full AI assessment path.
- Low recommendation click rate: prioritize `content_distribution`, `lifecycle_email`, and recommendation-card CRO.
- Low PDD redirect rate: prioritize PDD bridge CRO and buying-education content.
- Existing PDD click data: allow draft-only referral and partner-material planning.
- No obvious weakness: continue `social_listening` and `content_distribution`.

## Guardrails

All playbooks must include:

- `assessment_first`: primary CTA points to `/ai-consult`, optionally with `focus=<solution>`.
- `medical_compliance`: health education only; no diagnosis, prescription, or treatment promise.
- `no_auto_external_publish`: outputs are drafts unless admin and production gates are explicitly enabled.
- `rule_based_products`: AI does not decide product sales.
- `utm_required`: campaign assets must be attributable.

## Interfaces

- `src/lib/marketing/playbooks.ts`: playbook definitions and selector.
- `src/lib/marketing/free-tools.ts`: canonical free-tool definitions used by playbooks and public pages.
- `src/lib/marketing/autopilot.ts`: merges playbooks into each autopilot run.
- `GET /api/marketing/autopilot`: exposes capabilities and available playbooks.
- `POST /api/marketing/autopilot`: returns a dry-run operational plan.
- `/tools/[slug]`: public free-tool landing pages that route users into `/ai-consult`.
- `/admin/marketing`: shows recommended playbooks and generated opportunities.

## Launch Safety

The system should stay in dry-run until real Supabase, Redis, GEOFlow, and AI provider credentials are configured and verified. Even then, external publishing requires admin authorization and explicit production flags.
