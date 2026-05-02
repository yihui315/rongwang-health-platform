# 荣旺健康 · GEOFlow CMS 部署计划

> 版本：v1.0 | 日期：2026-04-24
> 目标：在 38.76.178.75 服务器上部署 GEOFlow 内容管理系统

---

## 一、GEOFlow 现状评估

### 1.1 什么是 GEOFlow

GEOFlow 是一个**内容基础设施平台**，核心能力：

| 能力 | 说明 | 对荣旺的价值 |
|------|------|------------|
| **内容爬取** | 批量抓取竞品/权威网站内容 | 竞品分析自动化 |
| **内容处理** | AI 清洗、分类、摘要 | 内容生产效率提升 |
| **向量存储** | Chroma/PGVector 向量库 | RAG 内容检索 |
| **SEO 分析** | 关键词密度、结构、引用分析 | 内容优化自动化 |
| **多语言** | 中英文内容处理 | 中英文内容支持 |
| **API 发布** | 连接到各类 CMS/平台 | 内容分发自动化 |

### 1.2 当前状态

```
状态：未部署
服务器：38.76.178.75（当前只有 rongwang-app 容器）
端口：18080（之前会话中提到，但当前未运行）
数据库：未连接
```

### 1.3 部署决策点

**关键问题：现在要不要部署 GEOFlow？**

| 选项 | 优势 | 劣势 | 建议 |
|------|------|------|------|
| **立即自部署** | 完全可控，数据在自己服务器 | 运维成本，需要时间 | 🔴 3个月内做 |
| **使用官方托管** | 零运维，开箱即用 | 数据在第三方，有成本 | 🟡 如果 GEOFlow 有官方托管 |
| **暂不部署** | 专注核心链路（留资→转化） | 内容生产效率低 | 🟢 可以等1-2个月 |

**建议：暂缓自部署，专注核心链路。等内容产量稳定后（每月20+篇）再部署 GEOFlow。**

---

## 二、替代方案（立即可用）

### 2.1 内容管理现状 vs 目标

| 功能 | 当前（静态代码） | 目标（GEOFlow） | 替代方案 |
|------|----------------|----------------|---------|
| 文章存储 | `articles.ts` 静态文件 | 数据库 + API | 保持现状 |
| 内容编辑 | 代码修改 + PR | CMS 后台 | 外部文档协作 |
| 竞品监控 | 手动搜索 | 自动爬取 | `scrapling` 按需调用 |
| 内容检索 | 无 | 向量语义搜索 | 暂时不需要 |
| SEO 分析 | 无 | 自动检查 | AI 辅助（ChatGPT） |
| 分发管理 | 手动 | API 自动化 | 手工 + `xurl` |

**结论：当前内容量和复杂度不需要 GEOFlow，用现有工具链可以支撑 3-6 个月。**

### 2.2 轻量级替代架构（当前使用）

```
内容生产：
ChatGPT/Claude（生成）
    ↓
本地文件（articles.ts 格式）
    ↓
GitHub → 自动部署

竞品监控：
需要时调用 scrapling
    ↓
Claude 分析
    ↓
人工决策

内容检索：
chroma（可选）
    ↓
存储文章向量
    ↓
RAG 检索（可选）
```

---

## 三、GEOFlow 部署架构（未来）

### 3.1 推荐架构

```
                    ┌─────────────────────────────────────┐
                    │            GEOFlow CMS               │
                    │  ┌─────────┐  ┌─────────────────┐  │
                    │  │  前端   │  │   Content API   │  │
                    │  │ (Next.js)│  │   (FastAPI)     │  │
                    │  └─────────┘  └─────────────────┘  │
                    │         ↓              ↓           │
                    │  ┌─────────────────────────────────┤
                    │  │      PostgreSQL + PGVector      │←─┤ 内容 DB
                    │  │      Chroma (向量存储)          │  │
                    │  └─────────────────────────────────┤
                    │              ↓                      │
                    │  ┌─────────────────────────────────┤
                    │  │   爬虫管道（Scrapy + AI处理）  │  │
                    │  └─────────────────────────────────┤
                    └─────────────────────────────────────┘
                                  ↓
                    ┌─────────────────────────────────────┐
                    │       荣旺健康网站 (Next.js)         │
                    │  /api/geoflow/articles              │←── 内容消费
                    │  /api/geoflow/competitors           │
                    │  /api/geoflow/seo-analysis          │
                    └─────────────────────────────────────┘
```

