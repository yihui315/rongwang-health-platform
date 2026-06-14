# RONGWANG_SSL_DIAGNOSIS_20260614

**Audit Date:** 2026-06-14
**Auditor:** Hermes (MiniMax-M2.7)
**Server:** 38.76.178.75

---

## DNS Status

| Hostname | A Record | Target |
|----------|----------|--------|
| rongwang.hk | ✅ | 38.76.178.75 |
| www.rongwang.hk | ✅ | 38.76.178.75 |

- No Cloudflare / CDN in front
- Direct to origin server 38.76.178.75
- DNS provider: unknown (non-authoritative quick check)

---

## SSL Certificate

**Issuer:** Let's Encrypt CN=E7
**Not Before:** Apr 29 2026
**Not After:** Jul 28 2026

### SAN Coverage

| Hostname | Covered? | Note |
|----------|----------|------|
| rongwang.hk | ✅ YES | CN match |
| www.rongwang.hk | ❌ NO | NOT in SAN |

**Problem:** Certificate only covers apex. `www` is missing.

---

## HTTP/HTTPS Behavior

| URL | Status | Behavior |
|-----|--------|----------|
| http://rongwang.hk | 301 → https://rongwang.hk | ✅ Correct |
| https://rongwang.hk | 200 | ✅ Works |
| http://www.rongwang.hk | 200 (no redirect) | ❌ Should 301 to https |
| https://www.rongwang.hk | SSL handshake fails (CN mismatch) | ❌ Browser blocks |

---

## Nginx Config

- Config file: `/etc/nginx/conf.d/rongwang.conf`
- Only `server_name rongwang.hk` has SSL block
- No `server_name www.rongwang.hk` entry
- No HTTP → HTTPS redirect for www

---

## Root Causes

1. **P0-1 (HTTPS):** Let's Encrypt was issued for `rongwang.hk` only. `www` not in SAN.
2. **P1-2 (HTTP www):** Nginx has no `server_name www.rongwang.hk` block, so requests to `http://www.rongwang.hk` hit the `default_server` on port 80 which proxies to Next.js directly (200, no redirect).

---

## Fix Plan

1. Re-run certbot to include both domains: `certbot --nginx -d rongwang.hk -d www.rongwang.hk`
2. Add nginx server block for `www.rongwang.hk` on port 80 → 301 to `https://rongwang.hk`
3. Add nginx server block for `www.rongwang.hk` on port 443 → 301 to `https://rongwang.hk` (after certbot re-issue)
