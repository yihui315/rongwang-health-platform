const posts = [
  '如何理解跨境健康品与中国标准差异',
  '进口营养补充剂购买前 5 个常见问题',
  '荣旺平台如何做产品信息与合规说明',
];

export default function BlogPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <h1>内容中心</h1>
      <p style={{ color: '#475569' }}>这里将承接 SEO 与品牌内容。</p>
      <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
        {posts.map((post) => (
          <article key={post} style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>{post}</h2>
            <p style={{ marginTop: 8, color: '#64748b' }}>内容占位，后续接入 CMS 或数据库。</p>
          </article>
        ))}
      </div>
    </main>
  );
}
