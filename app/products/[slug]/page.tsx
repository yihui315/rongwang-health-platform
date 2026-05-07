import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getApprovedStorefrontProduct } from '@/src/lib/mock-store';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getApprovedStorefrontProduct(slug);

  if (!product) {
    notFound();
  }

  const specEntries = Object.entries(product.specs);

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px' }}>
      <Link href="/products" style={{ color: '#047857', fontSize: 14 }}>← 返回产品列表</Link>
      <div style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginTop: 20 }}>
        <div style={{ borderRadius: 18, background: '#f1f5f9', minHeight: 360 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#047857' }}>
            Approved Product
          </p>
          <h1 style={{ fontSize: 38, marginBottom: 0 }}>{product.content.shortTitle}</h1>
          <p style={{ marginTop: 12, color: '#475569', lineHeight: 1.8 }}>{product.content.shortDescription}</p>
          <p style={{ color: '#64748b' }}>Origin: {product.originCountry || '-'}</p>
          <p style={{ marginTop: 20, lineHeight: 1.9, color: '#334155' }}>{product.content.longDescription}</p>

          <div style={{ marginTop: 20, border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <h2 style={{ marginTop: 0, fontSize: 20 }}>规格与信息</h2>
            <ul style={{ paddingLeft: 20, color: '#475569', lineHeight: 1.8 }}>
              <li>类别：{product.category || '健康商品'}</li>
              <li>品牌：{product.brand || '-'}</li>
              {specEntries.map(([key, value]) => <li key={key}>{key}：{value}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 28, display: 'grid', gap: 16 }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>免责声明</h2>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>{product.content.disclaimer}</p>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>FAQ 摘要</h2>
          <ul style={{ paddingLeft: 20, color: '#475569', lineHeight: 1.8 }}>
            {product.content.faqDraft.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>
    </main>
  );
}
