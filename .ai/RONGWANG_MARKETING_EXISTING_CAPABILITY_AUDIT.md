# 荣旺健康平台 — 现有营销能力审计报告

**审计时间**: 2025-06-14
**审计人**: Hermes (CEO Digital Twin)
**版本**: v1.0

---

## 一、现有资产总览

| # | 文件路径 | 行数 | 用途 |
|---|---------|------|------|
| 1 | `src/lib/marketing/ai-content-generator.ts` | 432 | AI内容生成引擎（5渠道） |
| 2 | `src/app/api/marketing/content-generate/route.ts` | 247 | 内容生成API端点 |
| 3 | `src/lib/marketing/pipeline-runner.ts` | 785 | 6阶段Pipeline状态机 |
| 4 | `src/lib/marketing/job-types.ts` | 474 | 类型定义+PipelineStepResult |
| 5 | `src/lib/marketing/manual-review.ts` | 262 | 人工复核队列（飞书通知） |
| 6 | `src/lib/marketing/adapters/evidence-writer.ts` | 94 | Evidence日志写入 |
| 7 | `src/lib/marketing/adapters/wechatsync.ts` | 172 | 微信公众号草稿发布 |
| 8 | `src/lib/marketing/seo-ready-score.ts` | 159 | SEO评分计算器 |
| 9 | `src/lib/marketing/automation.ts` | 313 | 合规检查+营销活动编排 |
| 10 | `src/lib/marketing/geoflow.ts` | 126 | GeoFlow自动化配置 |
| 11 | `src/lib/marketing/content-topics.ts` | 258 | 选题库（18个选题） |
| 12 | `src/scripts/marketing/pipeline-cli.ts` | 322 | Pipeline CLI入口 |
| 13 | `src/lib/marketing/feature-flags.ts` | 68 | 功能开关系统 |
| 14 | `src/lib/ai/provider.ts` | - | AI Provider（DeepSeek/MiniMax） |

---

## 二、逐项审计

### 资产 1: `ai-content-generator.ts`

**功能**: 自有AI营销内容生成引擎
- 支持渠道: `seo_article` | `wechat` | `email` | `xiaohongshu` | `douyin`
- 调用 `generateTextWithProvider` (DeepSeek/MiniMax)
- 内置合规规则（`COMPLIANCE_RULES`）
- 自动计算字数、关键词密度

**输入参数** (`ContentGenerationRequest`):
```typescript
{
  topic: ContentTopic;
  channel: MarketingChannel;
  tone?: "educational" | "conversational" | "professional";
  primaryCtaHref?: string;
  secondaryHref?: string;
  solutionSlug?: string;
}
```

**输出** (`GeneratedContent`):
```typescript
{
  topicId, channel, title, content, excerpt, keywords, wordCount,
  compliance: MarketingComplianceResult, metaDescription, provider, elapsedMs
}
```

**健康内容合规声明** (内置):
```
本内容仅用于健康管理和营养知识参考，不替代医生诊断、治疗或用药建议。如有持续不适或慢性疾病，请咨询专业医生。
```

**合规禁止词**: 治愈、治疗、诊断、处方、100%、保证、一定、永久、彻底、无副作用、最有效、唯一、首选、零风险

**可复用**: ✅ 直接复用。不需要重写内容生成系统。

**测试**: ❌ 无单元测试。

**日志**: ❌ 无结构化日志。

**错误处理**: ✅ `ContentGenerationResult` 有 `error?: string`，失败时有 `skipReason`。

**外部API Key**: ❌ 不直接存储key，通过 `@/lib/ai/provider` 间接调用。

---

### 资产 2: `/api/marketing/content-generate/route.ts`

**功能**: HTTP API端点，POST接收内容生成请求
- 管理员鉴权 (`isAdminRequestAuthorized`)
- 速率限制 (`checkRateLimit`，12次/10分钟)
- 调用 `generateMarketingContent`
- 写入 `MarketingPost` 表

**输入**: `topicId` + `channel` + `tone` + `primaryCtaHref` + `dryRun`

**输出**: JSON `{ success, generated?, error?, complianceWarnings }`

**可复用**: ✅ Pipeline通过 `ai-content-generator.ts` 复用，不直接调用此API（避免HTTP overhead）。

**测试**: ❌ 无测试。

**错误处理**: ✅ 有 401/429/400/500 分支返回。

---

### 资产 3: `pipeline-runner.ts` ⚠️ 核心已有资产

**功能**: 6阶段状态机 Pipeline Runner（已完整实现）

**Phase流程**:
```
prepare → generate_content → seo_geo_gate → publish_drafts → baseline_snapshot → finalize
```

**PipelineStepResult** (每步必须返回):
```typescript
{
  step: PipelinePhase;
  status: "success" | "warning" | "failed" | "skipped";
  durationMs: number;
  retryCount: number;
  output?: T;
  error?: string;
  nextAction: NextAction; // "continue" | "manual_review" | "abort"
  evidence: EvidenceRef[];
}
```

**关键设计**:
- Evidence写入 `/tmp/marketing-pipeline/evidence/{jobId}/{runId}/` ⚠️ `/tmp` 会丢失
- shadow_mode 支持（跳过publish步骤）
- 人类审核门 (`human_review_required`)
- 自动重试 (`max_retries`)
- 事件日志写入 `events.jsonl`

**可复用**: ✅ 核心状态机已存在。但需要:
1. 将 evidence 路径迁移到持久化存储
2. 适配新的 `MarketingJob` Schema（本计划Phase 2）
3. 接入本计划的 SEO/GEO Checker（本计划Phase 5）

**测试**: ❌ 无测试。

---

### 资产 4: `job-types.ts`

**功能**: Pipeline类型定义（已完整）

**关键类型**:
- `MarketingJob` - 输入Job结构
- `PipelineStepResult<T>` - 每步结果
- `SeoReadyScoreDetail` - SEO评分（6项，0-100）
- `Platform` = `"website" | "wechat" | "xiaohongshu" | "zhihu"`
- `PublishMode` = `"dry-run" | "draft" | "manual"`
- `ErrorCode` - 错误码枚举
- `RunRecord` - 最终运行记录

**现有 `MarketingJob` 结构** (部分):
```typescript
{
  job_id: string;
  source: { url?: string; brief_markdown?: string; title_hint?: string };
  seo: { primary_keyword: string; secondary_keywords?: string[] };
  content: { template_key: string; human_review_required?: boolean; ... };
  distribution: { publish_mode: PublishMode; channels: Array<{platform: Platform}> };
  runtime: { shadow_mode?: boolean; timeout_seconds?: number; max_retries?: number; ... };
}
```

**可复用**: ⚠️ 已有类型定义，但本计划需要新增简化版 `MarketingJobV2` Schema用于外部触发（CLI/API）

**测试**: ❌ 无测试。

---

### 资产 5: `manual-review.ts`

**功能**: 人工复核队列 + 飞书通知

**核心函数**:
- `enqueueManualReview(packages: ManualReviewPackage[])` - 写入复核队列
- `getPendingReviews()` - 读取待审核
- `processReviewAction(reviewId, action, reviewer)` - 处理审核动作

**输出位置**: `data/marketing-review-queue.json`

**可复用**: ✅ 保留。继续用于 Pipeline 人类审核门。

**测试**: ❌ 无测试。

---

### 资产 6: `evidence-writer.ts`

**功能**: Evidence日志写入（JSON + JSONL双输出）

**输出**: `{runId}-{timestamp}.json` + `{runId}-{timestamp}.jsonl`

**路径**: `/tmp/marketing-pipeline/evidence/` ⚠️ **缺陷：容器重启后数据丢失**

**可复用**: ✅ 结构可用，但必须迁移到 Vercel KV 或挂载 volume。

**测试**: ❌ 无测试。

---

### 资产 7: `wechatsync.ts`

**功能**: 微信公众号草稿发布（Docker Wechatsync）

**核心函数**:
- `isWechatsyncRunning()` - 检查容器状态
- `publishWechatDraft(input)` - 发布草稿
- `isChromeProfileAvailable()` - Cookie持久化检查

**Feature Flag**: `FEATURE_WECHATSYNC_ENABLED`

**发布模式**: 只支持 `draft`（不自动正式发布）

**可复用**: ✅ 已实现 draft-first。本计划直接复用。

**Cookie**: 挂载 `/root/.config/google-chrome` 到容器（只读）

**测试**: ❌ 无测试。

---

### 资产 8: `seo-ready-score.ts`

**功能**: SEO评分计算器（中英文双语）

**评分维度** (6项，权重各异):
- `title_h1`: 20%
- `author_reviewer_sources`: 20%
- `content_uniqueness`: 15%
- `article_jsonld`: 15%
- `meta_canonical_date`: 10%
- `internal_links_cta`: 10%
- `image_alt_visibility`: 10%

**可复用**: ✅ 已实现。可作为 `SeoReadyScoreDetail` 来源。

**注意**: 本计划 Phase 5 新增的 `seo-geo-checker.ts` 检查项与此处有重叠，应统一。

**测试**: ❌ 无测试。

---

### 资产 9: `automation.ts`

**功能**:
1. `evaluateMarketingCompliance()` - 健康内容合规检查
2. `buildMarketingCampaignPlan()` - 营销活动编排（调用GeoFlow）

**合规规则** (已有):
```typescript
const riskyPatterns = [
  /治愈|根治|治疗|诊断|处方/,
  /100%|保证|一定|永久|彻底/,
  ...
];
```

**可复用**: ✅ `evaluateMarketingCompliance` 复用。Phase 5 将其集成到 SEO/GEO Checker。

**测试**: ❌ 无测试。

---

### 资产 10: `geoflow.ts`

**功能**: GeoFlow自动化平台配置

**状态**: `getGeoFlowAutomationStatus()` 返回 `configured: boolean`

**本计划**: 本轮不使用GeoFlow自动化（Phase 2预留）

**可复用**: N/A（配置层）

---

### 资产 11: `content-topics.ts`

**功能**: 选题库（18个选题）

**数据结构**:
```typescript
{
  id: string;
  category: 'SEO文章' | '小红书种草' | '抖音脚本' | '公众号推文' | '邮件营销' | '案例故事';
  solutionSlug?: string;
  title: string;
  keywords: string[];
  summary: string;
  priority: 1 | 2 | 3;
  wordCount?: number;
  contentType: '教育科普' | '产品种草' | '用户故事' | '热点借势' | '清单攻略' | '对比评测';
}
```

**可复用**: ✅ 选题库直接作为 `ContentTopic[]` 输入给内容生成器。

---

### 资产 12: `pipeline-cli.ts`

**功能**: Pipeline CLI入口

**命令示例**:
```bash
pnpm tsx scripts/marketing/pipeline-cli.ts --job ./jobs/health-education-001.json
pnpm tsx scripts/marketing/pipeline-cli.ts --trigger cron --job-id mj_health_edu_001
pnpm tsx scripts/marketing/pipeline-cli.ts --approve mj_xxx run_xxx --reviewer alice
```

**可复用**: ✅ CLI已存在。本计划需要新增 `--dry-run` 和 `--locale` 参数支持。

---

### 资产 13: `feature-flags.ts`

**功能**: 功能开关系统

**已有开关**:
```typescript
FEATURE_MARKETING_CONTENT_AI=false
FEATURE_WECHATSYNC_ENABLED=false
FEATURE_GEOFLOW_AUTOMATION=false
```

**本计划新增**:
```typescript
FEATURE_MARKETING_PIPELINE=false  // Pipeline总开关
FEATURE_MARKETING_AUTOPILOT=false  // 自动发布开关（默认false）
```

---

### 资产 14: AI Provider

**功能**: 统一AI调用（支持DeepSeek/MiniMax）

**调用方式**:
```typescript
const result = await generateTextWithProvider({ prompt, model: 'deepseek', maxTokens: 2000 });
```

**可复用**: ✅ 内容生成和Pipeline都通过此Provider调用AI。

---

## 三、缺失项清单（按优先级）

| 优先级 | 缺失项 | 严重程度 | 对应Phase |
|--------|--------|----------|----------|
| P0 | Evidence路径持久化（`/tmp` → Vercel KV） | 致命 | Phase 0 |
| P0 | Pipeline无HTTP API触发入口 | 阻塞 | Phase 3 |
| P0 | 无本地SEO/GEO Checker | 阻塞 | Phase 5 |
| P1 | RankParser Adapter（可选增强） | 高 | Phase 6 |
| P1 | Manual Pack Fallback生成器 | 高 | Phase 8 |
| P1 | 错误处理增强 | 高 | Phase 10 |
| P2 | Feature Flags增强 | 中 | Phase 11 |
| P2 | Internal Skills目录（SOP） | 中 | Phase 12 |
| P3 | 完整单元测试覆盖 | 中 | Tests |
| P3 | Cron触发器配置 | 低 | Phase 2预留 |

---

## 四、已有测试覆盖

**现有测试**: ❌ 无任何营销相关单元测试

**本计划测试需求** (10个):
1. `marketing-job.schema` - Job验证
2. `seo-geo-checker` - SEO评分
3. `content-generator-wrapper` - 生成器包装
4. `pipeline-runner` dry-run
5. RankParser timeout fallback
6. RankParser empty fallback
7. Wechatsync unavailable fallback
8. Manual pack生成
9. Evidence logger
10. Feature flag disabled

---

## 五、审计结论

**已有能力评分** (0-10):
- 内容生成: 9/10 ✅ 完整可用
- Pipeline状态机: 8/10 ✅ 已存在，需适配
- 合规检查: 8/10 ✅ 已集成
- SEO评分: 7/10 ✅ 存在，与Checker需统一
- Wechat草稿发布: 7/10 ✅ draft模式已就绪
- Evidence日志: 5/10 ⚠️ `/tmp` 路径致命缺陷
- 错误处理: 6/10 ⚠️ 基础有，需增强
- 测试覆盖: 0/10 ❌ 完全缺失

**核心判断**: Pipeline v1 MVP 基础已大部分存在。主要工作不是从零构建，而是**串联已有资产 + 修复架构缺陷（/tmp）+ 新增缺失项（SEO Checker、Manual Pack）**。

**本计划执行顺序**（优化版）:
- **Day 1**: 本审计报告 + Job Schema（本计划简化版，不改动原有job-types.ts）
- **Day 2**: Pipeline适配新Schema + Evidence路径修复 + 内容生成Wrapper
- **Day 3**: SEO/GEO Checker + 健康合规集成
- **Day 4**: RankParser Adapter + Manual Pack
- **Day 5**: 错误处理 + Feature Flags + Wechatsync增强
- **Day 6**: 补测试 + Evidence Logger
- **Day 7**: CEO Gate + 输出文件