import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PddCtaButton from '@/src/components/marketing/PddCtaButton';
import FunnelPageTracker from '@/src/components/marketing/FunnelPageTracker';
import HomeIcon from '@/src/components/home/HomeIcon';
import MeasuredText from '@/src/components/text/MeasuredText';
import {
  CONSULT_PROFESSIONAL_WARNING,
  CROSS_BORDER_NOTICE,
  THIRD_PARTY_PURCHASE_DISCLAIMER,
} from '@/src/lib/compliance/copy';
import { getHealthScenario } from '@/src/data/health-scenarios';
import { pddProducts } from '@/src/data/pdd-products';
import { homeTrustBandPoints, productPreviewItems } from '@/src/lib/home/home-content';
import { getProductById, getScenarioSlugForProduct } from '@/src/lib/recommendation/scenario-products';

type ProductMapPageProps = {
  params: Promise<{ id: string }>;
};

const productMapTextFonts = {
  reviewSummary: '400 16px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

export function generateStaticParams() {
  return pddProducts.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductMapPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return {};
  }

  return {
    title: `购买前复核：${product.name}`,
    description: `${product.name}的适宜人群、注意事项与第三方平台购买说明。`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ProductMapPage({ params }: ProductMapPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const scenarioSlug = getScenarioSlugForProduct(product);
  const scenario = getHealthScenario(scenarioSlug);
  const productVisual = productPreviewItems.find((item) => item.productHref === `/product-map/${product.id}`);
  const productImage = productVisual?.bottleImage ?? productVisual?.image ?? product.image;

  return (
    <main className="solution-page product-map-page">
      <FunnelPageTracker eventName="product_recommendation_view" payload={{ product_id: product.id, scenario_slug: scenarioSlug }} />
      <div className="solution-brand-rail">
        <div className="solution-container solution-brand-rail-inner">
          <span className="solution-brand-kicker">RONGWANG HEALTH</span>
          <p>购买前复核 · 适用确认 · 风险提示</p>
          <Link className="solution-brand-contact" href="/contact">
            联系客服
          </Link>
        </div>
      </div>
      <section className="solution-hero">
        <div className="solution-container solution-hero-grid">
          <div>
            <p className="solution-eyebrow">Purchase Review</p>
            <h1>购买前复核：{product.name}</h1>
            <p className="solution-lead">{product.claimsSafeSummary}</p>
            <div className="solution-actions">
              <a className="solution-button solution-button-primary" href="#purchase-review">
                查看购买前提示
              </a>
              <Link className="solution-button solution-button-secondary" href={`/solutions/${scenarioSlug}`}>
                返回场景方案
              </Link>
            </div>
          </div>
          <aside className="product-map-hero-card">
            <div className="product-map-hero-media">
              {productImage ? <Image src={productImage} alt={`${product.name}产品图`} width={330} height={260} priority /> : null}
            </div>
            <div className="solution-quick-card">
              <div className="solution-quick-title">
                <HomeIcon name="cart" />
                <h2>第三方平台购买说明</h2>
              </div>
              <p>{THIRD_PARTY_PURCHASE_DISCLAIMER}</p>
              <p>{CROSS_BORDER_NOTICE}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="solution-trust-strip" aria-label="荣旺健康服务基线">
        <div className="solution-container solution-trust-strip-grid">
          {homeTrustBandPoints.map((point) => (
            <div className="solution-trust-item" key={point.title}>
              <HomeIcon name={point.icon} />
              <span>{point.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="solution-section solution-container solution-info-grid">
        <article>
          <h2>产品基础信息</h2>
          <ul>
            <li>产品名称：{product.name}</li>
            <li>短名称：{product.shortName}</li>
            <li>分类：{product.category}</li>
          </ul>
        </article>
        <article>
          <h2>适合关注的健康场景</h2>
          <ul>
            <li>{scenario?.label ?? '健康场景'}</li>
            {product.suitableFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>哪些人需要先咨询医生/药师</h2>
          <ul>
            {product.notFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="solution-section solution-container" id="purchase-review">
        <article className="product-map-review-card">
          <div className="product-map-review-copy">
            <h2>为什么推荐</h2>
            <MeasuredText
              className="product-map-review-summary"
              font={productMapTextFonts.reviewSummary}
              lineHeight={28}
              maxLines={3}
            >
              {product.claimsSafeSummary}
            </MeasuredText>
            <p>{product.complianceNote}</p>
          </div>
          <div className="product-map-review-action">
            <PddCtaButton product={product} scenarioSlug={scenarioSlug} ctaId="product_map_primary" />
          </div>
        </article>
      </section>

      <section className="solution-section solution-container">
        <details className="solution-compliance" open>
          <summary>合规提示</summary>
          <p>{CONSULT_PROFESSIONAL_WARNING}</p>
          <p>{THIRD_PARTY_PURCHASE_DISCLAIMER}</p>
        </details>
      </section>

      <section className="solution-section solution-container">
        <Link className="solution-back-link" href={`/solutions/${scenarioSlug}`}>
          返回场景方案
        </Link>
      </section>
    </main>
  );
}
