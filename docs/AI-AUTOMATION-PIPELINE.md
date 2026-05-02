# 荣旺健康 · AI 自动化管道

> 版本：v1.0 | 日期：2026-04-24
> 目标：内容生产 → AI处理 → 多平台分发 → 效果追踪，全流程自动化

---

## 一、管道架构总览

### 1.1 自动化层级

```
┌─────────────────────────────────────────────────────────┐
│  Level 0: 纯手动（现在）                                  │
│  人工写 → 人工发布 → 人工追踪                              │
├─────────────────────────────────────────────────────────┤
│  Level 1: 半自动（1-2个月）← 目标                         │
│  AI初稿 → 人工审核 → 人工发布                             │
├─────────────────────────────────────────────────────────┤
│  Level 2: 高自动化（3-4个月）                             │
│  AI生产 → AI分发 → 数据自动收集 → 人工复盘                │
├─────────────────────────────────────────────────────────┤
│  Level 3: 接近全自动（6个月+）                             │
│  Agent驱动的完整内容引擎                                   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 完整数据流

```
[选题池]
    ↓
[Content Brief 生成]（AI辅助）
    ↓
[素材收集]（scrapling + arxiv + duckduckgo）
    ↓
[AI初稿生成]（ChatGPT/Claude）
    ↓
[人工审核]（专家/编辑）
    ↓
[SEO优化 + Schema标记]（AI辅助）
    ↓
┌───────────┬───────────┬───────────┬───────────┐
│ 官网发布   │ 知乎回答   │ 微信公众号 │ 抖音脚本  │
└─────┬─────┴─────┬─────┴─────┬─────┴─────┬─────┘
      ↓           ↓           ↓           ↓
[定时发布]   [定时发布]   [API发布]   [人工发布]
      ↓           ↓           ↓           ↓
[数据收集] ←──────────────→ [数据收集]
      ↓
[效果分析 + 下月规划]
```

---

## 二、AI 工具层

### 2.1 工具能力矩阵

| 工具 | 能力 | 输入 | 输出 | 自动化难度 |
|------|------|------|------|-----------|
| `scrapling` | 竞品内容抓取 | URL/关键词 | 页面内容 | ⭐ 简单 |
| `duckduckgo-search` | 搜索趋势 | 关键词 | 搜索结果 | ⭐ 简单 |
| `arxiv` | 科研论文 | 成分/主题 | 论文摘要 | ⭐ 简单 |
| `xurl` | X/Twitter 发布 | 文本内容 | 已发布推文 | ⭐ 简单 |
| `youtube-content` | 视频转文章 | YouTube URL | 文字记录 | ⭐⭐ 中等 |
| `chroma` | 向量知识库 | 内容片段 | 检索结果 | ⭐⭐ 中等 |
| `xurl` (X内容获取) | 内容提取 | URL | 页面内容 | ⭐ 简单 |
| ChatGPT/Claude | 内容生成 | Brief + 素材 | 初稿 | ⭐ 简单 |
| 微信公众号 API | 公众号发布 | 图文内容 | 已发布图文 | ⭐⭐ 中等 |

### 2.2 Skill 与工具对应

| marketing-skill 环节 | 主要 Skill | 配合工具 |
|---------------------|-----------|---------|
| 竞品分析 | `competitor-profiling` | `scrapling` |
| 选题研究 | `content-strategy` | `duckduckgo-search` |
| 科研背书 | `ai-seo` | `arxiv` |
| 内容生成 | `copywriting` | ChatGPT/Claude |
| SEO 优化 | `seo-audit` | AI辅助检查 |
| Schema 标记 | `schema-markup` | AI辅助生成 |
| 多格式拆解 | `social-content` | ChatGPT/Claude |
| 英文分发 | `social-content` | `xurl` |
| 效果分析 | `analytics-tracking` | GA4/Posthog |

---

## 三、内容生产自动化

### 3.1 选题管道

```
[手动触发]
    ↓
调用 duckduckgo-search（关键词：本周主题）
    ↓
调用 scrapling（竞品前3篇文章）
    ↓
Claude 分析：关键词机会 + 竞品差距
    ↓
