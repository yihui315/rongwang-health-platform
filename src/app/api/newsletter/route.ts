import { NextResponse } from 'next/server';

/**
 * Newsletter 订阅 API
 *
 * 支持的邮件服务提供商（通过环境变量配置）：
 * - Mailchimp: MAILCHIMP_API_KEY + MAILCHIMP_LIST_ID
 * - Brevo (Sendinblue): BREVO_API_KEY + BREVO_LIST_ID
 * - 无配置时：存储到本地 JSON（开发用）
 */

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '请输入有效的邮箱地址' }, { status: 400 });
    }

    // Mailchimp
    if (MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID) {
      const dc = MAILCHIMP_API_KEY.split('-').pop(); // 数据中心
      const res = await fetch(
        `https://${dc}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
        {
          method: 'POST',
          headers: {
            Authorization: `apikey ${MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: email,
            status: 'subscribed',
            tags: ['website', 'rongwang-health'],
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        if (data.title === 'Member Exists') {
          return NextResponse.json({ message: '您已订阅过，感谢关注！' });
        }
        return NextResponse.json({ error: '订阅失败，请稍后重试' }, { status: 500 });
      }

      return NextResponse.json({ message: '订阅成功！' });
    }

    // Brevo (Sendinblue)
    if (BREVO_API_KEY) {
      const body: Record<string, unknown> = { email, updateEnabled: true };
      if (BREVO_LIST_ID) {
        body.listIds = [parseInt(BREVO_LIST_ID)];
      }

      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === 'duplicate_parameter') {
          return NextResponse.json({ message: '您已订阅过，感谢关注！' });
        }
        return NextResponse.json({ error: '订阅失败，请稍后重试' }, { status: 500 });
      }

      return NextResponse.json({ message: '订阅成功！' });
    }

    // 开发模式：仅打印日志
    console.log(`[Newsletter] New subscription: ${email}`);
    return NextResponse.json({
      message: '订阅成功！（开发模式 - 请配置邮件服务）',
    });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
