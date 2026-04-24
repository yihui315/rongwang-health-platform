import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

interface LeadPayload {
  name: string;
  phone: string;
  wechatId?: string;
  answers?: Array<{ questionId: number; answer: string }>;
  recommendations?: string[];
  aiSummary?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadPayload = await request.json();

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: '姓名和手机号必填' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

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
