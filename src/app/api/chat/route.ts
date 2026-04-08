import { NextResponse } from "next/server";
import { getAIResponse, getLocalResponse } from "@/lib/ai-chat";

/**
 * AI 健康客服 API 路由
 *
 * POST /api/chat
 * Body: { message: string, history: { role: string, content: string }[] }
 * Response: { reply: string }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: { role: string; content: string }[];
    };

    const message = body.message;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "消息内容不能为空" },
        { status: 400 }
      );
    }

    // 限制消息长度防止滥用
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "消息长度超出限制" },
        { status: 400 }
      );
    }

    // 转换历史记录格式
    const history = (body.history ?? []).map((m, i) => ({
      id: `hist_${i}`,
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: Date.now(),
    }));

    let reply: string;
    try {
      reply = await getAIResponse(message, history);
    } catch {
      // AI 服务不可用时降级
      reply = getLocalResponse(message);
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}
