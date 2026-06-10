#!/usr/bin/env node
/**
 * GEOFlow → rongwang.hk 内容同步脚本
 * 
 * 从 GEOFlow API 拉取已发布文章，写入静态 JSON 缓存，
 * Next.js ISR 直接读取缓存文件，不依赖容器网络。
 * 
 * 运行方式: node scripts/geoflow-sync.js
 * 建议 Cron: 每15分钟
 */

const API_URL = 'http://localhost:18080/api/v1';
const TOKEN = '6|XkfbpaGp8ZqsdQU6aRmZgd2A7MGxWgxNQvV82oHF1dd99b3b';
const OUTPUT_FILE = '/root/rongwang-health-platform/public/_geoflow_cache/articles.json';
const WEBHOOK_URL = 'https://rongwang.hk/api/cms/webhook';

async function fetchPublishedArticles() {
  const allArticles = [];
  let page = 1;
  
  while (true) {
    const url = `${API_URL}/articles?per_page=50&page=${page}&status=published`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    
    const json = await res.json();
    const items = json.data?.items || [];
    
    if (items.length === 0) break;
    allArticles.push(...items);
    
    const total = json.data?.pagination?.total || 0;
    if (allArticles.length >= total) break;
    page++;
  }
  
  return allArticles;
}

function formatArticle(article) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug || article.id.toString(),
    excerpt: article.excerpt || article.content?.substring(0, 200) || '',
    content: article.content || '',
    category: article.category_name || article.category?.name || '辅酶Q10科普',
    author: article.author_name || '运营官Darren',
    published_at: article.published_at,
    read_time: article.read_time || '5分钟',
    coverImage: article.featured_image || null,
    source: 'geoflow',
  };
}

async function main() {
  console.log('[GEOFlow Sync] 开始同步...');
  
  try {
    // 1. 拉取文章
    const articles = await fetchPublishedArticles();
    console.log(`[GEOFlow Sync] 获取到 ${articles.length} 篇已发布文章`);
    
    if (articles.length === 0) {
      console.log('[GEOFlow Sync] 无文章可同步');
      return;
    }
    
    // 2. 格式化
    const formatted = articles.map(formatArticle);
    
    // 3. 写入静态缓存
    const cache = {
      updated_at: new Date().toISOString(),
      count: formatted.length,
      articles: formatted,
    };
    
    const fs = require('fs');
    const dir = require('path').dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cache, null, 2));
    console.log(`[GEOFlow Sync] 已写入 ${OUTPUT_FILE}`);
    
    // 4. 触发 Next.js ISR revalidate
    try {
      await fetch(WEBHOOK_URL, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'articles', count: formatted.length }),
      });
      console.log('[GEOFlow Sync] ISR revalidate 触发成功');
    } catch (e) {
      console.log('[GEOFlow Sync] ISR revalidate 失败（不影响缓存）:', e.message);
    }
    
    console.log(`[GEOFlow Sync] 完成：${formatted.length} 篇文章已同步`);
    
  } catch (err) {
    console.error('[GEOFlow Sync] 错误:', err.message);
    process.exit(1);
  }
}

main();