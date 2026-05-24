# GitHub 仓库状态与分支说明

最后更新：2026-05-24

## 当前生产版本

- 生产域名：https://rongwang.hk
- 生产提交：`1b3d8ee` (`chore: upgrade Next.js runtime`)
- 生产分支：`codex/deployed-rongwang-hk-20260515`
- 未来开发主线：`main`
- 运行方式：Ubuntu 云服务器 + Nginx + systemd + Next.js
- 应用端口：`127.0.0.1:3201`
- Nginx 入口：`rongwang.hk` HTTPS 反向代理到 `127.0.0.1:3201`

## 重要分支

| 分支 | 当前用途 | 备注 |
| --- | --- | --- |
| `codex/deployed-rongwang-hk-20260515` | 当前线上生产版本 | 作为当前稳定发布线的源分支 |
| `main` / `origin/main` | 未来开发主线 | 新功能优先合入此分支，再择期发布到生产线 |
| `codex/production-launch-task1` | 本次发布契约工作分支 | 用于补齐 release contract、runbook 与验证脚本 |
| `rongwang-platform-phase2` | 本地 Phase2 工作分支 | 包含更复杂的工作台、认证、营销能力探索 |
| `codex/preop-readiness-minimax` | 预发布修复分支 | MiniMax 生产就绪识别修复 |
| `codex/rongwang-visual-video-upgrade` | 视觉/视频升级分支 | 待确认是否合并 |
| `codex/rongwang-wechat-auth-knowledge` | 微信认证与知识库分支 | 待确认是否合并 |

## 分支策略

1. `main` 作为未来开发主线，所有新功能优先进入 `main`。
2. 当前线上稳定版本保留在 `codex/deployed-rongwang-hk-20260515`，用于生产回滚和审计比对。
3. 生产发布时，以经过验证的 release commit 为准，从开发主线挑选稳定提交后生成发布包，再同步到生产主机。
4. 生产切换只允许通过 release runbook 里的 archive → deploy → smoke → rollback 检查流程执行。

## 当前部署流程

当前线上部署以本地已验证提交为准：

```bash
npm run typecheck
npm test
npm run build
npm run release:verify
npm run release:bundle
```

服务器侧：

```bash
tar -xzf /tmp/rongwang-health-platform-<commit>.tgz -C /opt/rongwang-health-platform/releases/<commit-timestamp>
cd /opt/rongwang-health-platform/releases/<commit-timestamp>
npm ci
npm run build
ln -sfn /opt/rongwang-health-platform/releases/<commit-timestamp> /opt/rongwang-health-platform/current
systemctl restart rongwang-health-platform
nginx -t
systemctl reload nginx
```

## 验证清单

上线前至少验证：

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run lint`
- `npm run release:verify`
- `https://rongwang.hk/`
- `https://rongwang.hk/products`
- `https://rongwang.hk/ai-consult`
- `https://rongwang.hk/workspace`
- `https://rongwang.hk/compliance`
- `https://rongwang.hk/api/mock/products`

## 安全注意

- 不要把 GitHub token、服务器密码、API key 写入仓库。
- 已经在聊天或终端暴露过的 token 和服务器密码应立即轮换。
- GitHub token 只用于一次性推送时，应通过临时环境变量或 askpass 使用，不写入 `git config`。
- 生产服务器仍有旧 Docker 容器监听 `3000/3100/3200`，后续应决定保留为回滚还是清理。

## 建议下一步

1. 在 GitHub 设置中确认默认分支策略。
2. 将 release runbook 作为上线前检查表的一部分固定下来。
3. 生产发布统一通过 release helper scripts 触发，不再手工拼命令。
4. 清理或归档不再使用的 Copilot 实验分支。
