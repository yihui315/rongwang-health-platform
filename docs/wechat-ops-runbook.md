# WeChat Operations Runbook

This runbook covers Rongwang's launch-safe WeChat workflow. It separates
Official Account content operations from Mini Program commerce so that content
automation never accidentally becomes payment or publishing automation.

## 0. Skill And Platform Boundaries

Installed skill references for this launch track:

- `md2wechat`: Official Account inspect, preview, conversion, and guarded draft upload.
- `miniprogram-development`: native Mini Program structure, `project.config.json`, pages, preview, and release workflow.
- `auth-wechat-miniprogram`: Mini Program identity rules. Rongwang currently fails closed through the website API until real AppID/Secret are configured.
- `wechatpay-basic-payment`: payment readiness reference only. The first release does not enable in-mini-program payment.

Rongwang keeps the website as the health and product authority. The Mini Program is a native display and guided-redirect surface, not a diagnosis flow and not a payment terminal in this phase.

## 1. Official Account Content Flow

The default flow is review-first:

```txt
marketing campaign plan
-> WeChat Markdown article
-> md2wechat inspect
-> md2wechat preview
-> human compliance review
-> optional draft upload
```

Draft upload is disabled unless `WECHAT_DRAFT_UPLOAD_ENABLED=true`.
Publishing is blocked unless `WECHAT_AUTO_PUBLISH=false` is changed in production, admin authorization is valid, compliance passes, and audit logging is available. The safe default is `WECHAT_AUTO_PUBLISH=false`.

Required before draft upload:

- `WECHAT_APPID`
- `WECHAT_SECRET`
- `WECHAT_DEFAULT_COVER_PATH` or `WECHAT_DEFAULT_COVER_MEDIA_ID`
- `md2wechat` CLI installed on `PATH`

Useful commands:

```bash
npm run wechat:check
npm run wechat:check:production
npm run wechat:check:draft
npm run wechat:check:pay
npm run wechat:article -- --campaign=sleep-support --solution=sleep --keyword="sleep support"
npm run wechat:inspect -- --file=content/wechat/sleep-support.md
npm run wechat:preview -- --file=content/wechat/sleep-support.md
npm run wechat:draft -- --file=content/wechat/sleep-support.md
```

`wechat:check` is a local advisory inventory. `wechat:inspect` and
`wechat:preview` run the local md2wechat review steps without Official Account
credentials. `wechat:check:draft` is the hard gate for draft upload and
requires `md2wechat`, Official Account credentials, and a cover.
`wechat:check:production` is the PDD-guided Mini Program gate and does not
require WeChat Pay. `wechat:check:pay` is reserved for a future payment launch.

Read-only readiness API:

```txt
GET /api/wechat/status
```

This endpoint returns sanitized Official Account, Mini Program, and WeChat Pay
readiness metadata. It never returns AppSecret, payment keys, private keys, or
raw credentials.

## 2. Content Guardrails

Every WeChat article must remain assessment-first:

- Primary CTA points to `/ai-consult`, with `focus=<slug>` when canonical.
- Secondary website mall links may point to `/products` with WeChat UTM attribution after the assessment CTA.
- Copy is health education only; it must not diagnose, prescribe, or promise treatment effects.
- Product mentions stay secondary and rule-based.
- Do not link Official Account content directly to `/checkout` or raw PDD URLs.
- Urgent health scenarios point users to professional care and do not show purchase CTAs.
- All generated drafts keep UTM attribution for campaign analysis.
- Automatic publish attempts write an audit event and must not include `WECHAT_SECRET` or other credentials in logs.

## 3. Mini Program Commerce Flow

Mini Program commerce is a separate launch track. It uses the shared product
data layer but does not reuse the Official Account article pipeline.

The first Mini Program release keeps WeChat Pay disabled and supports two
controlled handoffs: Rongwang website mall links for owned product pages, and
PDD guided redirect for the first commerce close. PDD guided redirect is
controlled by:

- `PDD_SHORT_LINK_MODE=web_bridge|copy_link|mini_program`
- `PDD_LINK_FALLBACK_MODE=web_bridge|copy_link|customer_service`
- `PDD_MINIPROGRAM_APPID`
- `PDD_MINIPROGRAM_PATH_TEMPLATE`

When `PDD_SHORT_LINK_MODE=mini_program`, production readiness requires both PDD Mini Program values. If the values are missing or WeChat review blocks direct launch, use `web_bridge` or `copy_link` as fallback. Mini Program product APIs must not expose raw `pddUrl`; website mall actions should point only to Rongwang-owned product pages and never direct checkout.

MVP API contracts:

- `GET /api/wechat/status`
- `POST /api/wechat/miniprogram/login`
- `GET /api/wechat/miniprogram/products`
- `POST /api/wechat/miniprogram/orders`
- `POST /api/wechat/pay/prepay`
- `POST /api/wechat/pay/notify`

Required before real payment launch:

- `WECHAT_MINIPROGRAM_APPID`
- `WECHAT_MINIPROGRAM_SECRET`
- `WECHAT_PAY_MCH_ID`
- `WECHAT_PAY_API_V3_KEY`
- `WECHAT_PAY_CERT_SERIAL_NO`
- `WECHAT_PAY_PRIVATE_KEY`
- `WECHAT_PAY_NOTIFY_URL`

## 4. Launch Gate

Before enabling PDD-guided Mini Program release checks, run:

```bash
npm run test
npm run prisma:validate
npm run wechat:check:production
```

Before enabling Official Account draft upload, also run:

```bash
npm run wechat:check:draft
```

Before any future WeChat Pay launch, also run:

```bash
npm run wechat:check:pay
```

Keep the main website release gate independent from WeChat CLI availability:
`npm run verify` must continue to pass even when `md2wechat` is not installed.
