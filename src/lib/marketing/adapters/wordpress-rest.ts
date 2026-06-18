/**
 * WordPress REST API Adapter
 * 将文章草稿发布到 WordPress（通过 REST API + Application Password 认证）
 *
 * 设计：
 * - draft 模式：创建草稿，不自动发布（publish_status = 'draft'）
 * - Application Password 认证：HTTP Basic Auth
 * - 环境变量配置：WORDPRESS_BLOG_URL + WORDPRESS_APP_USER + WORDPRESS_APP_PASSWORD
 */

import { PlatformPublishResult } from '../job-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WordPressDraftInput {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  categories?: number[];
  featuredImage?: string; // Image URL to set as featured image
}

export interface WordPressContext {
  runId: string;
  utmCampaign: string;
}

export interface WordPressPublishResult {
  status: 'success' | 'draft_created' | 'auth_missing' | 'failed' | 'skipped';
  postId?: number;
  postUrl?: string;
  errorMessage?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

function getWordPressConfig() {
  const blogUrl = process.env.WORDPRESS_BLOG_URL;
  const appUser = process.env.WORDPRESS_APP_USER;
  const appPassword = process.env.WORDPRESS_APP_PASSWORD;

  if (!blogUrl || !appUser || !appPassword) {
    return null;
  }

  return { blogUrl, appUser, appPassword };
}

// ─────────────────────────────────────────────────────────────────────────────
// WordPress REST API calls
// ─────────────────────────────────────────────────────────────────────────────

async function wpApiFetch(
  endpoint: string,
  options: RequestInit & { blogUrl: string; appUser: string; appPassword: string }
): Promise<Response> {
  const { blogUrl, appUser, appPassword, ...fetchOptions } = options;
  const url = `${blogUrl.replace(/\/$/, '')}/wp-json/wp/v2/${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  // Application Password Authentication (Basic Auth)
  const credentials = Buffer.from(`${appUser}:${appPassword}`).toString('base64');
  headers['Authorization'] = `Basic ${credentials}`;

  return fetch(url, {
    ...fetchOptions,
    headers,
  } as RequestInit);
}

// ─────────────────────────────────────────────────────────────────────────────
// Draft publishing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 创建 WordPress 草稿文章
 * @returns postId on success, throws on failure
 */
export async function createWordPressDraft(
  input: WordPressDraftInput,
  context: WordPressContext,
  publishMode: 'draft' | 'publish' = 'draft'
): Promise<{ postId: number; postUrl: string }> {
  const config = getWordPressConfig();
  if (!config) {
    throw new Error('WORDPRESS_BLOG_URL/WORDPRESS_APP_USER/WORDPRESS_APP_PASSWORD not configured in environment');
  }

  const { blogUrl, appUser, appPassword } = config;

  // 获取用户ID（用于指定作者）
  const meRes = await wpApiFetch('users/me', {
    blogUrl,
    appUser,
    appPassword,
    method: 'GET',
  });

  if (!meRes.ok) {
    const body = await meRes.text();
    throw new Error(`WordPress auth failed (${meRes.status}): ${body}`);
  }

  const meData = await meRes.json();
  const authorId = input.author ? (meData.id as number) : (meData.id as number);

  // 构建文章数据
  const postData: Record<string, unknown> = {
    title: input.title,
    content: input.content,
    excerpt: input.excerpt || '',
    status: publishMode, // 'draft' or 'publish'
    author: authorId,
    comment_status: 'closed',
    ping_status: 'closed',
  };

  // 添加分类
  if (input.categories && input.categories.length > 0) {
    postData.categories = input.categories;
  }

  // 添加标签（需要先创建或获取标签ID）
  if (input.tags && input.tags.length > 0) {
    const tagIds = await Promise.all(
      input.tags.map(async (tag) => {
        // 尝试获取已有标签
        const searchRes = await wpApiFetch(`tags?search=${encodeURIComponent(tag)}`, {
          blogUrl, appUser, appPassword, method: 'GET',
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.length > 0) {
            return searchData[0].id;
          }
        }
        // 创建新标签
        const createRes = await wpApiFetch('tags', {
          blogUrl, appUser, appPassword,
          method: 'POST',
          body: JSON.stringify({ name: tag }),
        });
        if (createRes.ok) {
          const created = await createRes.json();
          return created.id;
        }
        return null;
      })
    );
    postData.tags = tagIds.filter(Boolean);
  }

  // 设置特色图片（如果提供了URL）
  if (input.featuredImage) {
    try {
      // 下载图片为Blob，然后上传到WordPress媒体库
      const imgRes = await fetch(input.featuredImage);
      if (imgRes.ok) {
        const imgBlob = await imgRes.blob();
        const imgBuffer = Buffer.from(await imgBlob.arrayBuffer());

        // 上传到媒体库
        const formData = new FormData();
        formData.append('file', new Blob([imgBuffer], { type: imgBlob.type }), 'featured-image.jpg');

        const mediaRes = await wpApiFetch('media', {
          blogUrl, appUser, appPassword,
          method: 'POST',
          headers: {}, // 不要设置Content-Type，让fetch自动设置multipart
          body: imgBlob,
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          postData.featured_media = mediaData.id;
        }
      }
    } catch (e) {
      // 图片上传失败不影响文章创建
      console.warn('Failed to set featured image:', e);
    }
  }

  // 创建文章
  const createRes = await wpApiFetch('posts', {
    blogUrl, appUser, appPassword,
    method: 'POST',
    body: JSON.stringify(postData),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Failed to create WordPress post (${createRes.status}): ${body}`);
  }

  const post = await createRes.json();
  return {
    postId: post.id as number,
    postUrl: post.link as string || `${blogUrl}/?p=${post.id}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point for pipeline-runner
// ─────────────────────────────────────────────────────────────────────────────

export async function publishWordPressDraft(
  input: { title: string; content: string; excerpt?: string },
  context: WordPressContext,
  publishMode: 'draft' | 'publish' = 'draft'
): Promise<PlatformPublishResult> {
  try {
    // 检查配置
    const config = getWordPressConfig();
    if (!config) {
      return {
        platform: 'wordpress',
        status: 'auth_missing',
        errorMessage: 'WORDPRESS_BLOG_URL/WORDPRESS_APP_USER/WORDPRESS_APP_PASSWORD not set in .env.production',
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 注入 CTA section：使用 /api/pdd/redirect 回调追踪链接
    // Plan B：记录"内容→点击"数据，转化（实际销售）数据暂无法自动获取
    // ─────────────────────────────────────────────────────────────────
    // 目标URL：拼多多店铺 + UTM参数
    const targetPddMall = `https://mobile.yangkeduo.com/mall_page.html?mall_id=516573367&utm_source=auto_marketing&utm_medium=${encodeURIComponent(context.utmCampaign || 'content_ai')}&utm_campaign=blog_cta`;
    // Base64 encode目标URL，通过 /api/pdd/redirect 记录点击后302重定向
    // 注意：API路由在rongwang.hk（主站），不是blog.rongwang.hk
    const encodedTarget = Buffer.from(targetPddMall).toString('base64');
    const planSlug = `blog-${context.runId}`;
    const trackedCtaUrl = `https://rongwang.hk/api/pdd/redirect?url=${encodedTarget}&plan=${planSlug}&ch=articles`;

    const ctaHtml = `
<hr style="margin: 2rem 0; border: none; border-top: 2px solid #e2e8f0;">
<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
  <p style="margin: 0 0 0.75rem; font-size: 1.1rem; font-weight: 600; color: #1e3a5f;">科学配比，正规跨境 · 荣旺健康</p>
  <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #475569;">专注抗衰老、免疫、护眼、睡眠等健康方案，100%正规渠道，海关监管保障。</p>
  <a href="${trackedCtaUrl}" target="_blank" rel="noopener" style="display: inline-block; background: #ef4444; color: #fff; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1rem;">进店逛逛 →</a>
</div>`;

    const contentWithCta = input.content + ctaHtml;

    // 创建草稿
    const { postId, postUrl } = await createWordPressDraft(
      { title: input.title, content: contentWithCta, excerpt: input.excerpt },
      context,
      publishMode
    );

    return {
      platform: 'wordpress',
      status: publishMode === 'publish' ? 'success' : 'draft_created',
      draftUrl: postUrl,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes('auth') || msg.includes('401') || msg.includes('Basic')) {
      return { platform: 'wordpress', status: 'auth_missing', errorMessage: msg };
    }
    if (msg.includes('rate_limit') || msg.includes('429')) {
      return { platform: 'wordpress', status: 'rate_limited', errorMessage: msg };
    }

    return { platform: 'wordpress', status: 'failed', errorMessage: msg };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: check WordPress connection
// ─────────────────────────────────────────────────────────────────────────────

export async function checkWordPressConnection(): Promise<{
  connected: boolean;
  blogUrl?: string;
  user?: string;
  error?: string;
}> {
  const config = getWordPressConfig();
  if (!config) {
    return { connected: false, error: 'Not configured' };
  }

  try {
    const res = await wpApiFetch('users/me', {
      ...config, method: 'GET',
    });

    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        blogUrl: config.blogUrl,
        user: data.name as string || config.appUser,
      };
    }

    return { connected: false, error: `HTTP ${res.status}` };
  } catch (e) {
    return { connected: false, error: String(e) };
  }
}
