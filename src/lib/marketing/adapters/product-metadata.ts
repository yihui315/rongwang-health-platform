/**
 * 产品元数据抓取 Adapter
 * 支持从 URL 抓取结构化产品信息，用于内容生成的上下文注入
 */

import { load, type CheerioAPI } from 'cheerio';

export interface ProductMetadataAdapter {
  url: string;
  timeoutMs: number;
}

export interface FetchProductMetadataResult {
  name: string;
  category?: string;
  description?: string;
  price?: string;
  images: string[];
  sourceUrl: string;
  fetchedAt: string;
}

const PRODUCT_SELECTORS = {
  name: [
    'h1[data-testid="product-title"]',
    'h1.product-title',
    'h1#productTitle',
    'h1.pdp-title',
    'meta[property="og:title"]',
  ],
  description: [
    'div[data-testid="product-description"]',
    'div#product-description',
    'div.product-detail-description',
    'meta[property="og:description"]',
    'meta[name="description"]',
  ],
  price: [
    'span[data-testid="product-price"]',
    'span.price',
    'span[itemprop="price"]',
    'div.product-price',
  ],
  images: [
    'img[data-testid="product-image"]',
    'img.product-image',
    'img[itemprop="image"]',
    'meta[property="og:image"]',
  ],
};

function extractText($: CheerioAPI, selectors: string[]): string | undefined {
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.attr('content') ?? el.text().trim();
      if (text) return text;
    }
  }
  return undefined;
}

function extractImages($: CheerioAPI, selectors: string[]): string[] {
  const images: string[] = [];
  for (const sel of selectors) {
    const els = $(sel);
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const src = $(el).attr('src') ?? $(el).attr('content');
      if (src && !images.includes(src)) images.push(src);
    }
  }
  return images;
}

/**
 * 从产品 URL 抓取元数据
 * 支持天猫、京东、拼多多等主流电商平台
 */
export async function fetchProductMetadata(
  url: string,
  timeoutMs = 30000
): Promise<FetchProductMetadataResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RongWangBot/1.0; +https://rongwang.hk/bot)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    clearTimeout(timeout);

    const $: CheerioAPI = load(html);
    const name = extractText($, PRODUCT_SELECTORS.name);
    const description = extractText($, PRODUCT_SELECTORS.description);
    const price = extractText($, PRODUCT_SELECTORS.price);
    const images = extractImages($, PRODUCT_SELECTORS.images);

    return {
      name: name ?? '未知产品',
      category: undefined,
      description,
      price,
      images,
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Product metadata fetch timeout after ${timeoutMs}ms`);
    }
    throw err;
  }
}

/**
 * 从 source.url 推断平台并构建适配器
 * 用于后续扩展特定平台的解析逻辑
 */
export function detectProductPlatform(url: string): 'tmall' | 'jd' | 'pdd' | 'generic' {
  if (url.includes('tmall.com') || url.includes('tmall.com')) return 'tmall';
  if (url.includes('jd.com')) return 'jd';
  if (url.includes('pinduoduo.com') || url.includes('pdd')) return 'pdd';
  return 'generic';
}