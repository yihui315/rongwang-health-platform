# 香港荣旺健康 · 目标差距 & v2 路线图

> 一辉智能体 · 2026-04-07 巡检报告

## 一、当前已落地（v1）

### 网站层
- **Next.js 应用骨架** — 18 个路由页面（首页 / quiz / plans×4 / products(列表+详情) / lp / cart / checkout / dashboard / family / articles / auth(login+signup) / subscription）
- **单文件 v1 落地页** — `public/index.html`（33 KB · Tailwind CDN · 零依赖 · 可立即上线）
- **8 大首页模块** — Hero / Plans / How it works / Featured Products / Testimonials / Quiz CTA / FAQ / Newsletter / Footer

### 数据层
- **24 款 SKU**（src/data/products.ts，含成分剂量、科学依据、认证、价格）
- **4 大健康方案**（fatigue / sleep / immune / stress）
- **3 个预制 SEO 落地页内容**（women-fatigue / deep-sleep / immune-boost）
- **4 套邮件序列**（welcome×5 / cart×3 / reorder×2 / winback×2）

### AI / 自动化
- **一辉智能体 HTTP 网关接入** — `src/lib/ai-brain.ts` askBrain / batchContent / generatePage
- **自动重试逻辑** — copilot 离线 → 切 minimax + M2.7
- **6 个营销 / 推荐 API 路由**（marketing email / content / landing + ai-insights / recommendations / subscriptions）

### Auth / DB
- Supabase 客户端封装（dynamic require fallback）
- 完整 schema SQL（health_profiles / quiz_results / orders / subscriptions / health_metrics / family_members）
- 登录 / 注册 API + 页面

---

## 二、目标差距（gap to AG1 / Ritual / iHerb 级）

| 维度 | 目标 | 现状 | 差距 |
|------|------|------|------|
| **视觉** | AG1 级动效 + 真实摄影图 | emoji + gradient blob | ⚠️ 缺产品摄影、背景图、品牌字体 |
| **支付** | Stripe / 微信 / 支付宝 / 八达通 | checkout 是空壳 | ❌ 未接支付网关 |
| **库存 / 订单** | 真实库存联动 + 物流追踪 | products 静态数据 | ❌ 缺库存数据库 + 订单状态机 |
| **AI 个性化** | 基于体质数据的真实 LLM 推荐 | quiz 走静态分支 | ⚠️ AI 推理仅在营销端，未接 quiz |
| **用户系统** | OAuth / 微信 / Apple 登录 | 邮箱密码 | ⚠️ 第三方登录未接 |
| **内容 SEO** | 100+ 篇科普文章 | 3 篇预制 LP | ❌ 内容产能不足 |
| **会员体系** | 积分 / 等级 / 推荐返利 | 仅会员价 | ❌ 完全缺失 |
| **客服 / 工单** | AI 客服 + 人工兜底 | 无 | ❌ 完全缺失 |
| **多语言** | 繁中 / 简中 / English | 繁中 | ⚠️ 仅一种 |
| **法律合规** | GDPR / 香港隐私条例 / 跨境清关 | 仅一句免责 | ❌ 隐私政策、退款、清关条款全缺 |
| **数据分析** | GA4 + Hotjar + 自研事件 | 无 | ❌ 完全缺失 |
| **性能** | Lighthouse > 90 | 未测 | ⚠️ 待评估 |

---

## 三、v2 路线图（建议 4 周冲刺）

### 第 1 周 · 落地页能上线接单
1. **域名 + Cloudflare Pages 部署** — `public/index.html` 直接上线
2. **接 Stripe Checkout** — 至少先把月度订阅 4 个方案能买
3. **真实订单写入 Supabase** + 邮件确认（用一辉智能体生成邮件正文）
4. **GA4 + Plausible 双埋点** — 转化漏斗追踪
5. **隐私政策 / 退款条款 / 配送条款**（用一辉智能体批量生成）

### 第 2 周 · AI 真接进 Quiz
1. **Quiz 走 askBrain** — 20 题答案 → AI 输出体质类型 + 推荐方案 + 解释
2. **dashboard 显示 AI 分析报告** — 月度自动重新评估
3. **会员积分系统** — 注册 / 复购 / 推荐 / 评价四种获取路径
4. **批量 SEO 文章生成** — batchContent 一次跑 20 篇科普

### 第 3 周 · 内容产能 + 多渠道
1. **小红书 / 抖音 / 公众号自动化矩阵** — generatePage 串入营销日历
2. **EDM 4 套序列接 Resend / Brevo**
3. **第三方登录** — 微信 / Apple / Google
4. **客服机器人** — askBrain + Knowledge Base RAG

### 第 4 周 · 优化 + 增长
1. **A/B 测试** — Hero 文案 / CTA 颜色 / Quiz 入口位置
2. **Lighthouse > 95** — 图片优化 / 字体子集 / 关键 CSS inline
3. **Affiliate / 推荐返利**
4. **运营仪表盘** — DAU / GMV / LTV / Churn 实时

---

## 四、立即可做（今晚）

```bash
# 1. 用 Cloudflare Pages 部署 v1 落地页
cd public && npx wrangler pages deploy . --project-name=rongwang-health

# 2. 配置 DNS
# rongwang.health → Cloudflare CNAME

# 3. 接 Stripe Test Mode
npm i stripe @stripe/stripe-js
```

---

## 五、一辉智能体待启动的批量任务

| 任务 | 工具 | 预计耗时 | 产出 |
|------|------|----------|------|
| 20 篇 SEO 科普文章 | batchContent | ~12 分钟 | 20×800 字 |
| 50 条小红书种草 | batchContent | ~25 分钟 | 50×200 字 |
| 4 套 EDM 序列改写 | askBrain | ~8 分钟 | 12 封 |
| 隐私政策 + 服务条款 | askBrain | ~3 分钟 | 2 篇法律文档 |
| 24 款产品详情页扩写 | generatePage | ~30 分钟 | 24 篇 |

**全部跑完约 80 分钟**，零 Claude 主线 token 消耗（全走一辉智能体）。

---

*下一步建议：先部署 v1 落地页到 Cloudflare Pages，拿到真实域名，然后并行启动「Stripe 接入」+「批量内容生成」两条线。*
