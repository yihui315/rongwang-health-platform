# RONGWANG_SITE_HOTFIX_TEST_REPORT_20260614

**Hotfix ID:** RONGWANG_SITE_TRUST_HOTFIX_20260614
**Test Date:** 2026-06-14
**Tester:** Hermes (MiniMax-M2.7) + gstack browse

---

## Test Results

### HTTPS / SSL
| Test | Result |
|------|--------|
| https://rongwang.hk loads without cert error | ✅ PASS |
| https://www.rongwang.hk loads without cert error | ✅ PASS |
| Certificate SAN covers rongwang.hk | ✅ PASS |
| Certificate SAN covers www.rongwang.hk | ✅ PASS |
| Cert not expired | ✅ PASS (expires 2026-09-12) |

### HTTP → HTTPS
| URL | Expected | Actual | Result |
|-----|----------|--------|--------|
| http://rongwang.hk | 301 → https://rongwang.hk | 301 → https://rongwang.hk/ | ✅ PASS |
| http://www.rongwang.hk | 301 → https://rongwang.hk | 301 → https://rongwang.hk/ | ✅ PASS |

### www → apex
| URL | Expected | Actual | Result |
|-----|----------|--------|--------|
| https://www.rongwang.hk | 301 → https://rongwang.hk | 301 → https://rongwang.hk/ | ✅ PASS |

### Old Path Redirects (Nginx — live)
| Path | Destination | Result |
|------|-------------|--------|
| /health-content | /articles | ✅ 301 |
| /brand-story | /brand | ✅ 301 |
| /health-assessment | /ai-consult | ✅ 301 |

### Canonical Paths — HTTP Status
| Path | Expected | Actual | Result |
|------|----------|--------|--------|
| / | 200 | 200 | ✅ |
| /products | 200 | 200 | ✅ |
| /articles | 200 | 200 | ✅ |
| /solutions | 200 | 200 | ✅ |
| /solutions/sleep | 200 | 200 | ✅ |
| /brand | 200 | 200 | ✅ |
| /ai-consult | 200 | 200 | ✅ |
| /sitemap.xml | 200 | 200 | ✅ |
| /robots.txt | 200 | 200 | ✅ |
| /products/bundles/heart-male | 200 | 200 | ✅ |

### Browser Console
| Check | Result |
|-------|--------|
| Homepage — no JS errors | ✅ PASS |
| Homepage — no 404 network errors (chunks) | ✅ PASS |
| www.rongwang.hk — auto-redirects to apex | ✅ PASS |

### Next.js Chunk Integrity
| Chunk | Status | Result |
|-------|--------|--------|
| /_next/static/chunks/app/error-882d8a52df5dd4eb.js | 200 | ✅ (normal Next.js error chunk) |
| /_next/static/chunks/app/layout-*.js | 200 | ✅ |
| /_next/static/chunks/app/page-*.js | 200 | ✅ |
| /_next/static/chunks/webpack-*.js | 200 | ✅ |

---

## All 11 CEO Gate Conditions

| # | Condition | Status |
|---|-----------|--------|
| 1 | https://rongwang.hk browser accessible | ✅ |
| 2 | https://www.rongwang.hk 301 to apex | ✅ |
| 3 | http://rongwang.hk 301 to https | ✅ |
| 4 | http://www.rongwang.hk 301 to https | ✅ |
| 5 | /health-content 301 to /articles | ✅ |
| 6 | /brand-story 301 to /brand | ✅ |
| 7 | /health-assessment 301 to /ai-consult | ✅ |
| 8 | Homepage nav — no 404 | ✅ |
| 9 | Current HTML referenced _next JS chunks all 200 | ✅ |
| 10 | sitemap.xml + robots.txt 200 | ✅ |
| 11 | Console no JS errors | ✅ |

**All 11 conditions: ✅ PASS**

---

## No-Go Conditions Check

| Condition | Status |
|-----------|--------|
| HTTPS cert still CN/SAN mismatch | ❌ Not applicable (fixed) |
| www entry inaccessible or no redirect | ❌ Not applicable (fixed) |
| Homepage nav still 404 | ❌ Not applicable (fixed) |
| Current HTML still references non-existent _next chunk | ❌ Not applicable (fixed) |
| Core pages broken during fix | ❌ All core pages verified 200 |
| Health disclaimer removed | ❌ Still present |
| Canonical chaos | ❌ Canonical tags correct |

**All No-Go: ✅ NOT TRIGGERED**
