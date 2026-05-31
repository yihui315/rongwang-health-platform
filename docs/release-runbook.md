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
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL=https://rongwang.hk`
- `APP_SECRET`
- `JWT_SECRET`
- `RONGWANG_ADMIN_TOKEN`
- `NEXT_PUBLIC_WHATSAPP_CONTACT`
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
npm run build
```

For a local production smoke:

```bash
RONGWANG_ADMIN_TOKEN=<temporary-token> npm run start -- --port 3001
SMOKE_BASE_URL=http://localhost:3001 npm run release:smoke
npm run customer:smoke
```

Confirm `/workspace` redirects to login when unauthorized, `npm run customer:smoke` can submit the AI consult flow into manual review, and `/api/mock/*` write routes reject unauthorized requests.

For admin login checks, local HTTP loopback preview may omit the Secure cookie flag so `http://localhost` and `http://127.0.0.1` smoke tests can save the protected cookie. Production HTTPS must keep the admin cookie Secure.

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
