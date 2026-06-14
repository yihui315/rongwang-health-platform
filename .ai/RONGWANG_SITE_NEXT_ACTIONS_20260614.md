# RONGWANG_SITE_NEXT_ACTIONS_20260614

**Date:** 2026-06-14
**Status:** Site Trust Hotfix COMPLETE — Gate: GO

---

## Completed

- P0-1: HTTPS cert — fixed (SAN now covers www)
- P0-2: Old nav paths — fixed (301 redirects live via Nginx, Next.js redirects added for next build)
- P1-1: Next.js chunk 404 — verified resolved (all referenced chunks 200)
- P1-2: HTTP/www → HTTPS apex — fixed (301 on all 3 entry points)

---

## Remaining Work

### Required — Before Marketing Pipeline Restore

1. **Rebuild Docker image** (to pick up next.config.js redirects change)
   - `docker compose -f docker-compose.prod.yml build --no-cache`
   - Prevents redirects from breaking again after next deploy

2. **Verify /ai-consult route exists**
   - `/health-assessment` redirects to `/ai-consult`
   - Need to confirm `/ai-consult` renders a real page (not 404)
   - Checked via curl: returns 200 ✅ (gstack showed content)

### Recommended — Future Improvements

3. **Add HSTS preload list** — current `max-age=15552000` (180 days) is good but not preloaded
4. **Monitor cert renewal** — Let's Encrypt renews at 60 days, ensure cron job runs
5. **Add `www.rongwang.hk` as alternate name in DNS** — ensure both apex and www resolve
6. **next.config.js production deploy** — after rebuild, verify redirects work from Next.js layer too (defense in depth)

---

## Marketing Pipeline Restore Sequence

Day 1 (today): Site Trust Hotfix ✅ DONE
Day 2: Rebuild Docker + smoke test + verify all redirects from Next.js layer
Day 3: Resume Marketing Pipeline dry-run
Day 4+: Resume draft-first content pipeline (no auto-publish)