输出：3个备选选题 + 优先级评分
    ↓
[人工选择]
    ↓
进入 Brief 生成
```

**自动化代码示例（伪代码）：**

```python
# 伪代码：选题管道
async def generate_topic_briefs(primary_theme: str) -> list[dict]:
    # 1. 搜索趋势
    trends = duckduckgo_search(f"{primary_theme} 趋势 2026")
    
    # 2. 竞品内容
    competitors = ["site:a.com", "site:b.com"]
    comp_content = [scrapling(url) for url in competitors]
    
    # 3. AI 分析生成 Brief
    brief = await claude.generate(f"""
    基于以下搜索趋势和竞品内容，生成3个选题Brief：
    趋势：{trends}
    竞品：{comp_content}
    主题：{primary_theme}
    """)
    
    return brief
```

### 3.2 素材收集管道

```
[选题确定]
    ↓
arxiv 搜索（成分名称）
    ↓
scrapling 竞品文章（URLs from Brief）
    ↓
duckduckgo 搜索（用户真实问答）
    ↓
chroma 检索（产品知识库已有内容）
    ↓
整合输出：素材包
```

**素材包结构：**

```json
{
  "topic": "NADH解酒",
  "arxiv_papers": [
    {"title": "...", "abstract": "...", "url": "..."}
  ],
  "competitor_points": [
    {"source": "竞品A", "key_claims": [...], "gaps": [...]}
  ],
  "user_questions": [
    "NADH真的能解酒吗？",
    "副作用有哪些？"
  ],
  "product_claims": [
    "NADH是内源性辅酶",
    "直接参与酒精代谢"
  ]
}
```

### 3.3 AI 初稿生成管道

```
[素材包 + Brief]
    ↓
ChatGPT/Claude 生成（参考 copywriting skill）
    ↓
自动检查项：
├── 字数是否达标（≥1500）
├── 首段是否包含关键词
├── H2 结构是否匹配搜索意图
├── 是否有数据引用
└── 是否有专家语录
    ↓
[不合格] → 返回生成步骤
    ↓
[合格]
    ↓
人工审核
```

**AI 生成 Prompt 模板：**

```markdown
## 角色
你是荣旺健康的内容专家，专门撰写保健品评测和健康科普文章。

## 任务
撰写一篇关于 [主题] 的 SEO 长文。

## 要求
- 字数：2500-3500字
- 关键词：[主关键词] + [副关键词 × 2]
- 搜索意图：[认知/考虑/决策]
- 内容类型：[权威指南/对比评测/成分科普/选购指南]
- 风格：专业但易懂，像跟朋友解释一样

## 结构要求
1. H1：包含主关键词，60字以内
2. 首段（100字内）：直接回答"什么是X"，包含主关键词
3. H2 × 4-6：每个H2回答一个搜索意图
4. FAQ 区块：3-5个自然语言问题
5. 结论：总结 + CTA

## E-E-A-T 要求
- 每500字包含一个具体数据点
- 引用 arxiv 论文（格式：[研究名称], [年份]）
- 包含专家观点（可引用"根据[领域]专家..."）

## 合规红线
- ❌ 不能说"治疗疾病"
- ❌ 不能说"最有效/第一"
- ✅ 用"有助于/可能/研究表明"
- ✅ 产品功效要有文献支撑

## 参考素材
[素材包内容]

## 输出格式
直接输出文章正文，不需要额外说明。
```

---

## 四、多平台分发自动化

### 4.1 分发矩阵

| 平台 | 自动化方式 | API/工具 | 发布频率 |
|------|-----------|---------|---------|
| **官网** | 手动 + CI/CD | GitHub push → 自动部署 | 每周 1-2 篇 |
| **知乎** | 半自动 | 手动发布（无API）+ AI 辅助写 | 每周 1 篇 |
| **微信公众号** | 半自动 | 微信公众平台 API 或手动 | 每周 1 篇 |
| **抖音** | 半自动 | 人工发布 + AI 生成脚本 | 每周 2 条 |
| **小红书** | 半自动 | 手动发布 + AI 生成文案 | 每周 2-3 篇 |
| **X/Twitter** | 自动 | `xurl` CLI | 每周 1 条 |

### 4.2 X/Twitter 自动发布管道

```yaml
# .github/workflows/weekly-x-thread.yml