### 3.2 部署清单

#### 服务器准备

```bash
# SSH 到服务器
ssh root@38.76.178.75

# 检查系统资源
free -h        # 内存 ≥ 8GB 推荐
df -h          # 磁盘 ≥ 50GB
nproc          # CPU ≥ 4核

# 安装 Docker（如果没有）
curl -fsSL https://get.docker.com | sh

# 创建 GEOFlow 专用网络
docker network create geoflow-net
```

#### 数据库设置

```bash
# 启动 PostgreSQL + PGVector
docker run -d \
  --name geoflow-postgres \
  --network geoflow-net \
  -e POSTGRES_PASSWORD=geoflow_secret_pass \
  -e POSTGRES_DB=geoflow \
  -v /data/geoflow/postgres:/var/lib/postgresql/data \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# 验证
docker exec geoflow-postgres psql -U postgres -c "SELECT 1"
```

#### Chroma 向量库

```bash
# 启动 Chroma
docker run -d \
  --name geoflow-chroma \
  --network geoflow-net \
  -e IS_PERSISTENT=TRUE \
  -e ANONYMIZED_TELEMETRY=FALSE \
  -v /data/geoflow/chroma:/chroma/chroma \
  -p 8000:8000 \
  ghcr.io/chroma-core/chroma:0.5.4

# 验证
curl -s http://localhost:8000/api/v1/heartbeat
```

#### GEOFlow 应用

```bash
# 创建 GEOFlow 数据目录
mkdir -p /data/geoflow/app

# 克隆 GEOFlow（如果开源可用）
# git clone https://github.com/[geoflow-repo].git /data/geoflow/app

# 启动 GEOFlow
docker run -d \
  --name geoflow-app \
  --network geoflow-net \
  -e DATABASE_URL=postgresql://postgres:geoflow_secret_pass@geoflow-postgres:5432/geoflow \
  -e CHROMA_URL=http://geoflow-chroma:8000 \
  -e API_SECRET=your_api_secret_here \
  -v /data/geoflow/app:/app/data \
  -p 18080:8080 \
  geoflow/geoflow:latest

# 验证
curl -s http://localhost:18080/api/v1/health
```

### 3.3 Nginx 反向代理

```bash
# 在服务器上添加 Nginx 配置
cat > /etc/nginx/sites-available/geoflow << 'EOF'
server {
    listen 80;
    server_name geoflow.rongwang.hk;

    location / {
        proxy_pass http://127.0.0.1:18080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/geoflow /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL（如果需要）
# certbot --nginx -d geoflow.rongwang.hk
```

### 3.4 DNS 配置

```
# 添加 DNS 记录
geoflow.rongwang.hk → 38.76.178.75
```

---

## 四、GEOFlow 与荣旺网站的集成

### 4.1 API 对接架构

```
荣旺网站 (Next.js)
    │
    ├── GET /api/geoflow/articles
    │       → 返回已发布文章列表
    │
    ├── GET /api/geoflow/articles/[slug]
    │       → 返回单篇文章详情
    │
    ├── POST /api/geoflow/competitors/scrape
    │       → 触发竞品内容爬取
    │
    └── GET /api/geoflow/seo-analysis?url=[url]
            → 返回 SEO 分析结果
```

### 4.2 内容回退机制

当 GEOFlow 不可用时，网站应使用本地静态数据：

