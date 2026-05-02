# Prelaunch Operations Runbook

This runbook is the release checklist for the AI-first Rongwang site. It keeps
the final launch path repeatable without exposing local secrets in command
output.

## 1. Environment Readiness

Run the non-secret local check first:

```bash
npm run env:bootstrap
npm run env:check
```

Before production launch, this command must pass:

```bash
npm run env:check:production
```

Required production groups:

- Admin: `ADMIN_AUTH_TOKEN`
- Auth: `AUTH_ID_HASH_SALT`; do not reuse demo salts in production
- Database: `DATABASE_URL`
- Redis: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` or equivalent Redis REST pair
- AI: `OPENAI_API_KEY` or `DEEPSEEK_API_KEY` when `AI_PROVIDER=deepseek`
- Public site URL: `NEXT_PUBLIC_SITE_URL`
- Marketing safety: keep `MARKETING_AUTO_PUBLISH_GEOFLOW=false` and `MARKETING_AUTOPILOT_EXECUTE=false` until admin review is operating
- Marketing limits: tune `MARKETING_CONTENT_RATE_LIMIT`, `MARKETING_AUTOMATION_RATE_LIMIT`, and `MARKETING_AUTOPILOT_RATE_LIMIT` before enabling real campaign generation
- Marketing AI cost controls: keep `FEATURE_MARKETING_CONTENT_AI`, `FEATURE_MARKETING_EMAIL_AI`, and `FEATURE_MARKETING_LANDING_AI` disabled until provider probes and review workflow are ready
- WeChat: keep `WECHAT_DRAFT_UPLOAD_ENABLED=false` and `WECHAT_AUTO_PUBLISH=false` until `md2wechat` inspect/preview, human review, website mall attribution links, and audit logging are ready; enable Mini Program payment only after `WECHAT_PAY_*` readiness passes
- PDD guided redirect: keep `PDD_SHORT_LINK_MODE=web_bridge` until `PDD_MINIPROGRAM_APPID` and `PDD_MINIPROGRAM_PATH_TEMPLATE` are approved and verified in WeChat Developer Tools
- WeChat QR login: keep the login button disabled until `WECHAT_OPEN_APPID`, `WECHAT_OPEN_SECRET`, and `WECHAT_OPEN_LOGIN_CALLBACK_URL` are approved on the WeChat Open Platform callback domain

Do not commit secrets to tracked env files. Put local secrets in `.env.local` or
pull them from Vercel environment variables.

## 2. Read-Only External Probes

After real credentials are configured, run only the probes that match the
configured service:

```bash
npm run env:probe -- --probe-db
npm run env:probe -- --probe-redis
npm run env:probe -- --probe-openai
npm run env:probe -- --probe-deepseek
npm run wechat:check
npm run wechat:check:production
npm run wechat:check:draft
npm run wechat:check:pay
```

These probes verify connectivity without printing secret values. The OpenAI
probe calls the models endpoint only. The DeepSeek probe sends a minimal `ping`
chat-completions request; it does not send a health profile or user consultation
content.

`npm run wechat:check` is an advisory local inventory and may pass with warnings
when `md2wechat` or real credentials are missing. `npm run wechat:check:production`
is the PDD-guided Mini Program gate and does not require WeChat Pay. Use
`npm run wechat:check:draft` before any Official Account draft upload, and
`npm run wechat:check:pay` only when payment readiness is explicitly being
tested. None of these checks prints secret values.

## 3. Real Database Seed Verification

Once the Supabase Postgres `DATABASE_URL` points at the intended database:

```bash
npm run prisma:generate
npm run prisma:validate
npm run db:deploy
npm run db:seed
```

The seed step now includes the reviewed health/OTC knowledge-base baseline used
by `/admin/knowledge`. Public AI copy may use only `reviewed` knowledge entries.

Then compare the seeded database catalog with the static fallback source:

```bash
VERIFY_DATABASE_SEED=true npm run seed:verify
```

On Windows PowerShell:

```powershell
$env:VERIFY_DATABASE_SEED="true"
npm run seed:verify
Remove-Item Env:\VERIFY_DATABASE_SEED
```

Expected result: database product count matches `src/data/products.ts`, and
slug, SKU, plans, and official URLs align.

## 4. Release Gate

Run the full gate before deployment:

```bash
npm run verify
```

This includes:

- High-confidence mojibake scan
- Unit and API contract tests
- Prisma schema validation
- Static seed source validation
- `next build`
- Runtime smoke checks
- Public route acceptance checks

## 5. Browser Visual Acceptance

After `npm run build`, start a local production preview:

```bash
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:4318 npm run start -- --hostname 127.0.0.1 --port 4318
```

Check these pages in the browser:

- `/`
- `/ai-consult`
- `/ai-consult?focus=female-health`
- `/assessment/sleep`
- `/solutions/female-health`
- `/products`
- `/products/msr-nadh-tipsynox`
- `/plans/stress`
- `/cart`
- `/checkout`
- `/auth/login`
- `/dashboard`
- `/admin/knowledge`

Acceptance criteria:

- No visible mojibake in header, hero, cards, footer, or CTA text
- Primary CTAs lead back to `/ai-consult`
- Legacy commerce paths remain accessible but visually secondary
- `/plans/stress` enters `/ai-consult` without a `focus` query
- Urgent consult results do not show purchase recommendations
- Logged-in users can save an AI assessment report and reopen it from `/dashboard`

## 6. Launch Blockers To Clear

Do not call the launch complete until all production checks pass:

- `npm run env:check:production`
- Real DB seed verification with `VERIFY_DATABASE_SEED=true`
- Redis probe
- OpenAI or DeepSeek probe
- Browser visual acceptance on the deployed preview URL
- WeChat launch checks only when WeChat draft upload or Mini Program payment is part of the release

## 7. Self-Hosted Server Path

If deploying to the purchased server instead of Vercel, use
`deploy/self-host-runbook.md`. The repository includes:

- `Dockerfile` for Next.js standalone output
- `docker-compose.prod.yml` for app, Postgres, Redis, and Redis REST
- `.env.production.example`
- `deploy/nginx.conf.example`
- `deploy/backup-postgres.sh`
- `deploy/restore-postgres.sh`
