import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  CONSULT_PROFESSIONAL_WARNING,
  CROSS_BORDER_NOTICE,
  NOT_MEDICAL_ADVICE,
  THIRD_PARTY_PURCHASE_DISCLAIMER,
} from '@/src/lib/compliance/copy';
import MeasuredText from '@/src/components/text/MeasuredText';
import { getApprovedStorefrontProduct } from '@/src/lib/mock-store';
import { getStorefrontBottleImage } from '@/src/lib/storefront-assets';

const productDetailTextFonts = {
  summary: '600 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getApprovedStorefrontProduct(slug);

  if (!product) {
    notFound();
  }

  const specEntries = Object.entries(product.specs);
  const keyFacts = [
    { label: '原产地', value: product.originCountry || '-' },
    { label: '品牌', value: product.brand || '-' },
    { label: '类别', value: product.category || '健康商品' },
    { label: '规格', value: product.specs.规格 || '-' },
  ];
  const complianceNotes = [NOT_MEDICAL_ADVICE, CONSULT_PROFESSIONAL_WARNING, THIRD_PARTY_PURCHASE_DISCLAIMER, CROSS_BORDER_NOTICE];

  return (
    <main className="storefront-page">
      <div className="storefront-shell storefront-detail">
        <Link href="/products" className="storefront-back-link">
          ← 返回产品列表
        </Link>

        <section className="storefront-detail-hero">
          <div className="storefront-detail-media">
            <span className="storefront-product-badge">已审核展示</span>
            <span className="storefront-detail-art">
              <Image
                src={getStorefrontBottleImage({
                  id: product.id,
                  title: product.content.shortTitle,
                  category: product.category,
                })}
                alt={product.content.shortTitle}
                fill
                priority
                sizes="(max-width: 960px) 88vw, 480px"
              />
            </span>
          </div>

          <div className="storefront-detail-copy">
            <p className="storefront-detail-kicker">Approved Product</p>
            <h1>{product.content.shortTitle}</h1>
            <MeasuredText
              className="storefront-detail-summary"
              font={productDetailTextFonts.summary}
              lineHeight={24}
              maxLines={3}
            >
              {product.content.shortDescription}
            </MeasuredText>
            <div className="storefront-detail-chip-row">
              <span>{product.category || '健康商品'}</span>
              <span>{product.originCountry || '-'}</span>
              <span>{product.brand || '-'}</span>
            </div>
            <p className="storefront-detail-long">{product.content.longDescription}</p>
            <div className="storefront-commerce-notice storefront-commerce-notice-compact" aria-label="购买方式说明">
              <strong>购买方式待顾问确认</strong>
              <p>
                当前不提供站内支付。微信商城/小程序待开通，请先联系顾问人工确认购买方式、库存、物流和售后边界。
              </p>
            </div>
            <div className="storefront-detail-actions">
              <Link className="storefront-detail-button storefront-detail-button-primary" href="/contact">
                联系咨询
              </Link>
              <Link className="storefront-detail-button storefront-detail-button-secondary" href="/faq">
                查看 FAQ
              </Link>
            </div>
          </div>
        </section>

        <section className="storefront-detail-section-grid">
          <article className="storefront-detail-panel storefront-detail-spec-card">
            <h2>基础信息</h2>
            <dl className="storefront-detail-spec-grid">
              {keyFacts.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="storefront-detail-note-box">
              <p className="storefront-detail-note-label">中文说明</p>
              <p>本页预留中文说明与标签展示位，具体以审核通过内容为准。</p>
            </div>
          </article>

          <article className="storefront-detail-panel">
            <h2>合规提示</h2>
            <p className="storefront-detail-disclaimer">{product.content.disclaimer}</p>
            <ul className="storefront-detail-note-list">
              {complianceNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="storefront-detail-section-grid storefront-detail-section-grid-tight">
          <article className="storefront-detail-panel">
            <h2>规格与标签</h2>
            <ul className="storefront-detail-bullet-list">
              {specEntries.map(([key, value]) => (
                <li key={key}>
                  <strong>{key}</strong>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
            <div className="storefront-detail-chip-cloud">
              {product.content.seoKeywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
          </article>

          <article className="storefront-detail-panel">
            <h2>FAQ 摘要</h2>
            <ul className="storefront-detail-faq-list">
              {product.content.faqDraft.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
