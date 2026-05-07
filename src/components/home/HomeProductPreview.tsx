import Image from 'next/image';
import Link from 'next/link';
import { productPreviewItems } from '@/src/lib/home/home-content';
import HomeSectionHeader from './HomeSectionHeader';

export default function HomeProductPreview() {
  return (
    <section className="home-section home-products-section">
      <div className="home-container">
        <HomeSectionHeader title="方案推荐方向（示例）" note="完整推荐将在评估后为你展示" />
        <div className="home-products-grid">
          {productPreviewItems.map((item) => (
            <article className="home-product-card" key={item.title}>
              <div className="home-product-image">
                <Image src={item.image} alt={`${item.title}产品示意图`} width={180} height={135} />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link href={item.href}>查看详情</Link>
              </div>
            </article>
          ))}
        </div>
        <p className="home-products-note">产品示例仅供方向参考，具体推荐以评估结果为准。本品不能替代药物。</p>
      </div>
    </section>
  );
}
