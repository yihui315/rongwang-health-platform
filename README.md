# 荣旺跨境健康平台（Rongwang Cross-border Health Platform）

荣旺跨境健康平台是一个面向中国大陆市场的跨境健康品独立站与 AI Agent 运营中台。

## 当前线上状态

- 生产站点：https://rongwang.hk
- 当前线上提交：`1b3d8ee` (`chore: upgrade Next.js runtime`)
- 当前线上分支：`codex/deployed-rongwang-hk-20260515`
- 运行方式：Ubuntu 云服务器 + Nginx + systemd + Next.js
- 注意：GitHub 默认 `origin/main` 目前不是线上生产分支，分支关系说明见 [docs/github-repository-status.md](docs/github-repository-status.md)。

## 项目目标

第一阶段目标：

1. 建立一个可上线的品牌官网与商品展示站点
2. 支持商品导入、内容生成、基础合规展示
3. 为后续自动上架、推广、KPI 分析打下中台基础
4. 用最小可行版本（MVP）验证市场、合规、内容、流量与转化链路

## 第一阶段范围

### 前台站点
- 首页
- 产品列表页
- 产品详情页
- FAQ 页面
- 合规说明页面
- 联系我们页面
- 物流与配送说明页面

### 中台能力
- 商品链接导入（京东 / 拼多多等）
- 商品数据标准化
- AI 内容生成
- AI 合规审查预检
- 上架任务准备
- 事件日志与任务状态跟踪

## 技术方向

- 前端：Next.js + TypeScript
- 数据库：PostgreSQL
- ORM：可后续接 Prisma
- 中台：Node.js / TypeScript Agent 服务
- 消息机制：第一阶段先用数据库任务表模拟队列；后续升级 RabbitMQ / Kafka
- LLM 接入：OpenAI / Claude / Qwen 等可插拔
- 部署：Vercel（前台） + 云主机/容器（中台） + PostgreSQL

## 目录结构

```text
app/                      前台页面
docs/                     产品、架构、合规、路线图文档
src/agents/               Agent 任务实现
src/api/                  服务接口与业务入口
database/                 数据库脚本
```


## 本地演示工作台

当前项目已经内置一个本地演示工作台：

- `/workspace/import`：输入商品链接，模拟商品导入
- `/workspace/generate`：对已导入商品生成内容草稿

这两个页面用于帮助非技术背景用户先理解“商品导入 → 内容生成”的中台工作流。

## 本地启动

```bash
cp .env.example .env.local
npm install
npm run dev
```

## 当前阶段原则

- 先把骨架搭对，再逐步增加自动化
- 先确保合规与数据结构，再追求智能化
- 所有 AI 输出必须可追踪、可审查、可回退
- 所有高风险动作必须保留人工审批入口

## 版本路线

### Phase 1：官网 + 商品中台 MVP
- 完成基础页面
- 完成商品导入
- 完成内容生成
- 完成数据库模型
- 完成合规说明

### Phase 2：自动上架与推广联动
- 接入渠道 API
- 推广 Agent 初版
- A/B 测试
- KPI 看板

### Phase 3：智能优化
- RAG 合规知识库
- CRM 自动化
- 推荐系统
- 广告优化 Agent
