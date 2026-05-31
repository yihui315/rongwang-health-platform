import { NextResponse } from "next/server";
import {
  listAgentTasks,
  listComplianceReviews,
  listGeneratedContents,
  listMockProducts,
} from "@/src/lib/mock-store";

export async function GET() {
  const products = listMockProducts();
  const contents = listGeneratedContents();
  const complianceReviews = listComplianceReviews();
  const agentTasks = listAgentTasks();

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
