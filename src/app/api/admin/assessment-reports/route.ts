import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { listAssessmentReportsForAdmin } from "@/lib/data/assessment-reports";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const reports = await listAssessmentReportsForAdmin();
  return NextResponse.json({ success: true, reports });
}
