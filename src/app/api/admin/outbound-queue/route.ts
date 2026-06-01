import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { listOutboundQueue } from "@/lib/marketing/outbound-queue";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const queue = await listOutboundQueue();
  return NextResponse.json({ success: true, queue });
}
