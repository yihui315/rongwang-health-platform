# RONGWANG_PRE_REBUILD_BACKUP_20260614

**Backup Time:** 2026-06-14 (before Docker rebuild)
**Server:** 38.76.178.75

## Backed Up Files

- `/etc/nginx/conf.d/rongwang.conf` → `.ai/backups/20260614-site-hotfix/rongwang.conf.bak`
- `next.config.js` → `.ai/backups/20260614-site-hotfix/next.config.js.bak`

## Git Status Before Rebuild

```
M next.config.js
 M src/lib/marketing/pipeline-runner.ts
?? .ai/MARKETING_PIPELINE_V1_PLAN.md
?? .ai/RONGWANG_MARKETING_*.md (5 files)
?? .ai/RONGWANG_SITE_*.md (4 files)
?? .ai/RONGWANG_SSL_DIAGNOSIS_20260614.md
?? .ai/backups/
?? .ai/marketing-jobs/
?? .ai/marketing-skills/
?? data/
?? scripts/marketing/
?? src/lib/marketing/ (12 new files)
?? src/scripts/marketing/__tests__/
```

## next.config.js Changes (to be baked into Docker image)

Added `async redirects()` with 3 permanent 301 redirects:
- `/health-content` → `/articles`
- `/brand-story` → `/brand`
- `/health-assessment` → `/ai-consult`

## What This Rebuild Achieves

Nginx redirects are already live. This rebuild picks up next.config.js redirects()
so the Next.js layer also handles old paths (defense in depth).
