import { NextResponse } from "next/server";
import { getWorkspaceSessionFromRequest } from "@/src/lib/auth/session";
import {
  listAgentTasks,
  listComplianceReviews,
  listGeneratedContents,
  listProducts,
} from "@/src/lib/repositories/product-repository";

export async function GET(request: Request) {
  const session = await getWorkspaceSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  const [products, contents, complianceReviews, agentTasks] = await Promise.all([
    listProducts(),
    listGeneratedContents(),
    listComplianceReviews(),
    listAgentTasks(),
  ]);

  return NextResponse.json({
    ok: true,
    summary: {
      products: products.length,
      contents: contents.length,
      complianceReviews: complianceReviews.length,
      agentTasks: agentTasks.length,
      runningTasks: agentTasks.filter((task) => task.status === "running").length,
      failedTasks: agentTasks.filter((task) => task.status === "failed").length,
      flaggedReviews: complianceReviews.filter((review) => review.reviewStatus === "compliance_flagged").length,
      pendingReviews: complianceReviews.filter((review) => review.reviewStatus === "pending_manual_review").length,
    },
    agentTasks,
    complianceReviews,
  });
}
