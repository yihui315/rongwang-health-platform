import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * A/B 测试中间件
 *
 * 为每个访客分配一个随机的测试组（A 或 B），通过 cookie 持久化。
 * 页面组件可以通过 cookies().get('rw_ab_group') 读取分组。
 *
 * 用法示例（在页面组件中）：
 *   import { cookies } from 'next/headers';
 *   const group = (await cookies()).get('rw_ab_group')?.value || 'A';
 *   // 根据 group 渲染不同的 Hero 文案、CTA 按钮等
 */

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // A/B 测试分组
  if (!request.cookies.has('rw_ab_group')) {
    const group = Math.random() < 0.5 ? 'A' : 'B';
    response.cookies.set('rw_ab_group', group, {
      maxAge: 60 * 60 * 24 * 30, // 30天
      path: '/',
      sameSite: 'lax',
    });
  }

  // UTM 参数追踪：保存来源信息到 cookie
  const url = request.nextUrl;
  const utmSource = url.searchParams.get('utm_source');
  const utmMedium = url.searchParams.get('utm_medium');
  const utmCampaign = url.searchParams.get('utm_campaign');
  const ref = url.searchParams.get('ref');

  if (utmSource) {
    response.cookies.set('rw_utm', JSON.stringify({
      source: utmSource,
      medium: utmMedium || '',
      campaign: utmCampaign || '',
    }), {
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
      sameSite: 'lax',
    });
  }

  // 推荐码追踪
  if (ref) {
    response.cookies.set('rw_ref', ref, {
      maxAge: 60 * 60 * 24 * 30, // 30天
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    // 匹配所有页面路由，排除静态资源和 API
    '/((?!api|_next/static|_next/image|images|favicon|robots|sitemap).*)',
  ],
};