```typescript
// src/lib/content-fetcher.ts

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  // ...
}

async function getArticles(): Promise<Article[]> {
  // 优先从 GEOFlow API 获取
  try {
    const res = await fetch(process.env.GEOFLOW_API_URL + '/articles', {
      headers: { 'Authorization': `Bearer ${process.env.GEOFLOW_API_KEY}` },
      next: { revalidate: 3600 } // 1小时缓存
    });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.warn('GEOFlow unavailable, falling back to local content');
  }

  // 回退到本地静态数据
  return localArticles;
}
```

### 4.3 环境变量

```bash
# .env.local（在荣旺网站服务器）

# GEOFlow API
GEOFLOW_API_URL=https://geoflow.rongwang.hk/api/v1
GEOFLOW_API_KEY=your_geoflow_api_key
GEOFLOW_FALLBACK=true  # 启用回退机制
```

---

## 五、GEOFlow 内容管理工作流

### 5.1 编辑发布流程

```
┌──────────────────────────────────────────────────────┐
│                   GEOFlow CMS 后台                     │
│                                                       │
│  1. 创建/编辑文章                                      │
│     → 富文本编辑器（支持 Markdown）                      │
│     → SEO 字段自动填充                                  │
│     → Schema 自动生成                                   │
│                                                       │
│  2. 竞品监控                                           │
│     → 定时爬取竞品内容                                   │
│     → AI 自动分析差异                                   │
│                                                       │
│  3. SEO 检查                                           │
│     → 关键词密度                                        │
│     → 可读性评分                                        │
│     → E-E-A-T 信号                                      │
│     → Schema 验证                                       │
│                                                       │
│  4. 一键发布到                                        │
│     → 荣旺网站（API 推送）                              │
│     → 微信公众号                                       │
│     → X/Twitter                                        │
└──────────────────────────────────────────────────────┘
```

### 5.2 SEO 检查清单（内置）

| 检查项 | 标准 | 自动评分 |
|--------|------|---------|
| Title 长度 | 50-60字符 | ✅ |
| Meta description | 150-160字符 | ✅ |
| 关键词密度 | 1-2% | ✅ |
| H1 包含关键词 | 必须 | ✅ |
| 首段包含关键词 | 必须 | ✅ |
| 图片 alt | 必须 | ✅ |
| 内链数量 | ≥ 2 | ✅ |
| 外链到权威来源 | 必须 | ✅ |
| 字数 | ≥ 1500 | ✅ |
| FAQ 区块 | 推荐 | ✅ |
| Schema markup | 推荐 | ✅ |

---

## 六、部署时间线

### 立即（Day 1-7）：什么都不用做

当前内容量和复杂度不需要 GEOFlow。用现有工具链：

```
- ChatGPT/Claude → 内容生成
- scrapling → 按需竞品监控
- GitHub push → 官网发布
- 手工 → 社交平台发布
```

**预计可以支撑：3-6 个月，20-50 篇内容**

### Month 3-4：重新评估

**触发条件（满足任一）：**
- [ ] 月产内容 ≥ 20 篇
- [ ] 运营人员 ≥ 2 人
- [ ] 需要多人协作编辑
- [ ] 竞品监控需求频繁

**如果满足触发条件 → 启动 GEOFlow 部署**

### Month 3-4：轻量级试点

```
Phase 1: 只部署核心功能
├── PostgreSQL + PGVector（内容存储）
├── 竞品爬取管道（Scrapy）
├── 内容 API（FastAPI）
└── 手动触发爬取，不做定时

跳过：
- GEOFlow 前端 CMS（用 Notion 代替）
- Chroma 向量库（暂时不需要 RAG）
- 自动发布管道（手工发布）
```

### Month 5-6：完整部署

```
Phase 2: 完整 GEOFlow
├── GEOFlow CMS 前端
├── Chroma 向量库（RAG 检索）
├── 定时竞品监控
├── 自动 SEO 检查
└── API 发布到荣旺网站
```

