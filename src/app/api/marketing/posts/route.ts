import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const status = searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (platform) where.platform = platform;
  if (status) where.status = status;
  const posts = await prisma.marketingPost.findMany({ where, orderBy: { createdAt: "desc" }, include: { platformAccount: true } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const body = await req.json();
  const { platformAccountId, platform, title, content, mediaUrls, scheduledAt, sourceArticleId } = body;
  if (!platform || !title) return NextResponse.json({ error: "platform and title required" }, { status: 400 });
  const post = await prisma.marketingPost.create({
    data: {
      platformAccountId,
      platform,
      title,
      content: content || "",
      mediaUrls: mediaUrls || [],
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      sourceArticleId,
      status: scheduledAt ? "scheduled" : "draft",
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
