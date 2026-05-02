# 荣旺健康 · Marketing Skills 应用映射指南

> 基于 Corey Haines [marketingskills](https://github.com/coreyhaines31/marketingskills) v1.0
> 适用：跨境保健品 + OTC 电商 | AI Agent 驱动全平台营销

---

## 一、Skills 完整分类索引

| 类别 | Skills | 数量 |
|------|--------|------|
| **内容与 SEO** | `ai-seo` `seo-audit` `content-strategy` `programmatic-seo` `copywriting` `copy-editing` `schema-markup` `image` | 8 |
| **社交媒体** | `social-content` `video` | 2 |
| **获客与转化** | `page-cro` `form-cro` `popup-cro` `signup-flow-cro` `lead-magnets` `onboarding-cro` `paywall-upgrade-cro` | 7 |
| **获客渠道** | `paid-ads` `cold-email` `referral-program` `community-marketing` `directory-submissions` `free-tool-strategy` | 6 |
| **客户留存** | `churn-prevention` `email-sequence` `revops` `sales-enablement` | 4 |
| **竞争情报** | `competitor-profiling` `competitor-alternatives` `customer-research` `aso-audit` | 4 |
| **产品与定价** | `pricing-strategy` `product-marketing-context` `launch-strategy` `ad-creative` | 4 |
| **分析优化** | `analytics-tracking` `ab-test-setup` `marketing-psychology` `marketing-ideas` | 4 |
| **技术平台** | `site-architecture` `video` | 2 |
| **其他** | `marketing-ideas` | 1 |

**总计：42 个 skills**

---

## 二、荣旺优先级矩阵

### 🔴 立即使用（当前最需要）

| Skill | 为什么现在需要 | 预期产出 |
|-------|----------------|---------|
| **`ai-seo`** | GEO 是荣旺最短板，也是增长最快的机会 | Wikipedia 占位、引用优化、GEO 检查清单 |
| **`content-strategy`** | 内容 pillar 已规划，需要具体文章选题和月度排期 | 6个月内容日历 + 选题优先级表 |
| **`schema-markup`** | 所有页面缺少结构化数据，影响 AI 引用率 | 各页面 Schema 实现方案 |
| **`copywriting`** | 落地页文案需要升级，提高留资转化率 | 新版落地页完整文案 |
| **`social-content`** | 抖音/小红书需要脚本模板和内容日历 | 30天内容日历 + 脚本模板 |

### 🟡 下个月引入

| Skill | 引入时机 | 预期产出 |
|-------|---------|---------|
| **`seo-audit`** | 当有明确 SEO 流量下降或其他问题时 | 完整技术 SEO 审计报告 |
| **`page-cro`** | 落地页上线后需要优化转化率 | A/B 测试方案 + 优化建议 |
| **`lead-magnets`** | 私域积累到 200+ 用户后 | 免费健康测评/电子书等钩子 |
| **`competitor-profiling`** | 开始做小红书/知乎前 | 竞品内容策略分析报告 |
| **`email-sequence`** | 微信私域启动后 | 欢迎序列 + 培育序列 |

### 🟢 后续扩展

| Skill | 时机 | 用途 |
|-------|------|------|
| `programmatic-seo` | 内容库 50+ 篇后 | 批量生成产品对比页 |
| `video` | 抖音/小红书账号成熟后 | 视频内容脚本工厂化 |
| `paid-ads` | 有稳定转化数据后 | Google/抖音广告投放 |
| `referral-program` | 用户基数 1000+ 后 | 老带新推荐体系 |
| `churn-prevention` | 会员体系建立后 | 流失预警 + 召回序列 |

---

## 三、Skill 深度应用指南

### 3.1 `ai-seo` — AI 搜索优化（最优先级）

**荣旺当前问题：** 完全没有 GEO 覆盖，AI 搜索引擎（ChatGPT/Perplexity/豆包）不知道荣旺

**应用步骤：**

#### Step 1：AI 可见性审计（立即做）

手动检查 10-20 个核心查询：

| 查询 | 平台 | 你被引用？ | 竞品被引用？ |
|------|------|----------|-------------|
| 解酒保健品有用吗 | ChatGPT | ? | ? |
| 女性疲劳吃什么 | Perplexity | ? | ? |
| AKK菌减肥有效吗 | 豆包 | ? | ? |
| NMN抗衰老真的吗 | Google AI | ? | ? |
| 睡眠障碍保健品推荐 | Bing Copilot | ? | ? |

#### Step 2：机器人允许名单检查

检查 `robots.txt` 是否阻止了这些 AI 爬虫：

```bash
# 检查是否阻止
curl -s https://rongwang.hk/robots.txt | grep -i "bot\|crawl"
```

**必须允许的爬虫（不能阻止）：**
- `GPTBot` / `ChatGPT-User` — OpenAI
- `PerplexityBot` — Perplexity
- `ClaudeBot` — Anthropic
- `Google-Extended` — Google Gemini
- `Bingbot` — Microsoft Copilot

#### Step 3：Wikipedia 占位（核心行动）

用 `ai-seo` 的 Princeton GEO 研究方法，占位计划：

**中文 Wikipedia（立即做）：**
- [ ] AKK菌 (Akkermansia muciniphila) — 创建或大幅扩充
- [ ] NADH 还原型辅酶 — 补充保健应用
- [ ] 牛樟芝 — 补充现代研究数据
- [ ] 谷胱甘肽 — 补充口服美容方向

**英文 Wikipedia（本月做）：**
- [ ] AKKermansia muciniphila probiotic — 创建（当前极少内容）
- [ ] NADH supplement — 补充

#### Step 4：内容 Extractability 优化

每个文章页必须包含：

```
✅ 清晰的定义（在第一段就回答"什么是X"）
✅ 自包含的答案块（脱离上下文也能理解）
✅ 统计数据 + 来源引用（+37% 引用率）
✅ 专家语录 + 署名（+30% 引用率）
✅ FAQ 块（自然语言问题）
✅ Schema markup（FAQPage / Article / Product）
✅ "最后更新"日期（显示新鲜度）
```

#### Step 5：第三方存在优化

AI 引用第三方来源 > 自有网站。要做：
- [ ] Reddit r/supplements 发帖讨论（真实参与，不是广告）
- [ ] 知乎高赞回答（带来源链接）
- [ ] 行业媒体投稿或被引用
- [ ] YouTube 视频（Google AI Overviews 常引用视频）

---

### 3.2 `content-strategy` — 内容战略（第二优先级）

**已有框架：** 6大内容集群（疲劳/睡眠/免疫/代谢/肝脏/抗衰）

**应用 `content-strategy` 框架的 4 个问题：**

#### Q1: 客户问题（从销售对话/客服工单中提取）

| 问题类型 | 典型问法 | 对应内容 |
|---------|---------|---------|
| 认知阶段 | "解酒片有用吗？" | 科普文章 |
| 考虑阶段 | "NADH vs 奶蓟草，哪个好？" | 对比评测 |
| 决策阶段 | "哪里买正品？" | 购买指南 |
| 使用阶段 | "吃了没效果怎么办？" | 使用指南/FAQ |

#### Q2: 竞品内容差距

用搜索分析竞品没覆盖的：

| 机会 | 竞品状态 | 荣旺机会 |
|------|---------|---------|
| AKK菌中文深度科普 | 几乎没有 | **立即做，占先机** |
| NADH 解酒机制 | 极少 | 马上做 |
| 女性疲劳综合方案 | 有，但不系统 | 做得更系统 |
| 护肝 vs 解酒的区别 | 空白 | 填补空白 |

#### Q3: 内容形式优先级

根据 `ai-seo` 数据，引用率排名：

| 内容类型 | AI 引用率 | 荣旺优先级 |
|---------|---------|-----------|
| **对比评测** | ~33% | ⭐⭐⭐ 最高 |
| **权威指南** | ~15% | ⭐⭐⭐ 最高 |
| **原创数据/研究** | ~12% | ⭐⭐ 中 |
| **Best-of 榜单** | ~10% | ⭐⭐ 中 |
| **How-To 教程** | ~8% | ⭐⭐ 中 |

**结论：** 荣旺最应该做的是**对比评测**（AKK菌 vs 普通益生菌、NADH vs 奶蓟草）和**权威指南**（女性疲劳完整方案）

#### Q4: 内容 pillar 结构（修订版）

基于 `content-strategy` 框架，修订 6 大 pillar：

```
Pillar 1: 解酒护肝
├── 对比：NADH vs 奶蓟草 vs 牛樟芝
├── 场景：经常应酬/偶尔喝酒/脂肪肝
├── 指南：解酒原理深度解析
└── 产品：7个方案选购指南

Pillar 2: 女性疲劳
├── 原因：缺铁/B族/甲状腺/慢性炎症
├── 方案：营养补充 + 生活习惯
├── 场景：经期/产后/围绝经期
└── 产品：活力奠基础餐

Pillar 3: 睡眠障碍
├── 类型：入睡困难/夜醒/浅睡眠
├── 成分：GABA/褪黑素/镁/南非醉茄
└── 产品：深度睡眠方案

Pillar 4: 肠道代谢（AKK菌为核心）
├── 科学：AKK菌机制/肠脑轴/GLP-1
├── 对比：AKK vs 传统益生菌
└── 产品：AKK代谢激活方案

Pillar 5: 免疫防御
├── 季节：换季/流感季/新冠期间
├── 成分：VD3+VK2/锌/接骨木莓
└── 产品：免疫防御方案

Pillar 6: 抗衰 NMN
├── 科学：NAD+/端粒/线粒体
├── 对比：NMN vs 白藜芦醇 vs 辅酶Q10
└── 产品：NMN12000/抗衰基础
```

---

### 3.3 `schema-markup` — 结构化数据（即刻实施）

**荣旺当前状态：** 所有页面无 Schema

**优先级实现清单：**

#### 🔴 高优先级（影响 GEO）

**落地页（women-fatigue / deep-sleep 等）：**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "女性慢性疲劳完整指南 | 荣旺健康",
  "author": {
    "@type": "Person",
    "name": "荣旺健康顾问"
  },
  "datePublished": "2026-04-24",
  "dateModified": "2026-04-24",
  "publisher": {
    "@type": "Organization",
    "name": "荣旺健康",
    "url": "https://rongwang.hk"
  },
  "mainEntity": {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "女性疲劳的原因是什么？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "..."
        }
      }
    ]
  }
}
```

**产品页（/products/[slug]）：**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "肝脏解酒方案",
  "description": "...",
  "image": "https://rongwang.hk/images/liver-plan.jpg",
  "offers": {
    "@type": "Offer",
    "url": "https://youlexuan.world/pdd/liver",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  },
  "brand": {
    "@type": "Brand",
    "name": "荣旺健康"
  }
}
```

