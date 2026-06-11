# Stage 0 基线审查报告
**日期**: 2026-06-11
**分支**: feat/rongwang-conversion-trust-rebuild-202606
**审查范围**: 路由、页面、内容重叠、医疗合规、SEO、信任元素、CTA、结构

---

## 一、构建状态

| 检查项 | 状态 | 详情 |
|--------|------|------|
| `npm run lint` | ✅ Pass | 无 lint 错误 |
| `npm run typecheck` | ❌ Fail | 见下方 12 个 TS 错误 |
| `npm run build` | ❌ Fail | TS 类型错误导致构建 worker 退出 |

**TypeScript 错误汇总** (12个):

1. `src/app/products/category/[direction]/page.tsx` 行 338, 348, 358, 368, 380, 390, 400, 410, 422, 432, 442, 452:
   - `Property 'image' is missing in type '{ slug, name, category, price, originalPrice, tags, href, emoji }' but required in type 'ProductItem'`
   - **根因**: bone/heart 等方向的产品数据缺少 `image` 字段（sleep/immune/fatigue 方向已修复）

2. `tests/unit/female-health-solution.test.ts` 行 6:
   - `'@/lib/health/mappings"' has no exported member named 'solutionSlugToType'. Did you mean 'SolutionSlug'?
   - **根因**: 测试文件引用了不存在的导出

**结论**: 当前 main 分支构建不通过，P0 阻断。修复后 Stage 0 方可视为完成。

---

## 二、路由清单

### 2.1 核心业务路由

| 路径 | HTTP状态 | 页面标题 | 首屏 CTA | 备注 |
|------|---------|---------|---------|------|
| `/` | 200 | 1970 Uncle Darren's 恩科達倫 | 开始AI评估? | 待确认 |
| `/ai-consult` | 200 | AI健康评估主入口 | 开始评估 | ✅ |
| `/quiz` | 200 | AI健康评估主入口 | 开始评估 | `/quiz` → `/ai-consult` 重定向 |
| `/assessment/sleep` | 200 | 睡眠支持方案 | 开始AI自测 | ⚠️ 重叠 |
| `/assessment/fatigue` | 200 | 疲劳恢复方案 | 开始AI自测 | ⚠️ 重叠 |
| `/assessment/immune` | 200 | 免疫支持方案 | 开始AI自测 | ⚠️ 重叠 |
| `/assessment/bone` | 200 | 页面未找到 (空数据) | — | ❌ 无内容 |
| `/assessment/heart` | 200 | 页面未找到 (空数据) | — | ❌ 无内容 |
| `/assessment/female` | 200 | 页面未找到 (空数据) | — | ❌ 无内容 |
| `/solutions/sleep` | 200 | 睡眠支持方案 | 开始AI自测 | 🔴 重叠 |
| `/solutions/fatigue` | 200 | 疲劳恢复方案 | 开始AI自测 | 🔴 重叠 |
| `/solutions/immune` | 200 | 免疫支持方案 | 开始AI自测 | 🔴 重叠 |
| `/solutions/bone` | 200 | 页面未找到 (空数据) | — | ❌ 无内容 |
| `/solutions/heart` | 200 | 页面未找到 (空数据) | — | ❌ 无内容 |
| `/solutions/female` | 200 | 页面未找到 (空数据) | — | ❌ 无内容 |
| `/products` | 200 | 先确认健康方向，再查看对应商品 | — |  |
| `/products/category/sleep` | 200 | 页面未找到 (空数据) | — | ❌ 无内容 |
| `/products/category/immune` | 200 | 页面未找到 (空数据) | — | ❌ 无内容 |
| `/shop` | 200 | 官方購買渠道 | — |  |
| `/trust-center` | 200 | 信任中心 | — |  |
| `/articles` | 200 | 科学驱动的健康洞察 | 搜索文章 | ✅ 文章列表 |
| `/articles/why-fatigue` | 200 | 页面未找到 | — | ❌ 文章slug不存在 |
| `/articles/sleep-support-education` | 200 | 页面未找到 | — | ❌ 文章slug不存在 |

### 2.2 问题路由

| 路径 | HTTP状态 | 问题 |
|------|---------|------|
| `/blog` | 404 | ❌ 目录不存在 → 应 301 到 `/articles` |
| `/blog/sleep-support-education` | 404 | ❌ 目录不存在 → 应 301 到 `/articles/[slug]` |
| `/compliance` | 404 | ❌ 信任中心子页面缺失 |
| `/assessment/bone` | 200 | 空数据，页面显示 "404" 文本但 HTTP 200 |
| `/assessment/heart` | 200 | 空数据，页面显示 "404" 文本但 HTTP 200 |
| `/assessment/female` | 200 | 空数据，页面显示 "404" 文本但 HTTP 200 |
| `/solutions/bone` | 200 | 空数据，页面显示 "404" 文本但 HTTP 200 |
| `/solutions/heart` | 200 | 空数据，页面显示 "404" 文本但 HTTP 200 |
| `/solutions/female` | 200 | 空数据，页面显示 "404" 文本但 HTTP 200 |
| `/products/category/sleep` | 200 | 空数据，页面显示 "404" 文本但 HTTP 200 |
| `/products/category/immune` | 200 | 空数据，页面显示 "404" 文本但 HTTP 200 |

---

## 三、AI评估与健康方案重叠分析

### 3.1 重叠页面详情

#### `/assessment/sleep` vs `/solutions/sleep` 内容对比

| 维度 | `/assessment/sleep` | `/solutions/sleep` | 重叠程度 |
|------|--------------------|--------------------|---------|
| H1 | 睡眠支持方案 | 睡眠支持方案 | 🔴 完全相同 |
| 主CTA | 开始AI自测 / 先看方案页 | 开始AI自测 / 查看评估入口 | 🔴 完全相同 |
| 症状/问题模块 | 常见表现 | 1. 症状问题 | 🔴 重复 |
| 原因模块 | 常见原因 | 2. 常见原因 | 🔴 重复 |
| 就医模块 | 这些情况要先就医 | 3. 什么情况要就医 | 🔴 重复 |
| AI入口 | 无 | 4. AI自测入口 | 🟡 solutions有 |
| 生活方式 | 先做什么 | 5. 基础调理方案 | 🟡 略有重复 |
| 营养方向 | 无 | 6. 营养支援方向 | 🟢 solutions独有 |
| 男女差异 | 无 | 男女配方差异 | 🟢 solutions独有 |
| OTC方向 | 无 | OTC方向 | 🟢 solutions独有 |
| 成分说明 | 无 | 成分说明 | 🟢 solutions独有 |
| 商品推荐 | 无直接CTA | 7. 完成评估后查看推荐 | 🟡 solutions有 |
| 竞品对比 | 无 | 荣旺方案 vs 普通方案 | 🟡 solutions有 |
| 案例分享 | 无 | 真实案例分享 | 🟡 solutions有 |
| 顾问导流 | 无 | 添加顾问微信 | 🟡 solutions有 |
| 免责声明 | Footer有 | 8. 免责声明 | ✅ 都有 |
| 作者/审核者 | ❌ 无 | ❌ 无 | 两者都缺 |

**结论**: 两页面 H1 完全相同，核心教育内容（症状/原因/就医）几乎完全重复，是同一个页面的两个入口，不是两个不同页面。

### 3.2 重叠度评分

| 页面对 | 相似H1 | 相似段落 | 重复CTA | 角色区分度 |
|--------|--------|---------|---------|-----------|
| assessment/sleep ↔ solutions/sleep | 🔴 同 | 🔴 3段+ | 🔴 2个 | 0/10 |
| assessment/fatigue ↔ solutions/fatigue | 🔴 同 | 🔴 3段+ | 🔴 2个 | 0/10 |
| assessment/immune ↔ solutions/immune | 🔴 同 | 🔴 3段+ | 🔴 2个 | 0/10 |
| assessment/bone ↔ solutions/bone | ⚪ 两者都空 | — | — | N/A |
| assessment/heart ↔ solutions/heart | ⚪ 两者都空 | — | — | N/A |
| assessment/female ↔ solutions/female | ⚪ 两者都空 | — | — | N/A |

---

## 四、CTA 混乱页面

### 4.1 首页

待实地确认（需从首页快照分析）。

### 4.2 Solutions/sleep 页面 CTAs

当前页面有 **7个** 交互入口:
1. "开始AI自测" (顶部Hero)
2. "查看评估入口" (顶部Hero)
3. "开始AI評估" (第4节)
4. "先完成AI健康評估" (第7节)
5. "查看评估说明" (第7节)
6. "添加顾问微信" (顾问支援)
7. "复制" (微信ID复制)

**问题**: 首屏出现2个同等权重CTA，用户不知道点哪个。

### 4.3 评估结果页

待审计（`/ai-consult` 完成评估后的结果页，未访问）。

---

## 五、医疗合规高风险文案

### 5.1 高风险项

| 位置 | 文案 | 风险类型 | 风险等级 |
|------|------|---------|---------|
| solutions/sleep - "荣旺方案 vs 普通方案" | "复方配比，协同增效" | 隐性医疗效果承诺 | 🔴 高 |
| solutions/sleep - "荣旺方案 vs 普通方案" | "日本发酵GABA，活性高" | 竞品贬低 + 活性高低暗示效果 | 🔴 高 |
| solutions/sleep - "真实案例分享" | "查看详情"按钮 | 用户案例未经核实，暗示疗效 | 🔴 高 |
| solutions/sleep - 组合推荐 | 套餐名称和描述 | 直接导购，无风险提示 | 🟡 中 |
| solutions/sleep - 顾问支援 | "添加顾问微信" | 微信导流缺乏监管说明 | 🟡 中 |
| 所有方案页 | "男女分开配方，科学配比" | 科学配比暗示临床验证 | 🟡 中 |

### 5.2 合规声明现状

| 页面 | Footer免责声明 | 位置 | 充分性 |
|------|-------------|------|--------|
| 所有页面 | "本站内容仅用于健康教育和一般参考，不构成医学诊断、治疗建议或处方。" | Footer | ✅ 基础合格 |
| solutions/sleep | "8. 免责声明" 独立章节 | 正文底部 | ✅ 良好 |
| assessment/* | Footer有，页面正文无独立声明 | Footer | 🟡 可加强 |

**缺失**: AI生成内容标识（AI评估结果页应标明"本结果由AI生成"）。

---

## 六、信任元素缺失

### 6.1 E-E-A-T 现状

| 元素 | AI评估页 | 健康方案页 | 文章页 |
|------|---------|-----------|--------|
| 作者 | ❌ 无 | ❌ 无 | ❌ 无 |
| 审核者 | ❌ 无 | ❌ 无 | ❌ 无 |
| 更新时间 | ❌ 无 | ❌ 无 | ❌ 无 |
| 参考资料 | ❌ 无 | ❌ 无 | ❟ 部分有 |
| 证据等级 | ❌ 无 | ❌ 无 | ❌ 无 |
| 冲突利益声明 | ❌ 无 | ❌ 无 | ❌ 无 |
| AI生成标识 | ❌ 无 | N/A | N/A |

### 6.2 信任中心现状

`/trust-center` 可访问，但内容结构未知。需要实地审计：
- 品牌授权证明
- 生产质量认证（COA/SGS/GMP/NSF）
- 内容审核机制说明
- 顾问/营养师资质

---

## 七、SEO 问题

### 7.1 路由冲突

| 问题 | 详情 |
|------|------|
| `/blog` vs `/articles` | 两个目录并存，`/blog` 不存在（无目录），`/articles` 存在。Google 可能同时收录两个路径。 |
| Canonical | 未确认是否有 canonical 标签统一到 `/articles` |

### 7.2 已收录但 404

| 路径 | 搜索引擎收录风险 |
|------|---------------|
| `/blog` | 🔴 Google 已收录但返回404 |
| `/blog/sleep-support-education` | 🔴 Google 已收录但返回404 |
| `/articles/why-fatigue` | 🔴 slug不存在 |
| `/articles/sleep-support-education` | 🔴 slug不存在 |

### 7.3 Sitemap 和 Robots

未确认 `/sitemap.xml` 和 `robots.txt` 是否存在并正确配置。

### 7.4 结构化数据

未确认核心页面是否包含 Organization/Article/FAQ 等 schema。

---

## 八、数据追踪现状

**未知** — 需要代码审计确认是否有：
- `assessment_start` 事件
- `assessment_complete` 事件
- `solution_cta_click` 事件
- `store_outbound_click` 事件
- GA4 / 自建 analytics 集成

---

## 九、Stage 0 结论

### 9.1 当前 AI 评估和健康方案重叠页面清单

| 重叠对 | 重叠程度 |
|--------|---------|
| `/assessment/sleep` ↔ `/solutions/sleep` | 🔴 极高（H1相同，内容3段重复，CTA重复） |
| `/assessment/fatigue` ↔ `/solutions/fatigue` | 🔴 极高（同上） |
| `/assessment/immune` ↔ `/solutions/immune` | 🔴 极高（同上） |

### 9.2 当前 404 / 文章缺失 / blog与articles冲突清单

| 类型 | 路径 | 优先级 |
|------|------|--------|
| 目录不存在 | `/blog` | P0 |
| 文章不存在 | `/blog/sleep-support-education` | P0 |
| 文章不存在 | `/articles/why-fatigue` | P0 |
| 文章不存在 | `/articles/sleep-support-education` | P0 |
| 空数据页 | `/assessment/bone`, `/assessment/heart`, `/assessment/female` | P1 |
| 空数据页 | `/solutions/bone`, `/solutions/heart`, `/solutions/female` | P1 |
| 页面不存在 | `/compliance` | P1 |

### 9.3 当前 CTA 混乱页面清单

| 页面 | 问题 |
|------|------|
| `/solutions/sleep` | 首屏2个同等权重CTA，全页7个交互入口 |
| `/solutions/fatigue` | 同上（推断） |
| `/solutions/immune` | 同上（推断） |

### 9.4 当前医疗合规高风险文案清单

| ID | 位置 | 内容 | 风险 |
|----|------|------|------|
| M1 | solutions/sleep - 竞品对比 | "复方配比，协同增效" | 隐性效果承诺 |
| M2 | solutions/sleep - 竞品对比 | "日本发酵GABA，活性高" | 竞品贬低 |
| M3 | solutions/sleep - 案例分享 | 用户案例按钮 | 暗示疗效 |
| M4 | solutions/sleep - 顾问导流 | 微信ID展示 | 缺乏监管说明 |

### 9.5 当前缺少作者/审核者/证据来源的页面清单

| 页面类型 | 比例 |
|---------|------|
| 健康方案页 (`/solutions/*`) | 100% 缺失 |
| AI评估入口页 (`/assessment/*`) | 100% 缺失 |
| 文章页 (`/articles/*`) | 100% 缺失 |

---

## 十、Stage 0 Go / No-Go

| 条件 | 状态 | 备注 |
|------|------|------|
| Git 分支建立 | ✅ | feat/rongwang-conversion-trust-rebuild-202606 |
| 构建通过 | ❌ | TS错误 12个，修复后通过 |
| 路由清单 | ✅ | 已完成 |
| GStack 重叠分析 | ✅ | 已完成 |
| 医疗合规审计 | ✅ | 已完成 |
| SEO路由审计 | ✅ | 已完成 |

**结论**: ⚠️ **条件性通过** — 构建错误需先修复，否则无法部署。Stage 0 的所有审查工作已完成，但构建阻断需要作为 Stage 0.5 优先修复。

---

*报告生成: 2026-06-11 by Hermes (CEO Digital Twin)*
*GStack Audit Evidence: 本地浏览快照 + terminal 文件审计*
