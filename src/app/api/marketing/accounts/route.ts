import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const accounts = await prisma.platformAccount.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const body = await req.json();
  const { platform, accountName, accountId } = body;
  if (!platform || !accountName) return NextResponse.json({ error: "platform and accountName required" }, { status: 400 });
  try {
    const account = await prisma.platformAccount.create({ data: { platform, accountName, accountId } });
    return NextResponse.json({ account }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
