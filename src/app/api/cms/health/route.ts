import { NextResponse } from "next/server";
import { getCMSClient } from "@/lib/cms";

/**
 * GET /api/cms/health
 * Health check for the GEOFlow CMS bridge.
 */
export async function GET() {
  const configured = Boolean(process.env.GEOFLOW_API_URL && process.env.GEOFLOW_API_TOKEN);
  const isHealthy = configured ? await getCMSClient().healthCheck() : false;

  return NextResponse.json(
    {
      status: isHealthy ? "connected" : "disconnected",
      configured,
      timestamp: new Date().toISOString(),
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