name: Weekly X Content

on:
  schedule:
    - cron: '0 9 * * 5'  # 每周五 9:00 UTC
  workflow_dispatch:  # 也可手动触发

jobs:
  generate-and-post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        
      - name: Generate thread content
        run: |
          # 调用 Claude 生成英文 thread
          claude --print --prompt "根据本周发布的文章 {article} 生成 X/Twitter thread：
          格式：1条 Hook + 10条要点 + 1条 CTA
          语言：英文
          主题：{topic}"
        
      - name: Post to X via xurl
        run: |
          xurl post thread --file output/thread.md --dry-run  # 先预览
          # 确认后改为：
          xurl post thread --file output/thread.md
        
      - name: Log results
        run: echo "$(date): Posted thread" >> posted-log.txt
```

### 4.3 多格式内容生成管道

```
[已发布的官网文章]
    ↓
ChatGPT 多格式拆解 Prompt
    ↓
┌──────────────────────────────────────────┐
│ 格式 1: 知乎回答（扩展版）                  │
│ → 针对1-2个具体问题，1000字深度回答         │
├──────────────────────────────────────────┤
│ 格式 2: 微信公众号图文（精简版）            │
│ → 删减到1500字，配图建议，图文排版           │
├──────────────────────────────────────────┤
│ 格式 3: 抖音脚本 × 2                       │
│ → Hook版（30s）+ 测评版（45s）             │
│ → 包含字幕文案 + BGM 建议                   │
├──────────────────────────────────────────┤
│ 格式 4: 小红书笔记 × 2                     │
│ → 科普版 + 种草版                          │
│ → 配图 + hashtag 建议                      │
├──────────────────────────────────────────┤
│ 格式 5: X/Twitter 线程                     │
│ → Hook + 10条要点 + CTA                   │
│ → 英文                                      │
└──────────────────────────────────────────┘
    ↓
人工审核各格式内容
    ↓
分发到各平台
```

**多格式 Prompt 模板：**

```markdown
## 任务
将以下文章拆解为多平台内容格式。

## 原文
{article_content}

## 拆解要求

### 1. 知乎回答
- 针对问题：{question}
- 格式：先说结论，然后原因，然后证据，最后产品推荐
- 字数：800-1000字
- 语气：专业、有数据支撑、不推销感

### 2. 微信公众号
- 标题：{wechat_title}
- 字数：1200-1500字（删减原文）
- 结构：开头悬念 → 核心内容 → 结尾CTA
- 配图建议：3-5张（封面 + 内容插图）
- 底部：原文链接

### 3. 抖音脚本 × 2

#### 版本A：Hook版（30秒）
- 前3秒必须有一个视觉 + 口头 + 文字三重Hook
- 中间：痛点（5s）+ 解决方案（15s）+ CTA（5s）
- 字幕：关键文字 + 强调词
- BGM：{bgm_suggestion}

#### 版本B：测评版（45秒）
- 开头：真实使用场景（5s）
- 中间：对比/数据展示（25s）
- 结尾：效果展示 + CTA（10s）

### 4. 小红书笔记 × 2

#### 版本A：科普笔记
- 标题：{xhs_title}
- 正文：600-800字
- 结构：痛点引入 → 知识科普 → 实操建议 → 产品推荐
- hashtag：5个精准标签
- 配图：封面 + 3张内容图

#### 版本B：种草笔记
- 标题：{xhs_review_title}
- 正文：400-600字
- 结构：真实体验 → 使用感受 → 效果对比 → CTA
- 语气：第一人称真实体验
- hashtag：3个精准 + 2个泛流量

### 5. X/Twitter 线程
- Hook：英文，吸引点击
- 正文：10个要点，each 280字内
- 结尾：Link to article + 互动问题
- 语言：英文
```

---

## 五、AI 质量控制层

### 5.1 自动检查清单（发布前）

```python
# ai_qc_checker.py（伪代码）

