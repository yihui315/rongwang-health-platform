# 一辉智能体 HTTP 网关

让 Cowork 云端沙箱能调用你本地的 AI 大脑池（MiniMax / Copilot Pro / Qwen3）。

## 快速启动

### 方式一：一键脚本（推荐）

双击 `start-tunnel.bat`，等 cloudflared 输出一个 `https://xxx.trycloudflare.com` 地址。

### 方式二：手动启动

```bash
# 终端 1：启动 HTTP 服务
cd ai-mcp-server
npm install
npm run http

# 终端 2：启动 Cloudflare Tunnel
cloudflared tunnel --url http://localhost:8787
```

### 配置 Cowork 端

把 tunnel 地址写入项目根目录 `.env.local`：

```
AI_MCP_URL=https://xxx.trycloudflare.com
AI_MCP_SECRET=your-secret-key-here
```

## API 端点

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/ask` | 通用 AI 调用 |
| POST | `/generate_page` | SEO/产品页面流水线 |
| POST | `/batch_content` | 批量内容生产 |
| GET | `/models` | 列出可用模型 |

### POST /ask 示例

```json
{
  "prompt": "写一篇关于NMN的小红书笔记",
  "taskType": "xiaohongshu"
}
```

```json
{
  "prompt": "Write an SEO article about CoQ10 benefits",
  "handler": "copilot",
  "model": "gpt-5.4",
  "maxTokens": 8192
}
```

### POST /batch_content 示例

```json
{
  "tasks": [
    { "label": "小红书1", "prompt": "NMN抗衰老", "taskType": "xiaohongshu" },
    { "label": "小红书2", "prompt": "辅酶Q10保护心脏", "taskType": "xiaohongshu" },
    { "label": "公众号", "prompt": "荣旺品牌故事", "taskType": "wechat-article" }
  ]
}
```

## 架构

```
你的 Windows 电脑
├── copilot-api (localhost:4141) → GPT-5.4 / Gemini / Codex
├── Ollama (localhost:11434) → Qwen3-Coder 30B
├── http-server.js (localhost:8787) → Express HTTP 网关
│   └── orchestrator.js → 统一调度核心
└── cloudflared tunnel → https://xxx.trycloudflare.com

Cowork 云端沙箱
├── src/lib/ai-brain.ts → askBrain() / batchContent()
└── fetch(tunnel_url + '/ask') → 你的本机 AI 大脑池
```
