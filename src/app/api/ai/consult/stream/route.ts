import { NextResponse } from "next/server";
import { consultationRequestSchema } from "@/schemas/health";

const streamSteps = [
  {
    id: "profile",
    title: "资料校验",
    description: "正在确认年龄、症状、持续时间和生活方式字段是否完整。",
  },
  {
    id: "safety",
    title: "风险分层",
    description: "优先识别胸痛、呼吸困难、黑便、严重过敏等高风险信号。",
  },
  {
    id: "direction",
    title: "方向判断",
    description: "只判断健康问题类型和调理方向，不直接决定销售商品。",
  },
  {
    id: "rules",
    title: "规则推荐",
    description: "最终商品入口由站内规则引擎匹配，并受 urgent 禁购约束。",
  },
];

function encodeEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON。" }, { status: 400 });
  }

  const parsed = consultationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "输入校验失败。", details: parsed.error.flatten() }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const [index, step] of streamSteps.entries()) {
        controller.enqueue(encoder.encode(encodeEvent("step", { ...step, index })));
      }

      controller.enqueue(encoder.encode(encodeEvent("done", { ok: true })));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