async def qc_check(article_content: str, article_metadata: dict) -> dict:
    checks = {
        "seo": {},
        "eeat": {},
        "compliance": {},
        "readability": {}
    }
    
    # SEO 检查
    checks["seo"]["keyword_in_title"] = article_metadata["keyword"] in article_content[:60]
    checks["seo"]["keyword_in_first_para"] = article_metadata["keyword"] in article_content[:200]
    checks["seo"]["word_count"] = len(article_content) >= 1500
    checks["seo"]["h2_count"] = article_content.count("## ") >= 4
    checks["seo"]["internal_links"] = article_content.count("href") >= 2
    
    # E-E-A-T 检查
    checks["eeat"]["has_citation"] = bool(re.search(r"\[.*?\]\(.*?\)", article_content))  # 有[]()引用格式
    checks["eeat"]["has_date"] = "2026" in article_content or "2025" in article_content
    checks["eeat"]["has_author"] = bool(re.search(r"作者|By|荣旺", article_content))
    
    # 合规检查
    forbidden = ["治疗", "治愈", "最有效", "第一", "根治", "保证"]
    checks["compliance"]["no_forbidden"] = not any(word in article_content for word in forbidden)
    
    # 可读性
    checks["readability"]["avg_sentence_len"] = avg_sentence_length(article_content) < 30
    
    return {
        "passed": all(all(v.values()) for v in checks.values()),
        "checks": checks,
        "failed_items": [f"{k}.{sk}" for k,v in checks.items() for sk,vv in v.items() if not vv]
    }
```

### 5.2 自动 Schema 标记

```python
# auto_schema.py（伪代码）

def generate_article_schema(article: dict) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article["title"],
        "description": article["meta_description"],
        "author": {
            "@type": "Person",
            "name": "荣旺健康顾问",
            "jobTitle": "健康管理专家"
        },
        "datePublished": article["publish_date"],
        "dateModified": article["last_updated"],
        "publisher": {
            "@type": "Organization",
            "name": "荣旺健康",
            "url": "https://rongwang.hk",
            "logo": {
                "@type": "ImageObject",
                "url": "https://rongwang.hk/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": article["url"]
        },
        "keywords": article["keywords"],
        "articleSection": article["category"],
        "wordCount": article["word_count"]
    }

def generate_faq_schema(faqs: list[dict]) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq["question"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq["answer"],
                    "author": {
                        "@type": "Organization",
                        "name": "荣旺健康"
                    }
                }
            }
            for faq in faqs
        ]
    }
```

---

## 六、数据收集与效果追踪

### 6.1 追踪指标矩阵

| 平台 | 核心指标 | 采集方式 | 自动化 |
|------|---------|---------|--------|
| 官网 | PV/UV、跳出率、停留时间、转化率 | GA4 | ✅ 自动 |
| 知乎 | 点赞、收藏、关注 | 知乎后台 | 手动 |
| 微信公众号 | 阅读量、在看、分享 | 微信后台 | 手动 |
| 抖音 | 完播率、点赞、涨粉、私信数 | 抖音后台 | 手动 |
| 小红书 | 收藏、评论、转化链接点击 | 小红书后台 | 手动 |
| X/Twitter | 曝光、互动、Profile点击 | X后台 | 手动 |
| 留资 | 提交数、转化漏斗 | Supabase | ✅ 自动 |

### 6.2 周数据收集自动化

```yaml
# .github/workflows/weekly-report.yml

name: Weekly Content Report

on:
  schedule:
    - cron: '0 10 * * 1'  # 每周一 10:00 UTC
  workflow_dispatch:

jobs:
  collect-and-report:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch GA4 data
        run: |
          # 调用 GA4 API 获取上周数据
          curl -s "https://analyticsdata.googleapis.com/v1beta/..." > ga4.json
        
      - name: Fetch Supabase leads
        run: |
          # 查询上周留资数据
          psql $DATABASE_URL -c "SELECT COUNT(*) FROM health_leads WHERE created_at > NOW() - INTERVAL '7 days'" > leads.json
        
      - name: Generate report
        run: |
          # Claude 分析数据 + 生成报告
          claude --print --prompt "分析以下数据，生成周报：{ga4_json} + {leads_json}"
        
      - name: Post to Slack/微信
        run: |
          # 发送报告到运营群
          curl -X POST $SLACK_WEBHOOK -d '{"text": "周报已生成: {report_url}"}'
