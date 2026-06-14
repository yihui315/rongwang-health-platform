# 荣旺营销 Skills 目录

**版本**: v1.0 | **维护人**: Hermes (CEO Digital Twin)

> ⚠️ 本目录为内部 SOP 文档，不参与运行时执行。
> 这些文件是荣旺营销 Pipeline v1 的操作规范和参考文档。

---

## 目录索引

| Skill 文件 | 用途 | 触发条件 |
|-----------|------|---------|
| `seo-geo-checker.SKILL.md` | SEO/GEO 本地检查 SOP | Pipeline Phase 3-5 |
| `wechat-draft-publisher.SKILL.md` | 微信公众号草稿发布 SOP | Pipeline Phase 7 |
| `xhs-persona-template.md` | 小红书平台 Persona 模板 | 选题阶段 |
| `tool-registry.md` | 营销工具注册表 | 任意阶段 |
| `error-handler.SKILL.md` | 错误处理决策树 | 任意错误发生 |
| `content-pipeline.SKILL.md` | 内容生成流水线 SOP | Pipeline Phase 4 |
| `evidence-logging.SKILL.md` | Evidence 日志 SOP | Pipeline 全程 |

---

## 快速参考

### 平台发布状态

| 平台 | 自动发布 | 草稿模式 | 手动包 | 备注 |
|------|---------|---------|--------|------|
| Website | ❌ | ✅ (未来) | ✅ | CMS API 待接入 |
| WeChat | ❌ | ✅ | ✅ | 需要 Cookie |
| 小红书 | ❌ | ❌ | ✅ | 本轮不做自动 |
| 知乎 | ❌ | ❌ | ✅ | 本轮不做自动 |

### SEO 评分阈值

| 分数 | 等级 | 动作 |
|------|------|------|
| 90-100 | 可发布 | 直接进入发布 |
| 75-89 | 草稿发布 | 生成草稿，需人工检查 |
| 60-74 | 手动包 | 只生成手动发布包 |
| <60 | 禁止发布 | 阻止进入发布步骤 |

### 错误严重程度

| 类型 | Pipeline 阻塞 | Manual Pack | 重试 |
|------|-------------|-------------|------|
| evidence_write_failed | ✅ | ❌ | ❌ |
| schema_invalid | ✅ | ❌ | ❌ |
| content_generation_failed | ✅ | ❌ | ✅ (2次) |
| rankparser_timeout | ❌ | ❌ | ❌ |
| wechatsync_unavailable | ❌ | ✅ | ❌ |
| cookie_expired | ❌ | ✅ | ❌ |
| platform_rate_limited | ❌ | ✅ | ❌ |
| unknown | ✅ | ✅ | ❌ |

---

## 核心原则

1. **从不静默失败** — 所有错误必须写入 Evidence
2. **证据优先于声明** — 所有判断必须有数据支撑
3. **草稿优先于发布** — 默认 dry-run，手动确认后才发布
4. **单平台失败不影响其他平台** — 隔离发布
5. **无 Evidence 不允许成功** — Evidence 写入失败 = Pipeline 失败

---

*最后更新: 2025-06-14*
