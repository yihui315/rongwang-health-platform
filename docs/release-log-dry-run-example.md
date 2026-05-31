# Rongwang Release Log Dry Run Example

This is a dry run release log example for launch rehearsal only. It contains no real secrets, no real production approval, and no evidence that payment, WeChat commerce, automated marketing send, or auto listing publish should be enabled.

## Release identity

- Release commit: 5ed0864
- Release branch: codex/release-runbook-smoke-gates
- Release timestamp: 2026-05-31T20:30:00+08:00
- Operator: Dry Run Operator
- Reviewer: Dry Run Compliance Reviewer
- Target site: https://rongwang.hk
- Release package path: /tmp/rongwang-health-platform-5ed0864-dry-run.tgz
- Previous release id: dry-run-previous-release

## Predeploy environment

- `RONGWANG_RELEASE_TARGET=production`: confirmed for dry run with production-shaped values
- `NEXT_PUBLIC_SITE_URL=https://rongwang.hk`: confirmed for dry run
- `RONGWANG_ADMIN_TOKEN` stored in secret manager, not in this log: confirmed, no real secrets recorded
- `APP_SECRET` stored in secret manager, not in this log: confirmed, no real secrets recorded
- `JWT_SECRET` stored in secret manager, not in this log: confirmed, no real secrets recorded
- `ALLOW_WECHAT_LOGIN_PRODUCTION=false`: confirmed
- `ALLOW_WECHAT_STORE_PRODUCTION=false`: confirmed
- `ALLOW_PAYMENT_PRODUCTION=false`: confirmed
- `ALLOW_AUTOMATED_MARKETING_SEND=false`: confirmed
- `ALLOW_AUTO_LISTING_PUBLISH=false`: confirmed

Do not deploy if any production switch above is enabled without a signed Manual approval entry for the exact integration.

## Predeploy gate evidence

### `deploy:check JSON`

```json
{
  "decision": "PASS",
  "checks": 32,
  "failures": [],
  "gateMode": "ready"
}
```

### `release:gate JSON`

```json
{
  "decision": "PASS",
  "checks": 17,
  "failures": [],
  "inspectedEnvironment": {
    "gateMode": "production"
  }
}
```

### `compliance:scan JSON`

Default roots are `app,src`. Dry run used the default roots.

```json
{
  "decision": "PASS",
  "scannedFiles": 102
}
```

## Manual approval

Each entry below is a dry run signature for rehearsal only.

- WeChat login: not applicable, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- WeChat store: not applicable, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- mini program: not applicable, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- payment: not applicable, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- automated marketing send: not applicable, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- auto listing publish: not applicable, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- health report approval: approved, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- marketing draft approval: approved, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- product copy publication: approved, signer Dry Run QA, 2026-05-31T20:35:00+08:00
- channel listing publication: not applicable, signer Dry Run QA, 2026-05-31T20:35:00+08:00

## Compliance confirmation

- Product pages preserve `本品不能替代药物`: confirmed
- Cross-border pages preserve `本商品符合原产国标准` and the standard-difference notice: confirmed
- AI health reports remain `pending_manual_review` when risk is elevated: confirmed
- Marketing workflows remain `draft_only` and `manual_approval_required`: confirmed
- No treatment, cure, guaranteed-effect, or disease claim was introduced: confirmed

## Deploy steps

- Archive created from the Release commit: completed in dry run
- Archive checksum: dry-run-checksum-not-for-production
- Server release directory: dry-run only, no production server updated
- `npm ci` completed: completed in dry run
- `RONGWANG_RELEASE_TARGET=production npm run release:gate` completed on server: completed in dry run with production-shaped values
- `npm run build` completed on server: completed in dry run
- Symlink switched to current release: not applicable for dry run
- `systemctl restart rongwang-health-platform` completed: not applicable for dry run
- `nginx -t` completed: not applicable for dry run
- `systemctl reload nginx` completed: not applicable for dry run

## Postdeploy smoke evidence

### `release:smoke JSON` fast funnel

```json
{
  "decision": "PASS",
  "smokeMode": "fast-funnel",
  "checks": 19,
  "failures": []
}
```

### `release:smoke JSON` acceptance

```json
{
  "decision": "PASS",
  "homepageScenarioCardsCount": 8,
  "productCardsFound": 8,
  "trackingHookDetected": true,
  "failures": []
}
```

### `customer:smoke JSON`

```json
{
  "decision": "PASS",
  "smokeMode": "customer-journey",
  "checks": 29,
  "failures": []
}
```

## Manual production checks

- Home page loads: confirmed in dry run
- `/products` loads approved products only: confirmed in dry run
- `/ai-consult` accepts a test consultation into manual review: confirmed in dry run
- `/workspace` redirects unauthorized users to login: confirmed in dry run
- `/workspace` is reachable after admin login: confirmed in dry run
- `/compliance` shows required statements: confirmed in dry run
- `/api/mock/*` write routes reject unauthorized requests: confirmed in dry run

## Rollback decision

- Rollback decision: not needed
- Rollback trigger if any: none in dry run
- Previous release id used: dry-run-previous-release
- Rollback operator: Dry Run Operator
- Recovery smoke command: not needed for dry run
- Recovery smoke result: not needed for dry run

## Incident notes

- What changed: Dry run example validates the release log verification workflow.
- What failed or nearly failed: Nothing in this dry run.
- Customer impact: None, no production traffic changed.
- Follow-up owner: Launch Operator
- Follow-up due date: 2026-06-01
