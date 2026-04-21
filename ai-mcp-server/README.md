# 一辉智能体 v5.0 — 全力构建模式

AI驱动的多模型调度系统，为荣旺健康跨境电商提供全自动内容生产和商城构建能力。

## 架构

```
🧠 Claude Pro (本体) ← CEO大脑: 分析/决策/规划/编排
    │
    ├── 🇨🇳 MiniMax M2.7 ── 中文内容 (小红书/微信/抖音/电商文案)
    │   └── api.minimaxi.com/anthropic (Anthropic兼容API)
    │
    ├── 💪 Copilot Pro ──── 英文内容/代码 (GPT-5.4/Codex/Gemini/GPT-4o)
    │   └── localhost:4141 (copilot-api)
    │
    ├── 🏠 Qwen3-Coder ──── 离线代码 (HTML/CSS/JS, 免费无限)
    │   └── localhost:11434 (Ollama)
    │
    └── 🔄 PackyAPI ──── 备用大脑 (Claude Opus API)
        └── packyapi.com
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env  # 编辑填入API Keys

# 3. 测试连接
npm test

# 4. 启动MCP Server
npm start
```

## 工具列表 (20个)

| 类别 | 工具 | 用途 |
|------|------|------|
| 直接调用 | ask_minimax | 中文内容 |
| | ask_copilot | 英文内容/代码 |
| | ask_qwen | 离线代码 |
| | ask_brain | 备用大脑 |
| 智能路由 | smart_route | 自动选模型+自动降级 |
| | multi_ai | 并行多模型 |
| 内容流水线 | write_seo | SEO文章(英+中) |
| | write_product | 产品描述(双语) |
| | write_xiaohongshu | 小红书种草文 |
| | write_wechat | 微信公众号 |
| | competitor_scan | 竞品分析 |
| 页面生成 | generate_page | Next.js页面 |
| | generate_component | React组件 |
| | generate_api | API端点 |
| 批量生产 | batch_content | 批量内容 |
| 系统管理 | health_check | 健康检查 |
| | list_models | 模型列表 |
| | run_task / list_tasks | 任务模板 |
| | system_status | 系统状态 |

## 在Claude Desktop中使用

将 `claude-desktop-config.json` 的内容合并到:
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

## 本地引擎启动

```bash
# Copilot Pro
copilot-api start

# Ollama Qwen3
ollama serve && ollama pull qwen3-coder:30b
```
