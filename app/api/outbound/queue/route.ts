import { NextResponse } from 'next/server';

import { requireAdminRequest } from '@/src/lib/auth/admin-guard';
import { listOutboundQueueAsync } from '@/src/lib/automation/outbound-queue-store';

export async function GET(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    ok: true,
    queue: await listOutboundQueueAsync(),
  });
}
