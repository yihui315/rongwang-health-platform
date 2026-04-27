# Rongwang Health

Rongwang is an assessment-first health commerce site built with Next.js.
The current upgrade path keeps the existing user flow intact while adding a
formal data foundation for products, consultations, and future AI logging.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase compatibility layer
- Prisma for the new database foundation

## Current product direction

The primary site flow stays:

`/` -> `/ai-consult` -> `/assessment/[type]` / `/solutions/[slug]` -> `/product-map/[id]`

The site remains assessment-first. Product pages and checkout routes still
exist, but they are not the main upgrade focus in this phase.

## Package 1 foundation work

Package 1 adds:

- `docs/upgrade-plan.md` to freeze routing and data authority decisions
- `prisma/schema.prisma` and `src/lib/prisma.ts`
- `prisma/seed.ts` for product seeding
- `src/lib/data/*` as the migration-safe data-access layer

## Environment variables

Use `.env.example` as the source of truth for local setup.

Important groups:

- `NEXT_PUBLIC_SUPABASE_*` for the current compatibility layer
- `DATABASE_URL` and `DIRECT_URL` for Prisma
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for cross-instance rate limiting
- `ADMIN_AUTH_TOKEN` to protect `/admin` in production
- `GEOFLOW_*` for CMS access
- `AI_*`, `COPILOT_*`, `OLLAMA_*`, `OPENAI_*`, `DEEPSEEK_*` for AI provider rollout
- `FEATURE_*` for grey-release switches around AI provider calls, DB recommendation rules, analytics persistence, and marketing automation
- `MARKETING_*_RATE_LIMIT` and `MARKETING_*_RATE_WINDOW_MS` to throttle admin-only marketing generation endpoints

Rate limiting uses Redis REST when configured. If Redis variables are empty,
the app falls back to in-memory limits so local development still works.

## Useful commands

```bash
npm run dev
npm run build
npm run test
npm run mojibake:scan
npm run env:check
npm run env:check:production
npm run env:bootstrap
npm run prisma:validate
npm run prisma:generate
npm run db:deploy
npm run seed:verify
npm run smoke
npm run acceptance
npm run verify
npm run db:seed
npm run env:bootstrap:production
npm run env:check:selfhost
npm run docker:build
npm run docker:up
```

## Marketing automation

The automated marketing layer lives at `/admin/marketing`, `/api/marketing/automation`, and `/api/marketing/autopilot`.
It creates AI-first campaign plans, GEOFlow SEO task drafts, UTM-tracked CTAs, compliance warnings, and funnel-signal-based next actions.
Keep `MARKETING_AUTO_PUBLISH_GEOFLOW=false` and `MARKETING_AUTOPILOT_EXECUTE=false` until the real GEOFlow IDs and admin review process are configured.
All marketing POST endpoints are admin-only and rate-limited; use `/admin/login` or the `x-admin-token` header for server-to-server automation.
See `docs/marketing-automation.md`.

## Migration note

During the migration period:

- Product reads can fall back to `src/data/products.ts`
- Consultation reads can fall back to existing Supabase tables
- GEOFlow content can fall back to static article data

To strictly compare seeded database products with the static source, run
`VERIFY_DATABASE_SEED=true npm run seed:verify` after `npm run db:seed`.

## Pre-launch operations

- `npm run mojibake:scan` blocks high-confidence mojibake in public source files before release.
- `npm run env:check` reports local environment readiness without printing secret values.
- `npm run env:check:production` applies production-required checks for DB, Redis, OpenAI, and admin auth.
- `npm run env:probe -- --probe-db`, `--probe-redis`, `--probe-openai`, or `--probe-deepseek` can run external connectivity probes when real credentials are configured.
- `npm run acceptance` starts the built Next.js app and checks key public pages, redirects, and high-confidence mojibake markers.

See `docs/prelaunch-operations.md` for the full Supabase/Redis/OpenAI setup,
real DB seed verification, and browser visual acceptance runbook.
For the purchased self-hosted server path, see `deploy/self-host-runbook.md`.
