import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await params;
  const post = await prisma.marketingPost.findUnique({ where: { id }, include: { seoReports: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await params;
  const body = await req.json();
  const { status, scheduledAt, publishedAt, views, likes, comments, shares, errorMessage } = body;
  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt);
  if (publishedAt !== undefined) data.publishedAt = new Date(publishedAt);
  if (views !== undefined) data.views = views;
  if (likes !== undefined) data.likes = likes;
  if (comments !== undefined) data.comments = comments;
  if (shares !== undefined) data.shares = shares;
  if (errorMessage !== undefined) data.errorMessage = errorMessage;
  try {
    const post = await prisma.marketingPost.update({ where: { id }, data });
    return NextResponse.json({ post });
  } catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await params;
  try {
    await prisma.marketingPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
}
