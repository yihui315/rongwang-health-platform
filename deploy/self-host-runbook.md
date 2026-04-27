# Rongwang Self-Host Launch Runbook

This runbook is for a single Linux server running Docker Compose, local
Postgres, local Redis, and the Next.js standalone app.

## 1. Server Prerequisites

Install Docker Engine, the Docker Compose plugin, Git, Node.js 22, and Nginx or
Caddy for HTTPS reverse proxy.

Open firewall ports `80/tcp` and `443/tcp`. Keep Postgres and Redis REST bound
to `127.0.0.1`; `docker-compose.prod.yml` already does this.

## 2. Prepare Environment

```bash
cp .env.production.example .env.production
npm run env:bootstrap:production -- --force
```

Then edit `.env.production`:

- Set `NEXT_PUBLIC_SITE_URL` to the real domain.
- Set `DEEPSEEK_API_KEY` to the rotated production key.
- Keep generated `ADMIN_AUTH_TOKEN`, `POSTGRES_PASSWORD`, and `REDIS_REST_TOKEN`.

Do not commit `.env.production`.

## 3. Start Infrastructure

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres redis redis-rest
```

Validate env and probes:

```bash
npm run env:check:selfhost
npm run env:probe -- --env-file=.env.production --probe-db
npm run env:probe -- --env-file=.env.production --probe-redis
npm run env:probe -- --env-file=.env.production --probe-deepseek
```

## 4. Migrate And Seed

```bash
npm ci
npm run prisma:generate
npm run db:deploy
npm run db:seed
VERIFY_DATABASE_SEED=true npm run seed:verify
```

## 5. Build And Run App

```bash
npm run verify
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build app
```

Check health:

```bash
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS "http://127.0.0.1:3000/api/health?deep=1"
```

## 6. Reverse Proxy

Copy `deploy/nginx.conf.example` into your Nginx site config and replace the
domain. Add HTTPS using your preferred certificate automation, such as Certbot.

## 7. Backups

Create a manual backup:

```bash
sh deploy/backup-postgres.sh
```

Restore from a backup:

```bash
sh deploy/restore-postgres.sh backups/rongwang-YYYYMMDD-HHMMSS.dump
```

Recommended cron:

```cron
15 3 * * * cd /srv/rongwang && sh deploy/backup-postgres.sh >> /var/log/rongwang-backup.log 2>&1
```

## 8. Rollback

```bash
git checkout <previous-good-commit>
npm ci
npm run db:deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build app
curl -fsS http://127.0.0.1:3000/api/health
```

If a migration is destructive, restore the latest backup before restarting the
app.