```

### 6.3 月度复盘管道

```
每月最后一天
    ↓
自动收集所有平台数据（GA4 + 手动汇总）
    ↓
Claude 分析：
├── 哪些文章流量最高？为什么？
├── 哪些平台表现最好？
├── 竞品本月在做什么？
├── GEO引用情况有无变化？
└── 下月内容方向调整建议
    ↓
输出：月度内容复盘报告
    ↓
人工审核 + 下月计划确认
```

---

## 七、私域自动化（微信生态）

### 7.1 留资 → 私域管道

```
[用户提交 AI 测评]
    ↓
/api/lead 保存到 Supabase
    ↓
触发微信通知（管理员）
    ↓
运营手动添加用户微信
    ↓
发送欢迎消息（模板消息）
    ↓
用户进入私域社群 or 1v1
    ↓
自动化培育序列
```

### 7.2 欢迎序列（7天）

| 天 | 触达方式 | 内容 |
|----|---------|------|
| Day 0 | 微信添加 | "感谢你的信任，我是荣旺健康顾问XX" |
| Day 1 | 公众号图文 | 推送本周最佳内容（与其问题相关） |
| Day 2 | 1v1 | "看了你的测评结果，XX问题值得关注..." |
| Day 3 | 社群 | 邀请加入"荣旺健康交流群" |
| Day 5 | 1v1 | 分享相关用户案例 |
| Day 7 | 1v1 | "有什么问题随时问我，顺便推荐适合你的方案" |

### 7.3 自动化培育内容（未来扩展）

```
用户标签：疲劳类
    ↓
每月推送：
├── Week 1：1篇长文（本周主题）
├── Week 2：1个产品推荐（附带用户评价）
├── Week 3：1个健康小知识（与其问题相关）
└── Week 4：1个限时优惠（促进转化）

用户标签：睡眠类
    ↓
每月推送：
├── 同上结构，内容换成睡眠相关
```

---

## 八、AI Agent 编排层（Level 3 目标）

### 8.1 自主内容 Agent 架构

```
┌─────────────────────────────────────────────────────┐
│                 Content Agent (主Agent)              │
│  角色：内容负责人，自主规划、执行、优化               │
├─────────────────────────────────────────────────────┤
│  记忆层：chroma 向量库（已有内容资产）               │
│  ↓                                                  │
│  反思层：每月复盘 + 策略调整                         │
│  ↓                                                  │
│  规划层：选题优先级 + 排期                            │
│  ↓                                                  │
│  执行层：调用各工具完成任务                           │
└─────────────────────────────────────────────────────┘
         ↓          ↓          ↓          ↓
    [素材收集]  [内容生成]  [SEO优化]  [分发发布]
    scrapling   ChatGPT    AI SEO     xurl/手动
    arxiv       Claude     schema
```

### 8.2 Agent Prompt 模板

```markdown
## Content Agent System Prompt

你是荣旺健康的内容负责人。

### 背景
荣旺健康是一个跨境保健品电商平台，主营：NADH解酒、AKK菌减肥、GABA睡眠、NMN抗衰老等保健品。
目标用户：中国消费者（主要）+ 海外华人（英文）。

### 你的职责
1. **内容规划**：每月末制定下月内容日历
2. **内容生产**：协调 AI 工具完成文章生成
3. **分发管理**：确保内容按时发布到各平台
4. **效果追踪**：每周收集数据，每月复盘优化
5. **竞品监控**：持续跟踪竞品内容动态

### 你的工作流
1. 每周一：检查竞品上周新发布的内容（scrapling）
2. 每周一：从选题池选择本周主题
3. 周一-周二：生成初稿
4. 周三：人工审核
5. 周四：多格式拆解
6. 周五：分发发布
7. 每周五：记录本周数据
8. 每月末：月度复盘 + 下月计划

### 你的工具
- scrapling：竞品内容抓取
- duckduckgo-search：搜索趋势
- arxiv：科研论文
- ChatGPT/Claude：内容生成
- xurl：X/Twitter 发布
- chroma：内容知识库

