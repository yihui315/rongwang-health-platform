import { NextResponse } from 'next/server';
import { getCMSClient } from '@/lib/cms';

/**
 * GET /api/cms/health
 * 健康检查 — 检测 GEOFlow API 连接状态
 */
export async function GET() {
  const client = getCMSClient();
  const isHealthy = await client.healthCheck();

  return NextResponse.json({
    status: isHealthy ? 'connected' : 'disconnected',
    geoflow_url: process.env.GEOFLOW_API_URL || 'not configured',
    timestamp: new Date().toISOString(),
  }, {
    status: isHealthy ? 200 : 503,
  });
}
