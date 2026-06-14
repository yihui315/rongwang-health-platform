# WeChat Draft Publisher Skill

**Skill 版本**: v1.0 | **对应 Phase**: Phase 7 | **触发**: Pipeline publish_drafts

---

## 目的

通过 Wechatsync Docker 容器，将文章内容发布为微信公众号草稿。
遵循 **draft-first** 原则：永远不自动正式发布。

---

## 架构

```
Pipeline → wechatsync.ts → Docker (jkshop/wechatsync:latest) → 微信公众号草稿
                ↓
          Cookie 持久化
          (Chrome Profile)
```

---

## 前置检查

### 1. Feature Flag
```bash
FEATURE_WECHATSYNC_ENABLED=true   # 必须显式开启
```

### 2. Chrome Profile (Cookie)
```bash
ls /root/.config/google-chrome
```
如果不存在 → `auth_missing` → 生成 manual pack

### 3. Docker 容器
```bash
docker ps | grep wechatsync
```
如果未运行 → `skipped` → 生成 manual pack

---

## 发布模式

| Mode | 行为 |
|------|------|
| `dry-run` | 不实际操作，返回 skipped |
| `draft` | 创建微信草稿，不发布 |
| `manual` | 只生成 manual pack |

**Pipeline 默认**: `dry-run`

---

## 错误处理

### auth_missing
- 原因: Chrome Profile 不存在或 Cookie 过期
- 动作: 生成 manual pack
- 不影响其他平台

### cookie_expired
- 原因: Wechatsync 报告认证失败
- 动作: 生成 manual pack + 日志警告
- 建议: 用户手动更新 Chrome Profile

### rate_limited
- 原因: 微信公众号 API 限流
- 动作: 生成 manual pack
- 不重试（避免加重限流）

### wechatsync_unavailable
- 原因: Docker 容器未运行或无响应
- 动作: 生成 manual pack
- 建议: `docker start wechatsync`

---

## Manual Pack 包含

1. `wechat.md` — 可直接复制粘贴到微信公众号后台
2. `README.md` — 发布步骤说明
3. `assets/` — 封面图占位目录

---

## Cookie 更新步骤

```bash
# 1. 在宿主机 Chrome 登录微信公众号后台
# 2. 确保持续登录状态
# 3. Chrome Profile 路径: /root/.config/google-chrome
# 4. 挂载到 Wechatsync 容器 (只读): /root/.config/google-chrome:ro
```

---

## 安全规则

1. ❌ 不自动发布（永远 draft）
2. ❌ 不修改已发布内容
3. ❌ 不进行评论/回复
4. ❌ 不发送模板消息
5. ✅ 只创建草稿
6. ✅ 所有操作写入 Evidence

---

## 已知限制

- Cookie 会过期，通常需要每 1-2 周更新
- 微信公众号草稿有数量限制（目前约 200 篇）
- Wechatsync 依赖 Chrome DevTools Protocol，可能被微信风控
