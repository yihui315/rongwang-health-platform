# RONGWANG_SITE_AUDIT_BASELINE_20260614

**Date:** 2026-06-14
**Auditor:** Hermes (MiniMax-M2.7) + gstack browse

---

## Audit Scope

rongwang.hk — 全站路由、HTTPS、SSL、导航链接、JS chunk 完整性。

---

## P0 Issues Found

### P0-1: HTTPS Certificate — CN/SAN Mismatch
- Certificate only covered `rongwang.hk` (apex)
- `www.rongwang.hk` was NOT in the Subject Alternative Name (SAN)
- Browser blocked: `ERR_CERT_COMMON_NAME_INVALID` on `https://www.rongwang.hk`

### P0-2: Stale Navigation Links — 3 Routes 404
All three paths returned 404 on live site:
- `/health-content` → 404 (canonical: `/articles`)
- `/brand-story` → 404 (canonical: `/brand`)
- `/health-assessment` → 404 (canonical: `/ai-consult`)

Root cause: next.config.js had no `redirects()` function. No Nginx rewrite for old paths.

---

## P1 Issues Found

### P1-1: Next.js error chunk 404
```
GET /_next/static/chunks/app/error-882d8a52df5dd4eb.js → 404
```
Appeared in gstack network log on every page. Caused by stale Docker build layer or Nginx proxy caching old HTML that referenced a rebuilt chunk. After Nginx reload and confirming current HTML only references existing chunks: **RESOLVED**.

### P1-2: Missing HTTP → HTTPS + www → apex redirects
| URL | Before | After |
|-----|--------|-------|
| http://rongwang.hk | 301 → https://rongwang.hk ✅ | unchanged |
| http://www.rongwang.hk | 200 (proxied direct) ❌ | 301 → https://rongwang.hk ✅ |
| https://www.rongwang.hk | 200 (proxied direct) ❌ | 301 → https://rongwang.hk ✅ |

---

## Verified Working Before Fix (unchanged)

- Homepage: 200 ✅
- /products: 200 ✅
- /articles: 200 ✅
- /solutions: 200 ✅
- /solutions/sleep: 200 ✅
- /brand: 200 ✅
- sitemap.xml: 200 ✅
- robots.txt: 200 ✅
- SEO meta: title/description/OG/canonical ✅
- No JS console errors ✅

---

## DNS

- rongwang.hk → 38.76.178.75 ✅
- www.rongwang.hk → 38.76.178.75 ✅
- No Cloudflare/CDN in front (direct to origin)