---

## 七、成本估算

### 自部署（38.76.178.75）

当前服务器已有 Docker，无额外服务器成本：

| 组件 | 资源 | 成本 |
|------|------|------|
| PostgreSQL | 2GB RAM, 20GB SSD | $0（现有服务器） |
| Chroma | 1GB RAM, 10GB SSD | $0 |
| GEOFlow App | 1GB RAM, 1 CPU | $0 |
| **总计** | | **$0/月** |

### 官方托管（如果有）

| 方案 | 价格 | 说明 |
|------|------|------|
| Free | $0 | 有限功能 |
| Pro | $29/月 | 完整功能 |
| Team | $99/月 | 团队协作 |

---

## 八、替代工具对比

| 场景 | GEOFlow | 替代方案 | 成本 |
|------|---------|---------|------|
| 内容存储 | PostgreSQL | `articles.ts` 静态文件 | $0 |
| 竞品爬取 | GEOFlow 爬虫 | `scrapling` 按需 | $0 |
| 内容协作 | GEOFlow CMS | Notion + GitHub | $0-10/月 |
| SEO 分析 | GEOFlow 分析 | ChatGPT 辅助 | $0（API费用） |
| 向量检索 | Chroma | 暂不需要 | $0 |
| 发布管道 | GEOFlow API | 手工 + xurl | $0 |

**结论：现有替代工具链已经覆盖 GEOFlow 80% 的功能，等内容产量上来再迁移不迟。**

---

## 九、GEOFlow 部署检查清单（未来执行）

当内容产量达到阈值后，按以下清单部署：

### 预部署检查

```
□ 确认服务器磁盘空间 ≥ 50GB
□ 确认内存 ≥ 8GB
□ Docker 已安装
□ Nginx 已配置（或 Caddy）
□ 域名 DNS 已指向服务器
□ SSL 证书已配置（Let's Encrypt）
□ 防火墙开放必要端口
□ 数据库备份策略已制定
```

### 部署步骤

```
Step 1: 数据库
□ 启动 PostgreSQL + PGVector
□ 创建 geoflow 数据库
□ 配置连接池
□ 测试连接

Step 2: 向量库
□ 启动 Chroma
□ 测试向量存储和检索
□ 配置持久化

Step 3: GEOFlow 应用
□ 克隆 GEOFlow 代码
□ 配置环境变量
□ 运行数据库迁移
□ 启动服务
□ 验证健康检查

Step 4: Nginx
□ 配置反向代理
□ 配置 SSL
□ 测试访问

Step 5: 集成
□ 配置荣旺网站环境变量
□ 实现回退机制
□ 测试 API 调用

Step 6: 监控
□ 配置日志
□ 配置告警
□ 备份策略
```

### 上线后验证

```
□ GEOFlow 后台可访问
□ 可以创建/编辑/发布文章
□ 竞品爬取正常工作
□ SEO 分析正常工作
□ API 正常返回数据
□ 回退机制正常（关闭 GEOFlow，网站仍正常）
□ 监控面板正常
```

---

## 十、决策建议

### 最终建议

| 优先级 | 行动 | 时间 | 原因 |
|--------|------|------|------|
| 🔴 最高 | 立即使用 ChatGPT/Claude 做内容生产 | 今天 | 已有，用起来 |
| 🔴 最高 | 立即配置 scrapling 做竞品监控 | 本周 | 已有工具 |
| 🟡 中等 | 3个月后评估是否需要 GEOFlow | Month 3 | 等内容产量上来 |
| 🟢 低 | 考虑 Notion 作为临时内容协作 | Month 2 | 替代 GEOFlow CMS |

**GEOFlow 是正确的长期方向，但不是现在的优先级。先把内容产量做起来，再上 GEOFlow。**

---

*本文档为 GEOFlow CMS 部署计划 v1.0*
*建议：暂缓部署，先用轻量工具链支撑内容生产*
