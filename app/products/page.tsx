import Link from 'next/link';
import Image from 'next/image';
import { listApprovedStorefrontProducts } from '@/src/lib/mock-store';
import { getStorefrontBottleImage } from '@/src/lib/storefront-assets';
import MeasuredText from '@/src/components/text/MeasuredText';

const productListTextFonts = {
  title: '950 18px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
  summary: '600 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

export default function ProductsPage() {
  const products = listApprovedStorefrontProducts();

  return (
    <main className="storefront-page">
      <div className="storefront-shell">
        <section className="storefront-hero">
          <div className="storefront-hero-copy">
            <p className="storefront-kicker">已审核商品展示</p>
            <h1>产品推荐</h1>
            <p>
              这里仅展示已经通过人工审核的跨境健康品内容。导入与 AI 生成草稿必须先经过合规预检与审核，才会进入前台。
            </p>
          </div>
          <aside className="storefront-hero-aside">
            <strong>合规展示</strong>
            <span>本品不能替代药物，购买与使用请结合产品说明并咨询专业人士。</span>
          </aside>
        </section>

        <section className="storefront-commerce-notice" aria-label="商城与购买状态说明">
          <strong>官网商城当前为商品展示与顾问确认入口</strong>
          <p>
            当前不提供站内支付。微信商城/小程序待开通，购买方式、库存、物流和售后由顾问人工确认购买方式后再继续。
          </p>
        </section>

        <section className="storefront-grid" aria-label="已审核产品列表">
          {products.map((product) => (
            <article key={product.id} className="storefront-product-card">
              <Link
                className="storefront-product-media"
                href={`/products/${product.id}`}
                aria-label={`查看${product.content.shortTitle}`}
              >
                <span className="storefront-product-badge">{product.category || '健康商品'}</span>
                <span className="storefront-product-art">
                  <Image
                    src={getStorefrontBottleImage({
                      id: product.id,
                      title: product.content.shortTitle,
                      category: product.category,
                    })}
                    alt={product.content.shortTitle}
                    fill
                    sizes="(max-width: 900px) 100vw, (max-width: 1280px) 50vw, 360px"
                  />
                </span>
              </Link>
              <div className="storefront-product-body">
                <p className="storefront-product-tag">已审核通过</p>
                <MeasuredText as="h2" font={productListTextFonts.title} lineHeight={23} maxLines={2}>
                  {product.content.shortTitle}
                </MeasuredText>
                <MeasuredText
                  className="storefront-product-summary"
                  font={productListTextFonts.summary}
                  lineHeight={24}
                  maxLines={3}
                >
                  {product.content.shortDescription}
                </MeasuredText>
                <dl className="storefront-product-specs">
                  <div>
                    <dt>原产地</dt>
                    <dd>{product.originCountry || '-'}</dd>
                  </div>
                  <div>
                    <dt>规格</dt>
                    <dd>{product.specs.规格 || '-'}</dd>
                  </div>
                </dl>
                <Link className="storefront-product-link" href={`/products/${product.id}`}>
                  查看详情 <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
          {products.length === 0 ? <p className="storefront-empty">暂无审核通过的商品。</p> : null}
        </section>
      </div>
    </main>
  );
}
