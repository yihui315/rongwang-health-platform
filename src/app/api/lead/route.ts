import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getRetentionExpiresAt } from '@/lib/data/retention';
import { getPrisma } from '@/lib/prisma';
import { getSupabaseServer } from '@/lib/supabase';

interface LeadPayload {
  name: string;
  phone: string;
  wechatId?: string;
  source?: string;
  intent?: string;
  consent?: {
    privacyAccepted?: boolean;
    termsAccepted?: boolean;
    sensitiveHealthDataAccepted?: boolean;
    marketingContactAccepted?: boolean;
    version?: string;
  };
  answers?: Array<{ questionId: number; answer: string }>;
  recommendations?: string[];
  aiSummary?: string;
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadPayload = await request.json();

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: '姓名和手机号必填' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const prisma = getPrisma();

    if (prisma) {
      await prisma.lead.create({
        data: {
          contact: body.phone,
          source: body.source ?? 'ai-consult',
          intent: body.intent ?? 'health_advisor_followup',
          status: 'new',
          privacyAccepted: body.consent?.privacyAccepted === true,
          termsAccepted: body.consent?.termsAccepted === true,
          sensitiveHealthDataAccepted: body.consent?.sensitiveHealthDataAccepted === true,
          marketingContactAccepted: body.consent?.marketingContactAccepted === true,
          consentVersion: body.consent?.version ?? 'lead-capture-v1',
          consentedAt: new Date(),
          retentionExpiresAt: getRetentionExpiresAt(),
          payload: toJson({
            name: body.name,
            wechatId: body.wechatId ?? null,
            answers: body.answers ?? [],
            recommendations: body.recommendations ?? [],
            aiSummary: body.aiSummary ?? null,
            compliance: {
              manualReviewRequired: true,
              noAutomatedSend: true,
            },
          }),
        },
      });
    }

    if (!supabase.isStub) {
      // Store in quiz_results with user contact info
      const { error } = await supabase.from('quiz_results').insert({
        answers: body.answers || [],
        recommendations: body.recommendations || [],
        ai_summary: body.aiSummary || null,
      });

      if (error) {
        console.error('Lead insert error:', error);
        // Don't fail the request — lead data is also in the request body
      }
    }

    // Log lead for now (replace with email/SMS notification in production)
    console.log('[Lead Captured]', {
      name: body.name,
      phone: body.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // mask phone
      wechatId: body.wechatId || '未提供',
      recommendations: body.recommendations,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: '信息已保存，健康顾问将尽快联系你',
    });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
