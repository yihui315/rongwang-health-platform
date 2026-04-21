import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.GEOFLOW_WEBHOOK_SECRET || '';

/**
 * POST /api/cms/webhook
 * GEOFlow 发布回调 — 触发 ISR 重验证
 *
 * GEOFlow 在文章发布/更新/删除时调用此 webhook
 * 触发 Next.js 增量静态再生成 (ISR)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // 验证 webhook 签名
    if (WEBHOOK_SECRET) {
      const signature = request.headers.get('x-geoflow-signature') || '';
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== `sha256=${expectedSignature}`) {
        console.warn('[Webhook] Invalid signature');
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(body);
    const { event, article } = payload;

    console.log(`[Webhook] Received event: ${event}`, {
      article_id: article?.id,
      slug: article?.slug,
    });

    switch (event) {
      case 'article.published':
      case 'article.updated': {
        // 重验证文章详情页
        if (article?.slug) {
          revalidatePath(`/articles/${article.slug}`);
        }
        // 重验证文章列表页
        revalidatePath('/articles');
        // 重验证首页（可能展示最新文章）
        revalidatePath('/');
        break;
      }

      case 'article.unpublished':
      case 'article.deleted': {
        // 重验证文章列表页和首页
        revalidatePath('/articles');
        revalidatePath('/');
        break;
      }

      case 'bulk.published': {
        // 批量发布：重验证所有文章页
        revalidatePath('/articles');
        revalidatePath('/');
        if (Array.isArray(payload.articles)) {
          for (const a of payload.articles) {
            if (a.slug) revalidatePath(`/articles/${a.slug}`);
          }
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({
      success: true,
      message: `Processed event: ${event}`,
      revalidated: true,
    });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
