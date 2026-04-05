# 一辉智能体 v4

> Claude CEO + GPT-5.4 + Codex + Gemini + MiniMax + Qwen3 — 全自动零剪贴板

## 架构

```
Claude (CEO 大脑)
  ├── 🤖 GPT-5.4        ← Copilot Pro → 最强英文内容、SEO、产品描述
  ├── 🤖 GPT-5.3 Codex  ← Copilot Pro → 复杂代码生成、架构设计
  ├── 🤖 Gemini 2.5 Pro ← Copilot Pro → 竞品分析、长文研报、市场趋势
  ├── 🤖 GPT-4o         ← Copilot Pro → 快速通用任务、邮件、翻译
  ├── 🤖 MiniMax 2.7    ← API直连     → 小红书、微信、中文本地化
  └── 🤖 Qwen3 30B      ← Ollama本地  → 离线代码、HTML组件、免费无限
```

## 快速开始

### 1. 安装依赖

```bash
cd ai-mcp-server
npm install
```

### 2. 启动 Copilot API 代理

```bash
# 全局安装
npm install -g copilot-api

# 启动（首次会打开浏览器GitHub授权）
copilot-api start
```

启动后默认运行在 `http://localhost:4141`，提供 OpenAI 兼容接口。

### 3. 启动 Ollama + Qwen3

```bash
ollama serve
# 如果还没下载模型：
ollama pull qwen3-coder:30b
```

### 4. 配置环境变量

```bash
copy .env.example .env
```

编辑 `.env`，填入 MiniMax API Key 和 Group ID。

### 5. 测试连接

```bash
npm test
```

看到3个 ✅ 就可以启动了。

### 6. 集成到 Claude Desktop

编辑 `%APPDATA%\Claude\claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "rongwang-ai": {
      "command": "node",
      "args": ["C:\\Users\\Administrator\\Documents\\Claude\\Projects\\香港荣旺\\ai-mcp-server\\server.js"],
      "env": {
        "MINIMAX_API_KEY": "你的MiniMax Key",
        "MINIMAX_GROUP_ID": "你的Group ID",
        "COPILOT_API_URL": "http://localhost:4141",
        "COPILOT_MODEL": "gpt-4o",
        "OLLAMA_BASE_URL": "http://localhost:11434",
        "OLLAMA_MODEL": "qwen3-coder:30b"
      }
    }
  }
}
```

重启 Claude Desktop 即可使用。

## 启动前检查清单

```
☐ copilot-api start     → http://localhost:4141 运行中
☐ ollama serve           → http://localhost:11434 运行中
☐ .env 已填入 MiniMax Key
☐ Grok Pro 已登录        → grok.x.ai
```

## 可用工具

### 全自动 (3个)
| 工具 | 模型 | 用途 |
|------|------|------|
| `ask_copilot` | Copilot Pro (GPT-4o) | 英文内容、SEO、产品描述 |
| `ask_minimax` | MiniMax 2.7 | 小红书、微信、中文本地化 |
| `ask_qwen` | Qwen3-Coder 30B | 代码、HTML组件、数据处理 |

### 剪贴板协作 (1个)
| 工具 | 模型 | 用途 |
|------|------|------|
| `ask_grok` | Grok Pro | 竞品情报、市场趋势（生成Prompt粘贴到网页） |

### 业务流水线
| 工具 | 流程 | 输出 |
|------|------|------|
| `write_seo` | Copilot写英文 → MiniMax翻译 → Qwen生成HTML | 3个文件 |
| `write_product` | Copilot写描述 → MiniMax中文化 | 双语产品页 |
| `competitor_scan` | 生成Grok Prompt + Copilot报告框架 | 半自动竞品报告 |

### 任务模板
| 模板 | 模型 | 说明 |
|------|------|------|
| `seo-article` | Copilot | SEO科普文章 |
| `xiaohongshu-post` | MiniMax | 小红书种草笔记 |
| `wechat-article` | MiniMax | 微信公众号推文 |
| `competitor-analysis` | Grok (剪贴板) | 竞品深度分析 |
| `html-component` | Qwen | 网站组件代码 |

## 命令行使用

```bash
# SEO文章
node run-task.js seo-article topic="Vitamin D Benefits" keywords="vitamin d" wordCount=1500

# 小红书
node run-task.js xiaohongshu-post productName="B族维生素" benefit="抗疲劳" audience="996打工人"

# HTML组件
node run-task.js html-component componentName="产品卡片" requirements="3列响应式网格"
```
