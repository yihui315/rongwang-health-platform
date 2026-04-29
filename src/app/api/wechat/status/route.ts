import { NextResponse } from "next/server";
import { getWechatReadinessStatus } from "@/lib/wechat/config";

export async function GET() {
  return NextResponse.json({
    success: true,
    mode: "read_only",
    wechat: getWechatReadinessStatus(),
    capabilities: {
      officialAccountPreview: true,
      officialAccountDraftUpload: "requires_explicit_enable",
      miniProgramProductCatalog: true,
      miniProgramOrderContract: true,
      wechatPayLivePrepay: false,
      autoPublish: false,
    },
    guardrails: [
      "Official Account publishing is never automated by this endpoint.",
      "Mini Program payment remains disabled until WeChat Pay credentials and verification are live.",
      "Health content remains educational and assessment-first.",
    ],
  });
}
