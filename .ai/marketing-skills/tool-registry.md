# 营销工具注册表

**版本**: v1.0 | **维护人**: Hermes | **最后更新**: 2025-06-14

---

## 工具注册表

### 内容生成

| 工具 | 用途 | 状态 | 集成方式 |
|------|------|------|---------|
| `ai-content-generator.ts` | 5渠道内容生成 | ✅ 已有 | 直接调用 |
| `/api/marketing/content-generate` | HTTP API | ✅ 已有 | REST call |
| `content-generator-wrapper.ts` | Pipeline v1 wrapper | ✅ 新增 | 直接调用 |

### SEO/GEO

| 工具 | 用途 | 状态 | 集成方式 |
|------|------|------|---------|
| `seo-ready-score.ts` | 现有SEO评分 | ✅ 已有 | 直接调用 |
| `seo-geo-checker.ts` | Pipeline v1 checker | ✅ 新增 | 直接调用 |
| RankParser | 外部排名检查 | ⚠️ 可选 | rankparser-adapter.ts |

### 发布平台

| 平台 | 适配器 | 状态 | 发布模式 |
|------|--------|------|---------|
| Website | CMS API | 🔜 待接入 | Draft |
| WeChat | Wechatsync Docker | ✅ 已有 | Draft-only |
| 小红书 | Manual Pack | ✅ 新增 | 手动发布 |
| 知乎 | Manual Pack | ✅ 新增 | 手动发布 |

### 合规检查

| 工具 | 用途 | 状态 | 调用方式 |
|------|------|------|---------|
| `automation.ts` | 健康合规检查 | ✅ 已有 | `evaluateMarketingCompliance()` |
| Medical Disclaimer | 免责声明注入 | ✅ 已有 | ai-content-generator.ts 内置 |
| `error-handler.ts` | 错误分类策略 | ✅ 新增 | `getErrorStrategy()` |

### 日志与证据

| 工具 | 用途 | 状态 | 输出 |
|------|------|------|------|
| `evidence-writer.ts` | JSON+JSONL 输出 | ⚠️ 缺陷 | /tmp (会丢失) |
| `evidence-logger.ts` | 持久化 Evidence | ✅ 新增 | ./data/marketing-runs/ |
| `manual-pack-generator.ts` | 手动发布包 | ✅ 新增 | .ai/marketing-manual-packs/ |

### 定时任务

| 工具 | 用途 | 状态 | 备注 |
|------|------|------|------|
| Cron Job 929d4aa72f53 | 现有 cron | ✅ 已有 | 不改动 |
| Vercel Cron | Pipeline 定时触发 | 🔜 待接入 | Phase 2 |

---

## Feature Flags

| Flag | 默认值 | 用途 |
|------|--------|------|
| `FEATURE_MARKETING_PIPELINE` | `false` | Pipeline 总开关 |
| `FEATURE_MARKETING_AUTOPILOT` | `false` | 自动发布开关 |
| `FEATURE_WECHATSYNC_ENABLED` | `false` | Wechatsync 开关 |
| `FEATURE_RANKPARSER_REQUIRED` | `false` | RankParser 阻塞开关 |
| `FEATURE_XHS_AUTOMATION_ENABLED` | `false` | 小红书自动化（本轮不用） |
| `FEATURE_AUDIT_STRICT_MODE` | `true` | SEO 严格模式 |
| `RANKPARSER_API_URL` | unset | RankParser API 地址 |
| `RANKPARSER_API_KEY` | unset | RankParser API Key |

---

## 禁止使用的外部工具

根据本轮计划，以下工具**严禁**接入 Pipeline:

| 工具 | 原因 |
|------|------|
| Hunter.io | 禁止引入新外部 API |
| Instant.ly | 禁止引入新外部 API |
| Google Ads MCP | 禁止广告自动投放 |
| xiaohongshu-ops-skill (源码) | 无 LICENSE，仅参考结构 |

---

## 外部依赖地图

```
Pipeline v1
├── ai-content-generator.ts
│   └── @/lib/ai/provider (DeepSeek/MiniMax)
├── seo-geo-checker.ts
│   └── automation.ts (evaluateMarketingCompliance)
├── draft-publisher.ts
│   └── adapters/wechatsync.ts
│       └── Docker (jkshop/wechatsync:latest)
├── rankparser-adapter.ts
│   └── RANKPARSER_API_URL (optional)
├── evidence-logger.ts
│   └── ./data/marketing-runs/ (persistent)
└── error-handler.ts
    └── job-types.ts (PipelineStepResult)
```

---

*本注册表与代码同步更新*
