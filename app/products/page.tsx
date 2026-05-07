import Link from 'next/link';
import { listApprovedStorefrontProducts } from '@/src/lib/mock-store';

export default function ProductsPage() {
  const products = listApprovedStorefrontProducts();

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px' }}>
      <h1>产品列表</h1>
      <p style={{ maxWidth: 760, color: '#475569', lineHeight: 1.8 }}>
        这里仅展示已经通过人工审核的跨境健康品内容。导入与 AI 生成草稿必须先经过合规预检与审核，才会进入前台。
      </p>
      <div style={{ marginTop: 28, display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {products.map((product) => (
          <article key={product.id} style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ height: 160, borderRadius: 12, background: '#f1f5f9', marginBottom: 16 }} />
            <p style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#047857' }}>{product.category || '健康商品'}</p>
            <h2 style={{ marginTop: 8, marginBottom: 0, fontSize: 22 }}>{product.content.shortTitle}</h2>
            <p style={{ marginTop: 8, color: '#64748b' }}>{product.content.shortDescription}</p>
            <p style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>Origin: {product.originCountry || '-'}</p>
            <div style={{ marginTop: 20 }}>
              <Link href={`/products/${product.id}`} style={{ display: 'inline-flex', borderRadius: 12, background: '#0f172a', color: '#fff', padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>
                查看详情
              </Link>
            </div>
          </article>
        ))}
      </div>
      {products.length === 0 ? (
        <p style={{ marginTop: 24, color: '#64748b' }}>暂无审核通过的商品。</p>
      ) : null}
    </main>
  );
}
