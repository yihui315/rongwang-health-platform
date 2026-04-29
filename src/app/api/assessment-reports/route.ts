import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth/user-service";
import {
  listAssessmentReportsForUser,
  saveAssessmentReportForUser,
} from "@/lib/data/assessment-reports";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const reports = await listAssessmentReportsForUser(user);
  return NextResponse.json({ success: true, reports });
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const consultationId =
    body && typeof body === "object" && !Array.isArray(body)
      ? String((body as Record<string, unknown>).consultationId ?? "").trim()
      : "";

  if (!consultationId) {
    return NextResponse.json({ error: "consultation_id_required" }, { status: 400 });
  }

  const result = await saveAssessmentReportForUser(user, consultationId);
  if (!result.ok || !result.report) {
    return NextResponse.json(
      { error: result.error ?? "assessment_report_save_failed" },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { success: true, report: result.report },
    { status: result.status },
  );
}