**首页（Organization + WebSite）：**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "荣旺健康",
      "url": "https://rongwang.hk",
      "sameAs": [
        "https://xiaohongshu.com/@rongwang",
        "https://www.douyin.com/channel/..."
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@rongwang.hk"
      }
    },
    {
      "@type": "WebSite",
      "name": "荣旺健康",
      "url": "https://rongwang.hk",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://rongwang.hk/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

#### 🟡 中优先级

**Quiz 页面（HowTo Schema）：**
```json
{
  "@type": "HowTo",
  "name": "AI 健康测评",
  "description": "通过5个问题，AI分析您的健康状况并推荐个性化方案",
  "step": [
    {
      "@type": "HowToStep",
      "name": "回答5个健康问题",
      "text": "评估您的疲劳程度、睡眠质量、生活习惯"
    },
    {
      "@type": "HowToStep", 
      "name": "获取AI分析结果",
      "text": "基于您的回答，AI生成个性化健康方案"
    },
    {
      "@type": "HowToStep",
      "name": "获取专属推荐",
      "text": "获得为您定制的保健品组合建议"
    }
  ]
}
```

**FAQ 页面（所有落地页增加 FAQSchema）：**
- 已在 `seo.ts` 中有 FAQ 数据结构，确保每个落地页都输出 `FAQPage` schema

---

### 3.4 `social-content` — 社交内容（即刻实施）

**抖音内容日历（基于 `social-content` 的 Hook 框架）：**

#### 核心 Hook 公式（来自 social-content skill）

| Hook 类型 | 公式 | 荣旺示例 |
|-----------|------|---------|
| **好奇心 Hook** | "我之前对[普遍认知]的理解是错的" | "我之前以为解酒靠奶蓟草，原来NADH才是关键" |
| **价值 Hook** | "如何[期望结果]（不踩[常见坑]）" | "如何在应酬后不宿醉？（不靠喝蜂蜜水）" |
| **故事 Hook** | "3年前我[过去状态]，现在[现在状态]" | "3年前我天天熬夜应酬，现在精力充沛" |
| **反常识 Hook** | "不受欢迎的观点：[大胆声明]" | "市面上的护肝片大部分是智商税" |

#### 抖音 30 天内容日历

| 周 | 日期 | 内容类型 | 主题 | Hook | 时长 |
|----|------|---------|------|------|------|
| 第1周 | 周一 | 科普 | 为什么会疲劳？ | "你累不是因为老了，是因为这个" | 30s |
| 第1周 | 周三 | 产品测评 | NADH解酒片真实测评 | "喝了半斤白酒后2小时，我测了这个" | 45s |
| 第1周 | 周五 | 场景 | 应酬前/中/后完整方案 | "每次应酬前做这三步，老婆再也不担心" | 60s |
| 第2周 | 周一 | 对比 | AKK菌 vs 普通益生菌 | "益生菌吃了几年，你可能吃错了" | 30s |
| 第2周 | 周三 | 互动 | 疲劳等级测试 | "你的疲劳是几级？评论区告诉我" | 15s |
| 第2周 | 周五 | 科普 | 睡眠机制 | "为什么你总是浅睡眠？" | 30s |
| 第3周 | 周一 | 成分党 | GABA助眠科学吗 | "GABA安神到底有没有用？" | 30s |
| 第3周 | 周三 | 场景 | 换季免疫力 | "秋天最容易缺的营养，第一名出乎意料" | 30s |
| 第3周 | 周五 | 案例 | 客户见证 | "用户反馈：吃了30天，说说真实感受" | 45s |
| 第4周 | 周一 | 对比 | NMN vs 辅酶Q10 | "NMN和辅酶Q10，哪个更值得买？" | 30s |
| 第4周 | 周三 | 教程 | 选购指南 | "买保健品前，先看这5个成分指标" | 45s |
| 第4周 | 周五 | 总结 | 月度好物 | "本月最值得买的3款护肝产品" | 30s |

#### 小红书内容矩阵

| 类型 | 占比 | 示例标题 |
|------|------|---------|
| 种草笔记 | 40% | "坚持吃了30天NMN，说说真实感受" |
| 科普笔记 | 25% | "女生必看：经期疲劳的根源+调理方案" |
| 对比笔记 | 20% | "热门益生菌横评：AKK vs 普通益生菌" |
| 互动笔记 | 15% | "你的疲劳等级是多少？做完这个测试告诉我" |

---

### 3.5 `copywriting` — 文案优化（本周实施）

**落地页文案审计清单（使用 `copywriting` 原则）：**

#### 当前问题检测

| 检查项 | 当前状态 | 优化目标 |
|-------|---------|---------|
| Headline 清晰吗？ | ? | 一句话说清核心价值 |
| Subheadline 有具体数字吗？ | ? | 加入具体数字/比例 |
| CTA 文字是行动导向吗？ | ? | "开始测评" > "了解更多" |
| 有社会证明吗？ | ? | 添加具体用户见证 |
| 有对象感吗？ | ? | 用"你"而不是"用户" |
| 有清晰的风险逆转吗？ | ? | 添加不满意退款/顾问1v1 |

#### 转化文案公式（来自 `copywriting` skill）

**Headline 公式（选一个用）：**
```
✅ "应酬不伤身：AI 推荐个性化护肝方案"
✅ "经常疲劳？可能是你缺了这几种营养"
✅ "为什么应酬多的男人都在吃NADH？"
```

**Subheadline 公式：**
```
✅ "基于5个问题，AI分析你的疲劳类型，匹配最适合的保健品组合"
✅ "已有3,200+用户通过荣旺找到适合自己的健康方案"
```

**CTA 公式：**
```
✅ "开始免费测评 →"（免费 + 清晰动作）
✅ "获取你的专属方案 →"（个性化价值）
✅ "咨询健康顾问 →"（人际连接）
```

---

### 3.6 `page-cro` — 落地页转化优化（上线后做）

**留资弹窗 A/B 测试方案（基于 `page-cro`）：**

#### 当前 Quiz 流程

```
问卷(5题) → 留资弹窗(手机+姓名+微信) → AI结果页 → 拼多多CTA
```

#### 优化假设

| 假设 | 当前 | 测试版本A | 测试版本B |
|------|------|----------|----------|
| 弹窗时机 | 答完题立即 | 看到结果后 | 下滑50%后 |
| 留资字段 | 手机+姓名+微信 | 仅手机 | 手机+微信 |
| 激励 | 无 | "测评结果+健康报告" | "免费咨询顾问" |
| 弹窗形式 | 模态 | 角落卡片 | 底部滑入 |

---

### 3.7 `competitor-profiling` — 竞品分析（本月做）

**分析对象：**

| 竞品 | 平台 | 分析重点 |
|------|------|---------|
| 汤臣倍健 | 天猫/京东 | 产品线/定价/内容策略 |
| 澳洲 Healthy Care | 天猫国际 | 跨境电商打法/KOL策略 |
| NMN 品牌（如盼晴） | 独立站 | 英文内容/SEO策略 |
| 解酒品牌（如 Hydrodol） | 跨境 | 国际市场打法 |

**使用 `competitor-profiling` 框架：**

1. 找到竞品的内容：`site:竞争对手.com/blog`
2. 分析：top帖子/话题/结构/格式
3. 识别机会：他们没覆盖的角度
4. 行动：做得更好

---

### 3.8 `lead-magnets` — 留资钩子（私域启动后）

**免费资源分层（基于 `lead-magnets`）：**

| 层级 | 钩子 | 留资门槛 | 转化周期 |
|------|------|---------|---------|
| **免费** | AI健康测评（已有） | 手机号 | 即时 |
| **低价** | 《护肝成分指南》PDF | 9.9元 | 1-3天 |
| **免费** | 《女性疲劳自救手册》PDF | 微信添加 | 3-7天 |
| **免费** | 每周健康资讯 | 微信添加 | 长期培育 |
| **高价** | 1v1营养师咨询 | 299元 | 即时 |

---

## 四、技能组合工作流

### 工作流 A：每周内容生产管道

```
Day 1 (周一)
├── 用 `content-strategy` 确认本周选题
├── 用 `copywriting` 写文章大纲
└── 用 `ai-seo` 检查关键词密度

Day 2-3 (周二/周三)
├── 用 AI 生成初稿（基于 arxiv 论文素材）
├── 用 `copywriting` 原则优化
└── 添加 Schema markup

Day 4 (周四)
├── 拆分为多格式：
│   ├── 微信图文
│   ├── 小红书笔记
│   ├── 抖音脚本（用 `social-content` hook）
│   └── 知乎回答（扩展版）
└── 用 `schema-markup` 检查结构化数据

Day 5 (周五)
├── 发布到各平台
├── 用 `analytics-tracking` 记录数据
└── 规划下周内容（`content-strategy`）
```

### 工作流 B：竞品监控管道

```
每周一次
├── 用 `scrapling` 抓取竞品新内容
├── 用 `competitor-profiling` 分析
├── 识别内容差距
└── 更新 `content-strategy` 选题池
```

### 工作流 C：GEO 优化管道

```
每月一次
├── 手动检查20个核心查询的AI引用情况
├── 用 `ai-seo` 审计页面 extractability
├── 检查 robots.txt 是否阻止 AI 爬虫
├── 补充 Wikipedia 内容（用 arxiv 找科研依据）
└── 更新旧内容（新鲜度信号）
```

---

## 五、立即可执行的 Top 10 行动清单

### 本周（0-7天）

- [ ] **检查 robots.txt** — 确认允许所有 AI 爬虫
- [ ] **创建 /pricing.md** — 机器可读的定价文件（`ai-seo` 强调）
- [ ] **补充 3 个 Wikipedia 词条** — AKK菌、NADH、牛樟芝（先写草稿）
- [ ] **落地页增加 FAQSchema** — 所有 6 个落地页
- [ ] **落地页增加 Article Schema** — 作者、日期、发布者

### 本月（8-30天）

- [ ] **发布 10 篇 SEO 文章** — 覆盖 6 大集群关键词
- [ ] **创建 3 个新落地页** — 肝保护/AKK/NMN
- [ ] **启动抖音账号** — 发布 8 条短视频（按 30 天日历）
- [ ] **启动小红书账号** — 发布 10 篇笔记
- [ ] **完成竞品分析** — 用 `competitor-profiling` 分析 3 个竞品

### 下季度（31-90天）

- [ ] **建立向量内容库** — 用 `chroma` 管理 50+ 篇文章
- [ ] **AI quiz 留资 200+ 用户** — 私域启动
- [ ] **GEO 引用率提升** — 在 5 个核心查询上被 AI 引用
- [ ] **启动 YouTube 频道** — 英文市场布局
- [ ] **付费广告测试** — Google Ads / 抖音 Ads 各 5000 元预算

---

## 六、Skills 工具链映射

| 任务 | Skills 使用 | 其他工具配合 |
|------|-----------|------------|
| 竞品内容抓取 | `competitor-profiling` | `scrapling` |
| 关键词研究 | `content-strategy` | `duckduckgo-search` |
| 科研论文素材 | `ai-seo` | `arxiv` |
| 文章初稿 | `copywriting` | ChatGPT / Claude |
| SEO 优化 | `seo-audit` | Ahrefs / SEMrush |
| Schema 实现 | `schema-markup` | Google Rich Results Test |
| 社交内容 | `social-content` | `xurl` (X发布) |
| 视频脚本 | `video` | CapCut / Descript |
| 落地页转化 | `page-cro` | Hotjar / Mixpanel |
| 邮件序列 | `email-sequence` | Brevo / Resend |
| 数据分析 | `analytics-tracking` | GA4 / Posthog |
| 内容资产库 | `content-strategy` | `chroma` |

---

## 七、GEOFlow 技能市场补充

GEOFlow 的 42 个 skills 中，有几个 GEOFlow 完全没有覆盖但荣旺需要的领域，可以考虑未来扩展：

| 需求 | 现有 Skills | 缺口 | 建议 |
|------|-----------|------|------|
| 微信自动化发布 | 无 | 微信公众号 API 发布 | 未来自建或用微盟 |
| 拼多多数据追踪 | 无 | CPS 佣金追踪 | 联系拼多多联盟 |
| 抖音数据 API | 无 | 视频数据监控 | 抖音开放平台 |
| 知乎高赞回答 | `competitor-profiling` | 回答生成 + 发布 | 知乎 API（限部分用户）|
| 邮件序列 | `email-sequence` | 已有框架 | 配合 Brevo / Resend |

---

*本文档将 marketingskills 的 42 个技能映射到荣旺健康的实际执行场景。*
*核心参考：ai-seo、content-strategy、schema-markup、social-content、copywriting、page-cro*
