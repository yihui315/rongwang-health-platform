# 发布 Runbook

## 目的

把当前 Next.js 站点通过可重复的发布流程部署到 Ubuntu + Nginx + systemd 主机，并在发布前后保留回滚路径。

## 角色与分支

- 开发主线：`main`
- 当前生产分支：`codex/deployed-rongwang-hk-20260515`
- 发布工件来源：经过 `npm run release:verify` 的提交
- 生产主机：`rongwang.hk`

## 生产环境变量

生产环境至少需要：

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `APP_SECRET`
- `JWT_SECRET`
- `WORKSPACE_ADMIN_EMAIL`
- `WORKSPACE_ADMIN_PASSWORD`
- `WORKSPACE_SESSION_TTL_DAYS`
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `QWEN_API_KEY`（按实际使用情况配置）
- `SENTRY_DSN`（如启用监控）
- `SENDGRID_API_KEY`（如启用邮件）
- `NEXT_PUBLIC_ANALYTICS_ID` 或 `NEXT_PUBLIC_GA_MEASUREMENT_ID`（如启用分析）

## 发布前检查

在本地或 CI 上运行：

```bash
npm run release:verify
npm run release:bundle
```

如果这两步失败，不进入服务器发布。

## 打包归档

`npm run release:bundle` 会生成当前 commit 的 tar.gz 发布包，命名规则应包含 commit hash，便于审计和回滚。

## 服务器发布步骤

```bash
mkdir -p /opt/rongwang-health-platform/releases/<commit-timestamp>
tar -xzf /tmp/rongwang-health-platform-<commit>.tgz -C /opt/rongwang-health-platform/releases/<commit-timestamp>
cd /opt/rongwang-health-platform/releases/<commit-timestamp>
npm ci
npm run build
ln -sfn /opt/rongwang-health-platform/releases/<commit-timestamp> /opt/rongwang-health-platform/current
systemctl restart rongwang-health-platform
nginx -t
systemctl reload nginx
```

## 健康检查

发布完成后先检查公开页面：

```bash
curl -fsS https://rongwang.hk/
curl -fsS https://rongwang.hk/products
curl -fsS https://rongwang.hk/ai-consult
curl -fsS https://rongwang.hk/login
curl -fsS https://rongwang.hk/compliance
```

然后验证工作台鉴权边界。`/workspace` 未登录时必须重定向到 `/login`，`/api/mock/products` 未登录时必须返回 `401`：

```bash
curl -isS https://rongwang.hk/workspace | head
curl -isS https://rongwang.hk/api/mock/products | head
```

如需执行完整 smoke，请在安全终端中提供工作台账号，并要求认证检查通过：

```bash
SMOKE_BASE_URL=https://rongwang.hk \
SMOKE_REQUIRE_AUTH=1 \
WORKSPACE_ADMIN_EMAIL=<production-admin-email> \
WORKSPACE_ADMIN_PASSWORD=<production-admin-password> \
npm run smoke
```

`npm run acceptance` 会创建商品导入与内容生成记录，只能在本地、预发环境，或明确批准的生产验证窗口运行：

```bash
ACCEPTANCE_BASE_URL=https://rongwang.hk \
ACCEPTANCE_MUTATES_DATA=1 \
WORKSPACE_ADMIN_EMAIL=<production-admin-email> \
WORKSPACE_ADMIN_PASSWORD=<production-admin-password> \
npm run acceptance
```

如果其中任一失败，先保留旧版本并回滚。

## 回滚步骤

1. 找到上一个稳定发布目录。
2. 将 `/opt/rongwang-health-platform/current` 重新指向旧目录。
3. 重启 `rongwang-health-platform` 服务。
4. 重新执行 `curl` 健康检查。
5. 记录回滚原因和失败页面。

## 备份建议

- 发布前备份数据库。
- 发布前保留上一个 release 目录，不要覆盖。
- 回滚时优先切换符号链接，不要直接改写已验证工件。

## 发布纪律

- 只发布经过 `release:verify` 的提交。
- 只通过归档包进入生产主机。
- 任何健康检查失败都按回滚流程处理。
