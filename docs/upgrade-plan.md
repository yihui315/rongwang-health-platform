# Rongwang Upgrade Plan

## Decisions frozen in Package 1

- Keep the site assessment-first. The primary user flow remains `/` -> `/ai-consult` -> `/solutions/[slug]` -> `/product-map/[id]`.
- Keep the current solution route slugs as canonical for now: `sleep`, `fatigue`, `liver`, `immune`, `male-health`, `female-health`.
- Keep `/articles` as the canonical content path in this phase. `/blog` is reserved for a future alias or migration, not for Package 1.
- Keep legacy commerce routes (`/products`, `/cart`, `/checkout`, `/plans/*`, `/subscription`) available, but they are not the main upgrade focus.
- Use `Supabase Postgres + Prisma` as the long-term database foundation. Existing Supabase access stays in place as compatibility fallback during migration.

## Data authority

- Product catalog: Prisma `Product` table is the long-term source of truth.
- Product fallback during migration: `src/data/products.ts`.
- Consultations: Prisma `Consultation` table is the target source of truth.
- Consultation fallback during migration: existing Supabase tables and current route persistence.
- CMS content: GEOFlow remains the preferred content source, with `src/data/articles.ts` as fallback.

## Package sequence

1. Package 1: architecture freeze, Prisma scaffold, data-access foundation.
2. Package 2: schema normalization, AI provider abstraction, audit-ready consult pipeline.
3. Package 3: UI decomposition, streaming consult experience, recommendation and redirect hardening.

## Execution status on 2026-04-26

| Range | Status | Notes |
| --- | --- | --- |
| T01-T06 | Complete for MVP | Architecture decisions are frozen, Prisma is scaffolded, core models exist, product seed/data-access fallback exists, and product reads for pages/APIs now prefer the data-access layer. Static `src/data/products.ts` remains as the explicit fallback/seed source. |
| T07-T10 | Complete for MVP | `HealthProfile`, AI result schema, AI log schema, slug/type mappings, and shared safety rules exist. Urgent behavior is centralized in `src/lib/health/safety.ts`. |
| T11-T14 | Complete for MVP | Provider abstraction, prompts, parser, consult orchestration, AI logging, and rule fallback are in place. `/api/ai/consult` follows validation -> rate limit -> safety -> model/rule fallback -> parse -> recommendation -> persistence. `FEATURE_AI_PROVIDER` can disable model calls for rollout safety. |
| T15 | Complete | Consultation UI now has `ConsultForm`, `ConsultResult`, `RiskCard`, `RecommendationPanel`, `ConsultStream`, and response shell boundaries. |
| T16 | Complete | The UI exposes a deterministic analysis progress layer and `/api/ai/consult/stream` provides a text/event-stream transport. Final cards remain structured JSON-driven. |
| T17 | Complete for MVP | Validation, 429/server failure, parse/fallback, loading, empty recommendation, and retry/reset states are represented in the consult UI. |
| T18 | Complete | Legacy `/quiz` now routes into `/ai-consult`, preserving canonical `focus` only for allowed solution slugs. |
| T19-T20 | Complete | Recommendation engine now prefers DB-backed `RecommendationRule` records, falls back to static plan mapping, preserves urgent empty recommendations, and admin rules page supports priority/active maintenance through protected PATCH APIs. |
| T21 | Complete for MVP | `/product-map/[id]` and `/api/pdd/click` track session, consultation, source, solution, ref, UTM, destination URL, and use Prisma-first persistence with Supabase fallback. |
| T22 | Complete for consultation flows | `/ai-consult` urgent results suppress recommendations and purchase links. Static evergreen solution pages remain educational content pages; purchase CTAs there are not tied to a user-specific urgent result. |
| T23-T27 | Complete for MVP operations | Admin auth middleware exists, product/rule/consultation/AI-log/click analytics views are available, product and rule maintenance is protected by admin-token PATCH APIs, and admin pages prefer Prisma-backed data with migration fallbacks. |
| T28 | Complete for MVP | Sitemap, robots, centralized site URL, and route metadata align with the AI-first IA. `/articles` remains canonical content path; `/product-map` and admin surfaces are kept out of indexing. |
| T29 | Complete for MVP | Rate limiting is Redis REST first with memory fallback. Feature flags support grey release for AI provider calls, DB recommendation rules, and analytics persistence. |
| T30-T32 | Complete for MVP | Analytics events persist through `AnalyticsEvent`, admin analytics shows core funnel metrics, API contract/unit tests cover safety/recommendations/rate limit/attribution/consult, stream and click routes, product seed verification is part of `npm run verify`, runtime smoke checks cover the deployed Next server, and CI runs `npm run verify`. |

## Guardrails

- Do not bypass `src/lib/health/safety.ts`.
- Do not allow AI to directly choose commercial products.
- Do not expose purchase CTA in `urgent` flows.
- Do not replace the current consult flow until Prisma and data-access are in place.