### 你的目标
- 每月产出：4篇长文 + 20+社交内容
- 3个月内：核心关键词进入前3
- 6个月内：被AI搜索引用

### 约束
- 合规优先：不能声称治病，只能说"有助于"
- 质量优先：宁可少发，不可发烂
- 数据驱动：每次决策基于数据，不是直觉
```

---

## 九、技术实现路线图

### 9.1 Phase 1（Month 1-2）：半自动化

```
内容生产
├── 建立 ChatGPT/Claude Prompt 模板库
├── 手工选题 + AI 初稿
├── 人工审核 + 发布
└── 手工记录数据

平台分发
├── 官网：GitHub push → 自动部署
├── X：xurl CLI 半自动
├── 其他：纯手工
```

### 9.2 Phase 2（Month 3-4）：提升效率

```
内容生产
├── AI 自动生成多格式内容
├── AI 自动 SEO 检查
├── AI 自动 Schema 标记
└── 人工重点审核

平台分发
├── 建立各平台发布 SOP
├── 批量内容制作（每周2-3篇）
└── 效果数据自动汇总
```

### 9.3 Phase 3（Month 5-6）：高度自动化

```
内容生产
├── AI 竞品监控 + 选题
├── AI 全流程内容生成
└── AI + 人工双审核

平台分发
├── X/Twitter：全自动
├── 知乎/微信：半自动
├── 抖音/小红书：AI脚本 + 人工录制
└── 效果数据自动分析 + 报告
```

### 9.4 Phase 4（Month 7+）：Agent 驱动

```
目标：Content Agent 自主运营
├── 自主选题（基于数据反馈）
├── 自主生成（质量稳定）
├── 自主分发（支持平台）
├── 自主优化（基于效果）
└── 人工战略决策层
```

---

## 十、Immediate 行动清单

### 本周可实施的自动化（Day 1-7）

- [ ] **建立 Prompt 模板库**（`/docs/prompts/`）
  - SEO 文章生成 Prompt
  - 多格式拆解 Prompt
  - QA 检查 Prompt

- [ ] **配置 xurl CLI**（X/Twitter 发布）
  - 连接荣旺 X 账号
  - 测试发布 thread

- [ ] **配置 scrapling**（竞品抓取）
  - 竞品 URLs 列表
  - 抓取模板

- [ ] **建立内容素材库**（chroma）
  - 产品知识库
  - 科研论文摘要库

### Month 1 完成的自动化

- [ ] **GitHub Actions CI/CD**（官网自动部署）
- [ ] **Schema 自动生成脚本**
- [ ] **周数据收集模板**（GA4 + Supabase）
- [ ] **内容 Brief 模板库**

### Month 2 完成的自动化

- [ ] **多格式内容生成 Pipeline**
- [ ] **AI SEO 检查脚本**
- [ ] **X/Twitter 自动发布管道**
- [ ] **月度复盘自动化模板**

---

## 十一、所需工具 & API 清单

### 必需 API

| API | 用途 | 成本 | 优先级 |
|-----|------|------|--------|
| OpenAI API / Claude API | 内容生成 | 按量 | 🔴 必须 |
| Chroma | 向量数据库 | 开源/免费 | 🔴 必须 |
| GA4 | 流量分析 | 免费 | 🔴 必须 |
| Supabase | 留资数据 | 免费tier | 🔴 必须 |
| xurl | X发布 | 免费tier | 🟡 推荐 |
| 微信公众号 API | 公众号发布 | 免费 | 🟡 推荐 |
| Ahrefs/SEMrush | SEO分析 | $99/月 | 🟢 有则更好 |

### 可选工具

| 工具 | 用途 | 成本 | 必要性 |
|------|------|------|--------|
| Buffer | 社交排期 | $6/月 | 🟢 可选 |
| Notion | 内容管理 | 免费 | 🟢 可选 |
| Make.com | 自动化编排 | 免费tier | 🟢 可选 |

---

*本文档为荣旺健康 AI 自动化管道 v1.0*
*核心参考：marketingskills/social-content, ai-seo, content-strategy, copywriting, analytics-tracking*
