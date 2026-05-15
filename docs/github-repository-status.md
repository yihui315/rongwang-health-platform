# GitHub 仓库状态与分支说明

最后更新：2026-05-16

## 当前生产版本

- 生产域名：https://rongwang.hk
- 生产提交：`1b3d8ee` (`chore: upgrade Next.js runtime`)
- 生产分支：`codex/deployed-rongwang-hk-20260515`
- 运行方式：Ubuntu 云服务器 + Nginx + systemd + Next.js
- 应用端口：`127.0.0.1:3201`
- Nginx 入口：`rongwang.hk` HTTPS 反向代理到 `127.0.0.1:3201`

## 重要分支

| 分支 | 当前用途 | 备注 |
| --- | --- | --- |
| `codex/deployed-rongwang-hk-20260515` | 当前线上生产版本 | 与 `rongwang.hk` 已部署版本保持一致 |
| `main` / `origin/main` | GitHub 默认分支 | 目前是另一条 Phase2/Docker 历史，不等同于当前线上版本 |
| `rongwang-platform-phase2` | 本地 Phase2 工作分支 | 包含更复杂的工作台、认证、营销能力探索 |
| `codex/preop-readiness-minimax` | 预发布修复分支 | MiniMax 生产就绪识别修复 |
| `codex/rongwang-visual-video-upgrade` | 视觉/视频升级分支 | 待确认是否合并 |
| `codex/rongwang-wechat-auth-knowledge` | 微信认证与知识库分支 | 待确认是否合并 |

## 为什么 GitHub 默认 `main` 和线上不一致

当前仓库存在两条不同历史：

1. 线上生产站点使用轻量 Next.js MVP 历史，最新提交是 `1b3d8ee`。
2. GitHub 默认 `origin/main` 使用 Phase2/Docker 历史，最新提交是 `48233bb`。

两者不是简单的快进关系，不能直接强推覆盖。后续需要先明确产品方向，再选择以下路径之一：

- 以当前线上 MVP 为主线，把 Phase2 能力按模块迁回。
- 以 Phase2/Docker 版本为主线，把当前线上视觉和稳定内容迁入。
- 新建 `production` 分支作为稳定发布线，默认 `main` 保留研发主线。

## 当前部署流程

当前线上部署以本地已验证提交为准：

```bash
npm run typecheck
npm test
npm run build
git archive --format=tar.gz -o /tmp/rongwang-health-platform-<commit>.tgz HEAD
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
2. 如果当前线上 MVP 是正式方向，建议把 `codex/deployed-rongwang-hk-20260515` 提升为 `production` 分支。
3. 建立 PR 规则：所有上线变更先合并到生产分支，再部署。
4. 清理或归档不再使用的 Copilot 实验分支。
