import { NextResponse } from 'next/server';

import { runCampaignAgents, type MarketingChannel } from '@/src/agents/run-campaigns';
import { requireAdminRequest } from '@/src/lib/auth/admin-guard';
import { getHealthReport } from '@/src/lib/health-report/report-store';
import {
  listMarketingPlans,
  saveMarketingPlan,
  updateMarketingPlanStatus,
} from '@/src/lib/marketing/marketing-plan-store';

const defaultChannels: MarketingChannel[] = ['wechat_private', 'sms', 'content_remarketing'];
const allowedChannels = new Set<MarketingChannel>(['wechat_private', 'sms', 'content_remarketing', 'email']);

function parseChannels(value: unknown): MarketingChannel[] {
  if (!Array.isArray(value)) return defaultChannels;
  const channels = value.filter((item): item is MarketingChannel => allowedChannels.has(String(item) as MarketingChannel));
  return channels.length ? channels.slice(0, 4) : defaultChannels;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reportId = String(body?.reportId || '');
    const report = getHealthReport(reportId);

    if (!report) {
      return NextResponse.json({ ok: false, error: 'Health report not found' }, { status: 404 });
    }

    const plan = await runCampaignAgents({
      report,
      leadId: report.leadId,
      channels: parseChannels(body?.channels),
    });

    if (!('automationLevel' in plan)) {
      throw new Error('Marketing plan generation failed');
    }

    const storedPlan = saveMarketingPlan({ reportId, plan: { ...plan, reportId } });
    return NextResponse.json({ ok: true, plan: storedPlan });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Marketing plan generation failed',
      },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    ok: true,
    plans: listMarketingPlans(),
  });
}

export async function PATCH(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const plan = updateMarketingPlanStatus({
      planId: String(body?.planId || ''),
      status: String(body?.status || 'pending_manual_review') as 'pending_manual_review' | 'approved' | 'rejected',
      reviewNotes: body?.reviewNotes ? String(body.reviewNotes) : null,
      reviewer: body?.reviewer ? String(body.reviewer) : 'admin',
    });

    if (!plan) {
      return NextResponse.json({ ok: false, error: 'Marketing plan not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, plan });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Marketing plan update failed',
      },
      { status: 400 }
    );
  }
}
