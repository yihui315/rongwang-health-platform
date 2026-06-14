# RONGWANG_SITE_HOTFIX_EVIDENCE_20260614

**Date:** 2026-06-14
**Hotfix ID:** RONGWANG_SITE_TRUST_HOTFIX_20260614
**Server:** 38.76.178.75

---

## What Changed

### 1. SSL Certificate — Expanded SAN
**Command:**
```bash
sudo certbot --nginx -d rongwang.hk -d www.rongwang.hk --expand --non-interactive
```
**Result:** Certificate re-issued. Now covers both `DNS:rongwang.hk` and `DNS:www.rongwang.hk`.
**New expiry:** 2026-09-12

### 2. Nginx Config — Rewritten
**File:** `/etc/nginx/conf.d/rongwang.conf`
**Changes:**
- Removed default_server proxy on port 80 (was proxying everything to Next.js directly)
- Added port 80 `server_name rongwang.hk` → `return 301 https://rongwang.hk`
- Added port 80 `server_name www.rongwang.hk` → `return 301 https://rongwang.hk`
- Added port 443 `server_name www.rongwang.hk` → `return 301 https://rongwang.hk` (SSL cert now covers www)
- Added old-path redirects for `/health-content`, `/brand-story`, `/health-assessment`
- Main site `server_name rongwang.hk` remains with full proxy config

**Commands:**
```bash
sudo tee /etc/nginx/conf.d/rongwang.conf > /dev/null
sudo nginx -t && sudo systemctl reload nginx
```

### 3. next.config.js — Added redirects()
**File:** `/root/rongwang-health-platform/next.config.js`
**Added:** `async redirects()` with 3 old-path → new-path 301 permanent redirects.
**Note:** This takes effect on next `docker compose build`. Nginx redirects are live immediately.

---

## Evidence of Fix

### SSL SAN (after)
```
X509v3 Subject Alternative Name:
    DNS:rongwang.hk, DNS:www.rongwang.hk
```

### HTTP → HTTPS (after)
```
http://rongwang.hk      → 301 Location: https://rongwang.hk/
http://www.rongwang.hk  → 301 Location: https://rongwang.hk/
```

### www → apex (after)
```
https://www.rongwang.hk → 301 Location: https://rongwang.hk/
```

### Old path redirects (after, Nginx live)
```
https://rongwang.hk/health-content   → 301 Location: /articles
https://rongwang.hk/brand-story      → 301 Location: /brand
https://rongwang.hk/health-assessment → 301 Location: /ai-consult
```

### JS Chunk check (after)
All chunks referenced by current homepage HTML return 200:
```
/_next/static/chunks/app/error-882d8a52df5dd4eb.js → 200
/_next/static/chunks/app/layout-a3b34d213012602b.js → 200
/_next/static/chunks/app/page-08c9901c4965fff2.js → 200
/_next/static/chunks/webpack-b8e1e74fcc0052ca.js → 200
```

---

## Commands Run

```bash
# 1. DNS check
dig rongwang.hk +short
dig www.rongwang.hk +short

# 2. SSL cert re-issue
sudo certbot --nginx -d rongwang.hk -d www.rongwang.hk --expand --non-interactive

# 3. Nginx config rewrite
sudo tee /etc/nginx/conf.d/rongwang.conf > /dev/null << 'NGINX_EOF'
... (full config above)
NGINX_EOF

# 4. Nginx reload
sudo nginx -t && sudo systemctl reload nginx

# 5. Verify redirects
curl -sI https://rongwang.hk/health-content
curl -sI https://rongwang.hk/brand-story
curl -sI https://rongwang.hk/health-assessment
curl -sI https://www.rongwang.hk
curl -sI http://www.rongwang.hk
curl -sI http://rongwang.hk

# 6. Browser verification
gstack browse → https://www.rongwang.hk → redirects to https://rongwang.hk ✅
gstack browse → https://rongwang.hk/health-content → redirects to /articles ✅
gstack browse → https://rongwang.hk/brand-story → redirects to /brand ✅
gstack browse → https://rongwang.hk/health-assessment → redirects to /ai-consult ✅
```
