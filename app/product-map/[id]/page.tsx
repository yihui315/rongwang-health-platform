import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getApprovedStorefrontProduct } from '@/src/lib/repositories/product-repository';

export default async function ProductMapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getApprovedStorefrontProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px' }}>
      <Link href="/solutions/sleep-support" style={{ color: '#047857', fontSize: 14 }}>← 返回场景方案</Link>
      <div style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginTop: 20 }}>
        <div style={{ borderRadius: 18, background: '#f1f5f9', minHeight: 360 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#047857' }}>
            Purchase Review
          </p>
          <h1 style={{ fontSize: 38, marginBottom: 0 }}>购买前复核：{product.content.shortTitle}</h1>
          <p style={{ marginTop: 12, color: '#475569', lineHeight: 1.8 }}>{product.content.shortDescription}</p>
          <p style={{ color: '#64748b' }}>Origin: {product.originCountry || '-'}</p>
          <p style={{ marginTop: 20, lineHeight: 1.9, color: '#334155' }}>{product.content.longDescription}</p>

          <div style={{ marginTop: 20, border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <h2 style={{ marginTop: 0, fontSize: 20 }}>购买前提示</h2>
            <ul style={{ paddingLeft: 20, color: '#475569', lineHeight: 1.8 }}>
              <li>第三方平台页面为准</li>
              <li>本品不能替代药物</li>
              <li>跨境商品标准可能与中国相关标准存在差异</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
