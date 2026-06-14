# 荣旺健康 AI 营销流水线 v1 — 执行计划

**日期**: 2026-06-14
**分支**: `feat/rongwang-conversion-trust-rebuild-202606`
**状态**: 待 CEO 审核
**版本**: v1.0

---

## 背景

2026-06-11 完成 S1-S6 平台升级（评估/方案页职责分离、信任体系、SEO 修复、数据埋点）。

六库研究（xiaohongshu-ops-skill、agent-reach、seo-aeo-geo、autoresearch、marketingskills、agency-agents）结论：**不造 Orchestrator，专注 Pipeline v1 增强 + 三项轻量补充**。

**已有资产（远比你以为的完整）：**

| 模块 | 文件 | 行数 | 状态 |
|------|------|------|------|
| Pipeline Runner | `pipeline-runner.ts` | 785 | ✅ 6阶段状态机 |
| Job Schema | `job-types.ts` | 474 | ✅ 完整类型系统 |
| Manual Review | `manual-review.ts` | 262 | ✅ 飞书通知+队列 |
| Evidence Logger | `adapters/evidence-writer.ts` | 94 | ✅ JSON+JSONL双输出 |
| Content Generator | `ai-content-generator.ts` | 432 | ✅ 5渠道+合规审查 |
| Wechatsync适配器 | `adapters/wechatsync.ts` | 172 | ✅ Docker+Cookie持久化 |
| CLI入口 | `scripts/marketing/pipeline-cli.ts` | 322 | ✅ dry-run/approve/reject |
| Feature Flags | `feature-flags.ts` | 68 | ✅ 开关体系 |
| Content Reuse Matrix | `docs/CONTENT-REUSE-MATRIX.md` | 586 | ✅ 56篇SEO文章+6落地页 |
| GEOFlow集成 | `geoflow.ts` | 126 | ✅ API同步 |
| SEO Ready Score | `seo-ready-score.ts` | 160 | ✅ 评分引擎 |

Pipeline 6阶段：`prepare → generate_content → seo_geo_gate → publish_drafts → baseline_snapshot → finalize`

---

## 阶段完成度审计（S1-S6）

| Stage | 名称 | 状态 | 缺口 |
|-------|------|------|------|
| S1 | AI评估+方案页职责分离 | ✅ 完成 | — |
| S2 | 转化链路收口 | ✅ 完成 | — |
| S3 | 健康专业性+信任体系 | 🔲 部分 | notSuitable/红旗指标/参考文献未渲染 |
| S4 | SEO/路由/索引 | ✅ 完成 | — |
| S5 | 数据埋点/仪表板 | ✅ 完成 | — |
| S6 | AI Agent研发 | 🔲 未启动 | 无 |
| S7 | Pipeline运维监控 | 🔲 未启动 | 无 |

**关键缺口（S3）：**
- `solutions.ts` 数据有 `notSuitable` 字段 → 页面未渲染
- `solutions.ts` 数据有 `seekCareSignals` 字段（红旗指标）→ 页面未渲染
- `evidenceSource` 参考文献字段 → 页面未渲染

---

## Premise（前提假设）

1. **Pipeline v1 已完整** — `pipeline-runner.ts` 785行状态机可直接使用，不需要重写
2. **内容资产已就绪** — 56篇SEO文章+6落地页，内容复用矩阵完整
3. **Pipeline未连接到生产** — CLI存在但无API端点，cron trigger未配置
4. **xiaohongshu-ops-skill 无LICENSE** — 只可引用结构模式，不能复制代码/文档
5. **Pipeline证据目录** — 写 `/tmp/marketing-pipeline/evidence/`（容器内路径），审计日志为 `events.jsonl`
6. **Draft-first原则** — 所有平台发布默认先草稿，人工审核后发布

---

## 目标

**短期（1周）：** Pipeline v1 连接到生产，修复S3缺口

**中期（2周）：** 增强GEO评分体系，建立平台Persona约束

**长期（持续）：** 逐步实现 Agent-Reach 只读研究层集成

---

## 执行计划

### Phase 0 — Pipeline 生产连接（1-2天）

**目标：** 让 Pipeline 可通过 API 调用 / cron 触发执行

**任务：**

0.1 **创建 `/api/marketing/pipeline/run` 端点**
- 输入：job_id、trigger（cron|manual|api）
- 调用 `MarketingPipelineRunner`
- 返回 run_id + 当前阶段状态
- 输出evidence路径供查询

0.2 **创建 `/api/marketing/pipeline/status/[runId]` 端点**
- 查询某个run的当前状态
- 返回 PipelineStepResult[] + events

0.3 **配置 Feature Flag**
- `FEATURE_MARKETING_PIPELINE` 控制端点开关
- 默认 false（人工放行后开启）

0.4 **在 `.env.local` 配置必需变量**
- `WECHATSYNC_DOCKER_COMMAND`
- `WECHATSYNC_COOKIE_DIR`
- `FEISHU_WEBHOOK_URL`（manual review通知）
- `EVIDENCE_BASE`（可选，默认 `/tmp/marketing-pipeline/evidence`）

