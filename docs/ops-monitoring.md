# Rongwang Ops Monitoring

## Daily Route Checks

Check these routes daily after launch:

- `https://rongwang.hk/`
- `https://rongwang.hk/products`
- `https://rongwang.hk/ai-consult`
- `https://rongwang.hk/workspace`
- `https://rongwang.hk/compliance`
- `https://rongwang.hk/api/mock/products`

Expected behavior:

- Public pages return 200 and render compliant health education copy.
- `/workspace` redirects unauthorized users to login.
- `/api/mock/products` can be read publicly only if it exposes approved-safe data.
- Mutating `/api/mock/*` routes reject unauthorized requests.

## Automated Checks

Run after each deploy and at least once daily during the first week:

```bash
SMOKE_BASE_URL=https://rongwang.hk npm run release:smoke
npm run customer:smoke
npm run compliance:scan
```

`npm run customer:smoke` submits a test lead with source `customer_journey_smoke`. In the workspace, use the Smoke filter to review or hide these records so operators do not mix them with real customers.

Run a full predeploy verification before any new release:

```bash
npm run release:verify
```

## Security Signals

Investigate immediately when:

- unauthorized workspace access succeeds
- unauthorized API mutation succeeds
- admin login accepts an unexpected token
- `RONGWANG_ADMIN_TOKEN` is missing in production
- a secret appears in repository files or logs

## Compliance Signals

Investigate immediately when:

- `本品不能替代药物` disappears from product or health education surfaces
- cross-border standard-difference copy disappears
- product copy uses disease treatment or cure claims
- marketing plans are no longer `draft_only`
- review gates are no longer manual

## Operational Signals

Investigate immediately when:

- homepage, product, AI consult, workspace, compliance, or mock product APIs return 5xx
- smoke or acceptance checks fail
- console errors block lead capture, report generation, or workspace review
- `.rongwang-data` grows unexpectedly or cannot be written

## Escalation

1. Capture the failing URL, timestamp, status code, and last release id.
2. Pause any manual promotion of generated product or marketing copy.
3. Run `npm run compliance:scan`, `SMOKE_BASE_URL=https://rongwang.hk npm run release:smoke`, and `SMOKE_BASE_URL=https://rongwang.hk npm run customer:smoke`.
4. If the failure affects public trust, admin auth, compliance, or write safety, rollback using `docs/release-runbook.md`.

## Post-Launch Review

During the first seven days, record:

- daily smoke result
- daily compliance scan result
- admin login/workspace access result
- lead capture and AI consult result
- count of `customer_journey_smoke` Smoke records reviewed or hidden from daily customer follow-up
- any rollback or hotfix decision
