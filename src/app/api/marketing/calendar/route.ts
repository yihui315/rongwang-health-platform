import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const platform = searchParams.get("platform");

  const where: Record<string, any> = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as any).gte = new Date(from);
    if (to) (where.date as any).lte = new Date(to);
  }
  if (platform) where.platform = platform;

  const events = await prisma.contentCalendarEvent.findMany({
    where,
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const body = await req.json();
  const { date, platform, contentType, title, brief } = body;

  if (!date || !platform || !contentType || !title) {
    return NextResponse.json({ error: "date, platform, contentType, title required" }, { status: 400 });
  }

  const event = await prisma.contentCalendarEvent.create({
    data: {
      date: new Date(date),
      platform,
      contentType,
      title,
      brief,
    },
  });
  return NextResponse.json({ event }, { status: 201 });
}