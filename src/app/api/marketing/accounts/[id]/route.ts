import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await params;
  const account = await prisma.platformAccount.findUnique({ where: { id } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ account });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await params;
  const body = await req.json();
  const { accountName, accountId, status } = body;
  const data: Record<string, unknown> = {};
  if (accountName !== undefined) data.accountName = accountName;
  if (accountId !== undefined) data.accountId = accountId;
  if (status !== undefined) data.status = status;
  try {
    const account = await prisma.platformAccount.update({ where: { id }, data });
    return NextResponse.json({ account });
  } catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await params;
  try {
    await prisma.platformAccount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
}
