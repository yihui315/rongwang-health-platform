# Rongwang Production Release Runbook

## Scope

This runbook prepares the current MVP for release to `https://rongwang.hk/`. It does not approve products, send marketing messages, or publish channel listings automatically. Health reports, marketing plans, and generated copy remain manual review work.

## Release Branch Contract

- production branch: create or update a dedicated production branch from the approved release commit before deploying.
- Current historical production branch: `codex/deployed-rongwang-hk-20260515`.
- Current local development branch may differ from production. Do not deploy directly from a dirty worktree.
- Every release commit must pass `npm run release:verify` before archive creation.

## Required Environment

Set these on the server before restart:

- `NODE_ENV=production`
- `RONGWANG_RELEASE_TARGET=production`
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL=https://rongwang.hk`
- `APP_SECRET`
- `JWT_SECRET`
- `RONGWANG_ADMIN_TOKEN`
- `NEXT_PUBLIC_WHATSAPP_CONTACT`
- `ALLOW_WECHAT_LOGIN_PRODUCTION=false`
- `ALLOW_WECHAT_STORE_PRODUCTION=false`
- `ALLOW_PAYMENT_PRODUCTION=false`
- `ALLOW_AUTOMATED_MARKETING_SEND=false`
- `ALLOW_AUTO_LISTING_PUBLISH=false`
- Optional analytics or error reporting keys such as `SENTRY_DSN`

Never commit real secrets. Rotate any token that was pasted into chat or terminal history.

WeChat and mini program variables are tracked in `.env.example` as launch-readiness placeholders. Do not set production credentials or enable those flows until the gates below are manually approved.

## 微信登录上线闸门

微信登录 is disabled for the MVP unless all of these are confirmed in the release log:

- OAuth 主体: the approved WeChat Open Platform or Official Account主体 matches the operating company and the public privacy terms.
- 回调域名: `WECHAT_OAUTH_CALLBACK_DOMAIN` is verified in WeChat admin and `WECHAT_OAUTH_REDIRECT_URI` points to the production callback.
- 隐私政策: `/privacy` and `/terms` are reachable from the login entry and match the authorization scope.
- Secrets: `WECHAT_OAUTH_APP_ID` and `WECHAT_OAUTH_APP_SECRET` are stored only in the server secret store, never in code, docs, screenshots, or chat.
- Audit: first login must create a traceable customer record with consent time, source, and authorization scope.

If any item is missing, keep WeChat login hidden and keep `/login` on the current admin/customer placeholder path.

## 微信商城 / 小程序上线闸门

微信商城 / 小程序 remain display-and-consultation only until a manual launch review signs off:

- 备案 and required ICP/mini-program filing are complete for the operating主体 and public domain.
- 类目资质 for cross-border health products, OTC-adjacent content, customer service, and after-sales are confirmed.
- 客服 contact, complaint entry, and 退换货 policy are visible before purchase.
- Cross-border pages preserve `本品不能替代药物` and the 跨境标准差异 notice.
- Payment compliance is reviewed before `WECHAT_PAY_APP_ID` or `WECHAT_PAY_MERCHANT_ID` is used in production.
- The release operator confirms: 不得启用站内支付, 不得自动上架, 不得自动发送营销信息.

The public site may link to consultation and manual confirmation only. Product approval, channel listing, payment activation, and marketing sends must stay behind manual review.

## Predeploy Verification

Run locally from the release commit:

```bash
npm ci
npm run release:verify
npm run db:schema-check
npm run build
```

Run the strict production gate with production-shaped environment values before archive creation:

```bash
RONGWANG_RELEASE_TARGET=production npm run release:gate
```

`npm run db:schema-check` runs an offline SQL contract check by default. Before a production release that changes database shape, run the live Postgres execution check against the target database:

```bash
RUN_POSTGRES_SCHEMA_CHECK=true DATABASE_URL=<production-or-staging-postgres-url> npm run db:schema-check
```

The live check applies `database/schema.sql` with idempotent `CREATE TABLE IF NOT EXISTS` statements and verifies the assessment, consent, health report, marketing plan, outbound queue, send event, and audit event tables exist before the app is deployed.

