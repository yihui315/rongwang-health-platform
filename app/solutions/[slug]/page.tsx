import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PddCtaButton from '@/src/components/marketing/PddCtaButton';
import FunnelPageTracker from '@/src/components/marketing/FunnelPageTracker';
import TrackedLink from '@/src/components/marketing/TrackedLink';
import HomeIcon from '@/src/components/home/HomeIcon';
import MeasuredText from '@/src/components/text/MeasuredText';
import { getHealthScenario, healthScenarios } from '@/src/data/health-scenarios';
import {
  CONSULT_PROFESSIONAL_WARNING,
  CROSS_BORDER_NOTICE,
  NOT_MEDICAL_ADVICE,
} from '@/src/lib/compliance/copy';
import { homeHealthDirections, homeTrustBandPoints, productPreviewItems } from '@/src/lib/home/home-content';
import { getProductsForScenario } from '@/src/lib/recommendation/scenario-products';

type SolutionPageProps = {
  params: Promise<{ slug: string }>;
};

const solutionTextFonts = {
  productName: '800 22px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
  productSummary: '400 16px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

export function generateStaticParams() {
  return healthScenarios.map((scenario) => ({ slug: scenario.slug }));
}

export async function generateMetadata({ params }: SolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getHealthScenario(slug);

  if (!scenario) {
    return {};
  }

  return {
    title: `${scenario.label}｜荣旺健康营养支持方案`,
    description: `${scenario.label}场景下的生活方式建议、风险提示与营养支持参考。内容仅用于健康教育，不替代医生诊断。`,
    alternates: {
      canonical: `/solutions/${scenario.slug}`,
    },
  };
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const { slug } = await params;
  const scenario = getHealthScenario(slug);

  if (!scenario) {
    notFound();
  }

  const products = getProductsForScenario(scenario.slug);
  const scenarioVisual = homeHealthDirections.find((item) => item.href === `/solutions/${scenario.slug}`);

  return (
    <main className="solution-page">
      <FunnelPageTracker eventName="solution_view" payload={{ scenario_slug: scenario.slug }} />
      <div className="solution-brand-rail">
        <div className="solution-container solution-brand-rail-inner">
          <span className="solution-brand-kicker">RONGWANG HEALTH</span>
          <p>场景方案 · 适用方向 · 风险提示</p>
          <Link className="solution-brand-contact" href="/contact">
            联系客服
          </Link>
        </div>
      </div>
      <section className="solution-hero">
        <div className="solution-container solution-hero-grid">
          <div>
            <p className="solution-eyebrow">Health Scenario</p>
            <h1>{scenario.title}</h1>
            <p className="solution-lead">
              适合关注：{scenario.concern}
            </p>
            <p className="solution-compliance-line">{NOT_MEDICAL_ADVICE}</p>
            <div className="solution-actions">
              <a className="solution-button solution-button-primary" href="#recommended-products">
                查看推荐产品
              </a>
              <TrackedLink
                className="solution-button solution-button-secondary"
                href="/ai-consult"
                eventName="assessment_start"
                payload={{ scenario_slug: scenario.slug, cta_id: 'solution_hero_assessment' }}
              >
                先做 AI 健康评估
              </TrackedLink>
            </div>
          </div>
          <aside className="solution-hero-visual" aria-label="场景重点">
            {scenarioVisual ? (
              <Image
                className="solution-scenario-image"
                src={scenarioVisual.image}
                alt={`${scenario.label}场景图`}
                width={412}
                height={286}
                priority
              />
            ) : null}
            <div className="solution-quick-card">
              <div className="solution-quick-title">
                <HomeIcon name={scenario.icon} />
                <h2>先看这三件事</h2>
              </div>
              <ol>
                <li>先排除疾病、用药、孕期/哺乳期等风险。</li>
                <li>生活方式建议优先于产品购买。</li>
                <li>购买将在第三方平台完成，价格库存以对方页面为准。</li>
              </ol>
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

      <section className="solution-section solution-container solution-product-section" id="recommended-products">
        <FunnelPageTracker eventName="product_recommendation_view" payload={{ scenario_slug: scenario.slug, product_count: products.length }} />
        <div className="solution-section-heading">
          <p className="solution-eyebrow">Recommended Products</p>
          <h2>推荐产品</h2>
          <p>产品信息为安全占位或已配置资料。无真实 PDD 链接时不会生成假链接。</p>
        </div>

        <div className="solution-product-grid">
          {products.map((product) => (
            <article className="solution-product-card" key={product.id}>
              <div className="solution-product-media">
                {(() => {
                  const preview = productPreviewItems.find((item) => item.productHref === `/product-map/${product.id}`);
                  const image = preview?.bottleImage ?? preview?.image ?? product.image;
                  return image ? (
                    <Image src={image} alt={`${product.name}产品图`} width={280} height={220} />
                  ) : null;
                })()}
              </div>
              <div className="solution-product-copy">
                <p className="solution-product-category">{scenario.label}</p>
                <MeasuredText
                  as="h3"
                  className="solution-product-name"
                  font={solutionTextFonts.productName}
                  lineHeight={29}
                  maxLines={2}
                >
                  {product.name}
                </MeasuredText>
                <MeasuredText
                  className="solution-product-summary"
                  font={solutionTextFonts.productSummary}
                  lineHeight={27}
                  maxLines={3}
                >
                  {product.claimsSafeSummary}
                </MeasuredText>
              </div>
              <div className="solution-product-list">
                <h4>适用场景</h4>
                <ul>
                  {product.suitableFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="solution-product-list solution-product-warning">
                <h4>购买前提示</h4>
                <ul>
                  {product.notFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <PddCtaButton product={product} scenarioSlug={scenario.slug} ctaId="solution_primary_product" />
              <TrackedLink
                className="solution-product-detail-link"
                href={`/product-map/${product.id}`}
                eventName="product_detail_click"
                payload={{ product_id: product.id, scenario_slug: scenario.slug, cta_id: 'solution_product_review' }}
              >
                查看适宜人群与注意事项
              </TrackedLink>
            </article>
          ))}
        </div>
      </section>

      <section className="solution-section solution-container solution-info-grid">
        <article>
          <h2>谁适合关注</h2>
          <ul>
            {scenario.suitableFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>先排除哪些风险</h2>
          <ul>
            {scenario.riskExclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>生活方式建议</h2>
          <ul>
            {scenario.lifestyleTips.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="solution-section solution-container">
        <div className="solution-assessment-band">
          <div>
            <h2>想提高匹配准确度？</h2>
            <p>深度 AI 测评可以帮助识别风险层级和关注方向，但不是查看产品的前置条件。</p>
          </div>
          <TrackedLink
            className="solution-button solution-button-secondary"
            href="/ai-consult"
            eventName="assessment_start"
            payload={{ scenario_slug: scenario.slug, cta_id: 'solution_mid_assessment' }}
          >
            开始 3 分钟 AI 健康评估
          </TrackedLink>
        </div>
      </section>

      <section className="solution-section solution-container">
        <details className="solution-compliance" open>
          <summary>合规健康教育提示</summary>
          <p>{CROSS_BORDER_NOTICE}</p>
          <p>{CONSULT_PROFESSIONAL_WARNING}</p>
        </details>
      </section>

      <section className="solution-section solution-container solution-faq">
        <h2>FAQ</h2>
        {scenario.faq.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>

      <section className="solution-section solution-container">
        <Link className="solution-back-link" href="/#health-scenarios">
          返回全部健康场景
        </Link>
      </section>
    </main>
  );
}
