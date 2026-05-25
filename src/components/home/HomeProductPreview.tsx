import Image from 'next/image';
import { productPreviewItems } from '@/src/lib/home/home-content';
import TrackedLink from '@/src/components/marketing/TrackedLink';
import FunnelPageTracker from '@/src/components/marketing/FunnelPageTracker';
import HomeSectionHeader from './HomeSectionHeader';

export default function HomeProductPreview() {
  return (
    <section className="home-section home-products-section">
      <FunnelPageTracker eventName="product_card_view" payload={{ section: 'homepage_featured_products', product_count: productPreviewItems.length }} />
      <div className="home-container">
        <HomeSectionHeader
          title="精选营养支持产品推荐"
          note="基于科学研究和用户需求，精选优质营养补充剂"
        />
        <div className="home-products-grid">
          {productPreviewItems.map((item, index) => (
            <article className="home-product-card" key={item.title}>
              <TrackedLink
                className="home-product-art"
                href={item.productHref}
                eventName="product_detail_click"
                payload={{
                  product_id: item.productHref.split('/').pop(),
                  scenario_slug: item.href.split('/').pop(),
                  cta_id: 'homepage_product_card',
                  route: item.productHref,
                  section: 'featured_products',
                }}
              >
                <Image src={item.image} alt={`${item.title}产品卡片`} width={196} height={284} priority={index < 3} />
              </TrackedLink>
              <div className="home-product-meta sr-visual-meta" data-accent={item.accent}>
                <span>{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <strong>{item.price}</strong>
                <TrackedLink
                  href={item.productHref}
                  eventName="product_detail_click"
                  payload={{
                    product_id: item.productHref.split('/').pop(),
                    scenario_slug: item.href.split('/').pop(),
                    cta_id: 'homepage_product_detail',
                    route: item.productHref,
                    section: 'featured_products',
                  }}
                >
                  查看详情 <span aria-hidden>→</span>
                </TrackedLink>
              </div>
            </article>
          ))}
        </div>
        <div className="home-section-action">
          <TrackedLink
            className="home-mini-button"
            href="/products"
            eventName="product_detail_click"
            payload={{ cta_id: 'homepage_all_products', route: '/products', section: 'featured_products' }}
          >
            查看所有产品 <span aria-hidden>→</span>
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