After the schema check passes on staging or a release database clone, run the Postgres assessment smoke:

```bash
RUN_POSTGRES_ASSESSMENT_SMOKE=true DATABASE_URL=<staging-or-release-clone-postgres-url> npm run db:postgres-smoke
```

This writes one test lead, one health report, one marketing plan, and one WeChat private outbound queue entry through the Postgres data backend. The smoke must leave outbound status `blocked`; do not run it against production customer data unless the release operator has approved a disposable smoke record and retention cleanup plan.

To clean up disposable Postgres smoke records after a staging or release-clone run:

```bash
RUN_POSTGRES_SMOKE_CLEANUP=true CONFIRM_POSTGRES_SMOKE_CLEANUP=delete-smoke-records DATABASE_URL=<staging-or-release-clone-postgres-url> npm run db:postgres-smoke-cleanup
```

The cleanup script is destructive and must remain opt-in. It only targets smoke records with source `customer_journey_smoke`, contact prefix `postgres-smoke-`, and consent version `postgres-smoke-2026-06`.

`npm run release:gate` must pass with an HTTPS `NEXT_PUBLIC_SITE_URL`, strong `APP_SECRET`, `JWT_SECRET`, and `RONGWANG_ADMIN_TOKEN` values of at least 32 characters. Do not use placeholder, example, repeated, low-diversity, or shared secret values. The WeChat login, WeChat store, payment, automated marketing send, and auto listing publish switches must remain `false` unless the release log contains manual approval for the exact integration being opened.

Record the JSON summary from each gate in the release log:

- `npm run deploy:check` must end with `decision: PASS`, `gateMode: ready`, a nonzero `checks` count, and an empty `failures` array.
- `npm run release:gate` must end with `decision: PASS`, an empty `failures` array, and `inspectedEnvironment.gateMode: production` for the strict production check. `inspectedEnvironment.gateMode: local-preview` is acceptable only before production-shaped values are loaded.
- `npm run db:schema-check` must end with `decision: PASS`, `mode: offline` for local contract checks or `mode: postgres` for live database checks, and an empty `failures` array.
- `npm run db:postgres-smoke` defaults to `decision: SKIP` unless `RUN_POSTGRES_ASSESSMENT_SMOKE=true` is set. For a live database smoke, it must end with `decision: PASS`, `mode: postgres`, and an empty `failures` array.
- `npm run db:postgres-smoke-cleanup` defaults to `decision: SKIP`. When cleanup is approved, it must be run with `CONFIRM_POSTGRES_SMOKE_CLEANUP=delete-smoke-records` and record the `deleted` counts in the release log.
- `npm run compliance:scan` must end with `decision: PASS`. Use `COMPLIANCE_SCAN_ROOTS=<path>` when spot-checking a built archive, copied release directory, or a narrowed review package outside the default `app,src` roots.

Do not deploy if any JSON summary reports `decision: FAIL`, a non-empty `failures` array, missing `gateMode`, weak secrets, or an enabled high-risk production switch without explicit manual approval. Investigate the failed check, fix it on a new release commit, and restart this section from `npm run release:verify`.

For a production-shaped dry run that does not write secrets, deploy, or enable high-risk integrations:

```bash
npm run release:dry-run
```

This command runs the strict production gate with in-memory dry-run secrets and checks the dry-run release log example. It must report `decision: PASS`, `releaseGate.gateMode: production`, and `releaseLog.decision: PASS` before the real release log is filled.

For a local production smoke:

```bash
npm run release:preview-smoke
```

This command starts a local production preview from the existing `.next` build, waits for it to become reachable, runs the fast funnel, acceptance, and customer journey smoke scripts against the same local server, and then stops the preview process. Confirm it reports `decision: PASS`, no smoke failures, `/workspace` redirects to login when unauthorized, the customer journey can submit the AI consult flow into manual review, and `/api/mock/*` write routes reject unauthorized requests.

For admin login checks, local HTTP loopback preview may omit the Secure cookie flag so `http://localhost` and `http://127.0.0.1` smoke tests can save the protected cookie. Production HTTPS must keep the admin cookie Secure.

## Release Log Verification

After the predeploy gate outputs, manual approvals, compliance checks, and local smoke summaries are copied into the completed release log, run:

