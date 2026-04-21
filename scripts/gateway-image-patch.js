/**
 * 一辉智能体网关 · /image 端点补丁
 *
 * 把这段代码加到你的网关服务器（通常是 server.js / index.js）
 * 重启后 Cowork 端可以通过 ai-brain.ts 的 generateImage() 调用。
 *
 * 假设你的 Express 实例名为 app，环境变量里有 MINIMAX_API_KEY。
 */

// ============ 加到 app 的路由区 ============
app.post('/image', async (req, res) => {
  // 鉴权（复用现有的 Bearer 校验逻辑）
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${process.env.GATEWAY_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const {
    prompt,
    aspect_ratio = '1:1',
    n = 1,
    model = 'image-01',
    prompt_optimizer = true,
    response_format = 'base64',
  } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const t0 = Date.now();
  try {
    const upstream = await fetch('https://api.minimax.io/v1/image_generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        aspect_ratio,
        n,
        prompt_optimizer,
        response_format,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    const json = await upstream.json();
    const elapsed = Date.now() - t0;

    if (!upstream.ok || json?.base_resp?.status_code !== 0) {
      return res.json({
        success: false,
        worker: 'minimax',
        model,
        elapsed,
        error: json?.base_resp?.status_msg || `HTTP ${upstream.status}`,
      });
    }

    const images = json?.data?.image_base64 || [];
    return res.json({
      success: true,
      worker: 'minimax',
      model,
      elapsed,
      count: images.length,
      // 返回 base64 数组；调用端决定存盘还是直接嵌入
      images: images.map((b64) => ({ base64: b64, format: 'png' })),
    });
  } catch (err) {
    return res.json({
      success: false,
      worker: 'minimax',
      elapsed: Date.now() - t0,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// ============ 同时更新 /health 的 available 列表 ============
// 把 "POST /image" 加到 available 数组里：
// available: ["GET /health", "GET /models", "POST /ask",
//             "POST /generate_page", "POST /batch_content",
//             "POST /run_task", "POST /image"]
