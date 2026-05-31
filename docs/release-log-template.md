# Rongwang Release Log Template

Copy this file for each production or production-like launch rehearsal. Keep the completed log with the release archive and do not paste real secrets into the record.

## Release identity

- Release commit:
- Release branch:
- Release timestamp:
- Operator:
- Reviewer:
- Target site:
- Release package path:
- Previous release id:

## Predeploy environment

- `RONGWANG_RELEASE_TARGET=production`:
- `NEXT_PUBLIC_SITE_URL=https://rongwang.hk`:
- `RONGWANG_ADMIN_TOKEN` stored in secret manager, not in this log:
- `APP_SECRET` stored in secret manager, not in this log:
- `JWT_SECRET` stored in secret manager, not in this log:
- `ALLOW_WECHAT_LOGIN_PRODUCTION=false`:
- `ALLOW_WECHAT_STORE_PRODUCTION=false`:
- `ALLOW_PAYMENT_PRODUCTION=false`:
- `ALLOW_AUTOMATED_MARKETING_SEND=false`:
- `ALLOW_AUTO_LISTING_PUBLISH=false`:

Do not deploy if any production switch above is enabled without a signed Manual approval entry for the exact integration.

## Predeploy gate evidence

Paste the final JSON summary for each command. The expected result is `decision: PASS`, empty `failures`, and the documented `gateMode` or scan count.

### `deploy:check JSON`

```json
{
  "decision": "PASS",
  "checks": 0,
  "failures": [],
  "gateMode": "ready"
}
```

### `release:gate JSON`

```json
{
  "decision": "PASS",
  "checks": 0,
  "failures": [],
  "inspectedEnvironment": {
    "gateMode": "production"
  }
}
```

### `compliance:scan JSON`

Default roots are `app,src`. Record `COMPLIANCE_SCAN_ROOTS=<path>` here when checking an archive, release directory, or narrowed package.

```json
{
  "decision": "PASS",
  "scannedFiles": 0
}
```

## Manual approval

Each item must be marked approved, rejected, or not applicable with signer and timestamp. Approval here does not bypass the automated gates.

- WeChat login:
- WeChat store:
- mini program:
- payment:
- automated marketing send:
- auto listing publish:
- health report approval:
- marketing draft approval:
- product copy publication:
- channel listing publication:

## Compliance confirmation

- Product pages preserve `本品不能替代药物`:
- Cross-border pages preserve `本商品符合原产国标准` and the standard-difference notice:
- AI health reports remain `pending_manual_review` when risk is elevated:
- Marketing workflows remain `draft_only` and `manual_approval_required`:
- No treatment, cure, guaranteed-effect, or disease claim was introduced:

## Deploy steps

- Archive created from the Release commit:
- Archive checksum:
- Server release directory:
- `npm ci` completed:
- `RONGWANG_RELEASE_TARGET=production npm run release:gate` completed on server:
- `npm run build` completed on server:
- Symlink switched to current release:
- `systemctl restart rongwang-health-platform` completed:
- `nginx -t` completed:
- `systemctl reload nginx` completed:

## Postdeploy smoke evidence

Paste the final JSON summary for each smoke. The expected result is `decision: PASS`, empty `failures`, and the documented `smokeMode` or funnel metrics.

### `release:smoke JSON` fast funnel

```json
{
  "decision": "PASS",
  "smokeMode": "fast-funnel",
  "checks": 0,
  "failures": []
}
```

### `release:smoke JSON` acceptance

```json
{
  "decision": "PASS",
  "homepageScenarioCardsCount": 8,
  "productCardsFound": 4,
  "trackingHookDetected": true,
  "failures": []
}
```

### `customer:smoke JSON`

```json
{
  "decision": "PASS",
  "smokeMode": "customer-journey",
  "checks": 0,
  "failures": []
}
```

## Manual production checks

- Home page loads:
- `/products` loads approved products only:
- `/ai-consult` accepts a test consultation into manual review:
- `/workspace` redirects unauthorized users to login:
- `/workspace` is reachable after admin login:
- `/compliance` shows required statements:
- `/api/mock/*` write routes reject unauthorized requests:

## Rollback decision

- Rollback decision: not needed / completed / deferred
- Rollback trigger if any:
- Previous release id used:
- Rollback operator:
- Recovery smoke command:
- Recovery smoke result:

If any gate or smoke JSON reports `decision: FAIL`, a non-empty `failures` array, missing `gateMode`, missing required `smokeMode`, or missing funnel/customer evidence, stop the release. If production traffic, customer trust, admin protection, or compliance copy is affected, roll back first, then investigate.

## Incident notes

- What changed:
- What failed or nearly failed:
- Customer impact:
- Follow-up owner:
- Follow-up due date:
