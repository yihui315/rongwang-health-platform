# SEO/GEO Checker Skill

**Skill 版本**: v1.0 | **对应 Phase**: Phase 5 | **触发**: Pipeline runSeoGeoGate()

---

## 目的

在内容生成后、发布前，对内容进行本地 SEO/GEO 合规和质量检查。
不依赖外部 API，使用纯本地逻辑判断。

---

## 触发条件

Pipeline Phase `seo_geo_gate` 自动触发，或手动调用:

```typescript
import { checkSeoGeo } from '@/lib/marketing/seo-geo-checker';

const report = checkSeoGeo({
  title: '...',
  bodyMarkdown: '...',
  targetKeyword: '睡眠不好怎么调理',
  metaTitle: '...',
  metaDescription: '...',
  landingPageUrl: 'https://rongwang.hk/ai-health-check',
});
```

---

## 检查项（12项）

| ID | 名称 | 权重 | 通过条件 |
|----|------|------|---------|
| `title_contains_keyword` | Title 包含关键词 | 8 | title 包含 targetKeyword |
| `meta_title_exists` | Meta Title 存在 | 5 | metaTitle ≥ 10 字符 |
| `meta_description_exists` | Meta Description | 5 | metaDescription ≥ 80 字符 |
| `has_h_structure` | H1/H2 结构 | 7 | 有 H1 + ≥2 个 H2 |
| `has_faq` | FAQ 内容 | 6 | 包含 FAQ/常见问题 |
| `has_cta` | CTA 存在 | 7 | 有明确的行动引导 |
| `has_brand_mention` | 品牌提及 | 5 | 包含"荣旺"或"Rongwang" |
| `has_ai_health_check_cta` | AI健康自测入口 | 8 | 包含 AI健康自测/测评 |
| `has_medical_disclaimer` | 医疗免责声明 | 10 | 包含免责声明 |
| `no_medical_exaggeration` | 无医疗夸大 | 10 | 无治愈/治疗/100%等词 |
| `ai_summary_ready` | AI摘要就绪 | 6 | 标题+列表+数据 ≥2 项 |
| `entity_clarity` | 实体信息清晰 | 5 | 有联系方式或落地页 |

---

## 评分计算

```
score = (Σ 通过项权重×1.0 + Σ 警告项权重×0.5) / Σ 总权重 × 100
```

---

## 等级阈值

| 分数 | Grade | 动作 |
|------|-------|------|
| 90-100 | `publishable` | 可直接发布 |
| 75-89 | `draft_only` | 可草稿发布，需人工复核 |
| 60-74 | `manual_pack` | 只生成手动发布包 |
| <60 | `blocked` | 禁止进入发布步骤 |

---

## 健康合规检查

使用 `evaluateMarketingCompliance()` 从 `automation.ts`。

**禁止词汇**:
- 治愈、根治、治疗、诊断、处方
- 100%、保证、一定、永久、彻底
- 最有效、唯一、首选、零风险
- 替代医生、替代药物

**必须词汇**:
- 本内容仅用于健康管理和营养知识参考，不替代医生诊断、治疗或用药建议

---

## 输出格式

```typescript
interface SeoGeoReport {
  passed: boolean;          // score >= 75
  score: number;            // 0-100
  grade: 'publishable' | 'draft_only' | 'manual_pack' | 'blocked';
  checks: SeoGeoCheckItem[];
  fallbackUsed: boolean;    // 永远 false (本地检查)
  warnings: string[];       // 所有警告
  blockers: string[];       // 导致 fail 的项
}
```

---

## 失败处理

- score < 60 → Pipeline 进入 `manual_review`，不自动发布
- medical exaggeration → 硬性阻止，生成完整 manual pack
- 无免责声明 → 硬性阻止

---

## 已知限制

- 本地检查无法检测真实的 Google/百度排名
- 小红书平台特殊规则（emoji、字数）需要人工审核
- 英文内容支持有限（主要优化中文内容）
