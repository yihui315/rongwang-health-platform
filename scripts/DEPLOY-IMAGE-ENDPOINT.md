# 一辉智能体网关 · /image 端点上线指引

> 把 MiniMax `image-01` 接进网关，全 Cowork 端共用一份 API key。
> 预计耗时 5 分钟。

## 一、前置检查

```bash
# 1. 服务器已有 MiniMax key
echo $MINIMAX_API_KEY   # 应该非空

# 2. 当前网关版本
curl -s http://43.160.251.191:8787/health | jq
# → version: "4.1.0"
```

## 二、合并 patch 进 server.js

打开你网关项目里 `server.js` 或 `index.js`，找到 `app.post('/ask', ...)` 这一段，**在它下面**追加 `scripts/gateway-image-patch.js` 的整段代码（去掉文件顶部的注释块）。

需要的环境变量：
- `MINIMAX_API_KEY` — MiniMax API key（你已有）
- `GATEWAY_SECRET` — 复用你现在 `/ask` 用的 `rw-health-2024`

如果你 `/ask` 不是用 `process.env.GATEWAY_SECRET` 而是硬编码或别的变量名，把 patch 里第 16 行的 `process.env.GATEWAY_SECRET` 改成同名即可。

同时把 `/health` 响应里的 `available` 数组追加 `"POST /image"`，并把版本号顺手提到 `4.2.0`。

## 三、重启网关

```bash
# pm2
pm2 restart yihui-gateway

# 或 systemd
sudo systemctl restart yihui-gateway

# 或前台跑
node server.js
```

## 四、上线后立刻验证

在 Cowork 这边跑：

```bash
node scripts/test-image-endpoint.mjs
```

应该看到一张 `public/img/test.png` 落地（约 5-15s 出图）。

## 五、生产用法

部署成功后，整个 Next.js 项目里任何地方都能：

```ts
import { generateImage } from '@/lib/ai-brain';

const r = await generateImage('a serene morning ritual with supplements...', {
  aspectRatio: '16:9',
});

if (r.success) {
  // r.images[0].base64 — 写文件 / 转 dataURL / 上 CDN
}
```

或批量：

```ts
import { batchGenerateImages } from '@/lib/ai-brain';

const tasks = [
  { id: 'hero',  prompt: '...', aspectRatio: '16:9' },
  { id: 'card1', prompt: '...', aspectRatio: '4:3'  },
];
const results = await batchGenerateImages(tasks);
```

## 六、常见问题

| 现象 | 原因 | 解决 |
|------|------|------|
| `unauthorized` | Bearer 不一致 | 检查 GATEWAY_SECRET 与客户端 `.env.local` 的 AI_MCP_SECRET |
| `prompt is required` | body 没正确 JSON | 检查 Content-Type |
| `MiniMax Error: ...` | API key 无效或额度不够 | 去 https://platform.minimaxi.com 续费 |
| 超时 120s | 上游慢 | 放大 timeoutMs 到 180_000 |