```bash
npm run release-log:check -- <completed-release-log.md>
```

The completed release log check must report `decision: PASS` before archive creation, server deployment, or release signoff. Do not declare the release ready if `release-log:check` reports `decision: FAIL`, missing JSON evidence, unsigned manual approvals, unconfirmed compliance checks, or rollback fields that are still blank.

## Artifact Build

Use a clean release commit:

```bash
COMMIT=$(git rev-parse --short HEAD)
git archive --format=tar.gz -o /tmp/rongwang-health-platform-$COMMIT.tgz HEAD
```

Record the commit hash, release timestamp, and operator in the release log before transfer.

## Server Deploy

On the production host:

```bash
RELEASE_ID=<commit-timestamp>
mkdir -p /opt/rongwang-health-platform/releases/$RELEASE_ID
tar -xzf /tmp/rongwang-health-platform-<commit>.tgz -C /opt/rongwang-health-platform/releases/$RELEASE_ID
cd /opt/rongwang-health-platform/releases/$RELEASE_ID
npm ci
RONGWANG_RELEASE_TARGET=production npm run release:gate
npm run build
ln -sfn /opt/rongwang-health-platform/releases/$RELEASE_ID /opt/rongwang-health-platform/current
systemctl restart rongwang-health-platform
nginx -t
systemctl reload nginx
```

## Postdeploy Smoke

Run:

```bash
SMOKE_BASE_URL=https://rongwang.hk npm run release:smoke
SMOKE_BASE_URL=https://rongwang.hk npm run customer:smoke
```

Record these machine-readable smoke summaries:

- Fast funnel smoke must report `decision: PASS`, `smokeMode: fast-funnel`, a nonzero `checks` count, and an empty `failures` array.
- Acceptance smoke must report `decision: PASS`, `homepageScenarioCardsCount >= 8`, `productCardsFound >= 4`, `trackingHookDetected: true`, and an empty `failures` array.
- Customer journey smoke must report `decision: PASS`, `smokeMode: customer-journey`, a nonzero `checks` count, and an empty `failures` array. The submitted lead source must remain `customer_journey_smoke`, health reports must stay `pending_manual_review`, and marketing plans must remain draft/manual-review only.

If any postdeploy smoke summary reports `decision: FAIL`, a non-empty `failures` array, missing `smokeMode` for the fast funnel or customer journey script, or missing tracking/customer-review evidence, stop the release. Roll back first when production traffic is affected, then investigate with the failing JSON field and rerun the complete smoke suite before declaring recovery.

Manually verify:

- `https://rongwang.hk/`
- `https://rongwang.hk/products`
- `https://rongwang.hk/ai-consult`
- `https://rongwang.hk/workspace`
- `https://rongwang.hk/compliance`
- `https://rongwang.hk/api/mock/products`

Compliance spot-check:

- Product and health pages preserve `本品不能替代药物`.
- Cross-border pages preserve source-standard difference notices.
- AI and marketing outputs remain draft/manual review only.
- Marketing workflow remains `draft_only` with `manual_approval_required`.

## Backup

Before a release that changes data shape:

```bash
pg_dump "$DATABASE_URL" > /opt/rongwang-health-platform/backups/rongwang-$(date +%Y%m%d-%H%M%S).sql
```

Keep the previous release directory and `.env` available until postdeploy checks pass.

## Rollback

Rollback triggers:

- Public pages return 5xx.
- `/workspace` or `/api/mock/*` becomes publicly writable.
- Compliance disclaimer disappears.
- Marketing or listing flow starts automatic sending/publishing.

Rollback command:

```bash
ln -sfn /opt/rongwang-health-platform/releases/<previous-release-id> /opt/rongwang-health-platform/current
systemctl restart rongwang-health-platform
nginx -t
systemctl reload nginx
```

After rollback, re-run:

```bash
SMOKE_BASE_URL=https://rongwang.hk npm run release:smoke
```

If the release included database changes, restore only after confirming the rollback target expects the old schema.

## Manual Review Gate

No production release may bypass manual review for:

- health report approval
- marketing draft approval
- product copy publication
- channel listing publication
- payment or purchase flow activation