0.5 **在 Vercel Cron 配置 Pipeline 触发**
- 每周一/四 09:00 UTC 执行
- 对接 `/api/marketing/pipeline/run?job_id=weekly-content`

---

### Phase 1 — S3缺口修复（1天）

**任务：**

1.1 **Solutions页面渲染 `notSuitable`（不适合人群）**
- 读取 `solutions.ts` 中每个方向的 `notSuitable` 字段
- 在页面增加「这些情况不适合」模块
- 位置：适合人群下方，「不适合人群」红色提示框

1.2 **Solutions页面渲染 `seekCareSignals`（红旗指标）**
- 读取 `solutions.ts` 中 `seekCareSignals`
- 在页面顶部或底部增加红色警告区域
- 图标：🚨，文字：出现这些情况请立即就医

1.3 **Solutions页面渲染 `evidenceSource`（参考文献）**
- 在页面底部增加「参考文献」折叠区
- 使用 `<details>/<summary>` HTML元素

---

### Phase 2 — GEO评分增强（1天）

**任务：**

2.1 **扩展 `seo-ready-score.ts` 为5层评分**
- 现有：pass/fail
- 目标：ScoreDetail（五维：keyword_coverage/title_structure/content_depth/structured_data/entity_coverage）

2.2 **为每个维度设置权重**
- keyword_coverage: 25%
- title_structure: 20%
- content_depth: 30%
- structured_data: 15%
- entity_coverage: 10%

2.3 **将 ScoreDetail 写入 evidence**
- `seo-report.json` 包含各维度得分和扣分原因

---

### Phase 3 — 平台Persona约束（0.5天）

**任务：**

3.1 **创建 `persona/wechat.md`**
- 人设：专业营养师，健康科普，不夸大功效
- 禁止词：最好、第一、绝对、保证、治愈
- 格式：生活场景+成分科普+购买引导（软性）

3.2 **创建 `persona/xiaohongshu.md`**
- 人设：真实用户体验，第一人称种草
- 禁止词：官方词汇、医疗断言、对比贬低
- 格式：个人故事+真实感受+互动引导

3.3 **在 `ai-content-generator.ts` 的各渠道生成prompt中注入Persona约束**
- 不重写，只在 system prompt 层面增加约束指令

---

### Phase 4 — 集成Jina Reader做竞品研究（1天，可选）

**任务：**

4.1 **创建 `research/jina-reader.ts`**
- 使用 `https://r.jina.ai/` 读取任意URL内容
- 提取正文，去除广告/导航

4.2 **创建 `/api/marketing/research` 端点**
- 输入：关键词 + 竞品URL
- 调用Jina Reader抓取内容
- 返回内容摘要+关键引语

4.3 **在 Pipeline `prepare` 阶段增加竞品研究步骤**
- 在生成内容前，自动抓取3个竞品高排名页面
- 将研究摘要注入 `NormalizedContext.competitorInsights`

---

## 已验证假设

- `pipeline-runner.ts` 状态机直接可用，不需要修改核心逻辑
- 5个渠道的内容生成prompt已就绪，只需注入Persona约束
- Wechatsync适配器已有，只需配置Docker路径和Cookie
- Evidence输出已有完整结构
- Manual review已有飞书通知适配器

---

## 依赖项

- WECHATSYNC_COOKIE_DIR（WeChat发布需要）
- FEISHU_WEBHOOK_URL（人工审核通知）
- Jina AI API（竞品研究，可选，免费tier）
- Vercel Cron（定时触发，免费）

---

## 风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| Pipeline写 `/tmp` 在容器重启后丢失 | Evidence丢失 | 后续改为写入 S3/GCS |
| Jina Reader对某些站点的提取质量差 | 内容摘要不准确 | 降级：人工搜索摘要 |
| 微信草稿发布后公众号限制转发 | 发布失败 | 仅作草稿，人工确认后手动发布 |
| SEO评分标准与百度实际排名算法不符 | 误导内容优化方向 | 实测验证，持续调整权重 |

---

## 不在此版本范围内

- 多Agent协作系统（Orchestrator架构）
- 跨平台自动发布（微信/知乎/小红书）
- A/B测试实验框架
- 用户行为分析仪表板
- SEO排名实时监控
- 移动端原生App

---

## 成功标准

| 指标 | 目标 |
|------|------|
| Pipeline可成功执行完整6阶段 | ✅ |
| `/api/marketing/pipeline/run` 返回有效run_id | ✅ |
| Evidence输出包含 run.json + events.jsonl | ✅ |
| Solutions页面显示 notSuitable + seekCareSignals | ✅ |
| SEO/GEO评分支持5维度 | ✅ |
| WeChat渠道内容通过manual review审核 | ✅ |

---

## 下一步

1. CEO 审核并确认计划
2. Phase 0.1 开始：创建 API 端点
3. 部署到 staging 环境
4. 执行 Pipeline dry-run 测试
5. 验证 evidence 输出完整性
