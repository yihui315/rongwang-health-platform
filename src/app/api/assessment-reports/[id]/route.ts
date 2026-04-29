import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth/user-service";
import { getAssessmentReportForUser } from "@/lib/data/assessment-reports";

interface AssessmentReportRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: AssessmentReportRouteContext) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const { id } = await context.params;
  const report = await getAssessmentReportForUser(user, id);
  if (!report) {
    return NextResponse.json({ error: "report_not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, report });
}
