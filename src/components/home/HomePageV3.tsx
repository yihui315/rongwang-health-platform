import Image from 'next/image';
import Link from 'next/link';

import BrandMark from '@/src/components/branding/BrandMark';
import FunnelPageTracker from '@/src/components/marketing/FunnelPageTracker';
import MeasuredText from '@/src/components/text/MeasuredText';
import HomeIcon from './HomeIcon';
import {
  CONSULT_PROFESSIONAL_WARNING,
  NOT_MEDICAL_ADVICE,
  ORIGIN_STANDARD_DIFFERENCE_NOTICE,
  PRODUCT_NOT_MEDICINE_NOTICE,
} from '@/src/lib/compliance/copy';
import {
  homeHealthDirections,
  homeHeroAssets,
  homeHeroTrustTags,
  productPreviewItems,
} from '@/src/lib/home/home-content';
import type { HomeIconName } from '@/src/lib/home/home-content';

const navItems = [
  { label: '首页', href: '/' },
  { label: '健康场景方案', href: '#health-scenarios' },
  { label: 'AI健康评估', href: '/ai-consult' },
  { label: '产品推荐', href: '/products' },
  { label: '健康知识', href: '/blog' },
  { label: '关于我们', href: '/about' },
];

const scenarioCards = homeHealthDirections;
const productCards = productPreviewItems;

const stats: Array<{ value: string; label: string; icon: HomeIconName }> = [
  { value: '10万+', label: '用户信赖选择', icon: 'users' },
  { value: '98.5%', label: '用户满意度', icon: 'shield-heart' },
  { value: '10年+', label: '健康行业经验', icon: 'clock' },
  { value: '香港注册', label: '合规经营', icon: 'shield-check' },
  { value: '专业团队', label: '营养师支持', icon: 'headset' },
];

const whyItems = [
  { title: '科学依据', description: '基于循证医学和营养学研究' },
  { title: '专业团队', description: '注册营养师和健康专家团队' },
  { title: '合规安全', description: '香港注册，严格质量控制' },
  { title: '隐私保护', description: '个人数据严格保密' },
];

const processSteps = [
  { title: '选择方案', description: '选择您的健康关注场景' },
  { title: '查看推荐', description: '选择个性化营养支持' },
  { title: '前往购买', description: '跳转第三方平台完成购买' },
  { title: '售后服务', description: '享受完整的售后服务' },
];

const faqItems = ['AI健康评估准确吗？', '产品是否适合所有人？', '购买后多久能收到产品？', '如何联系客服？'];

const homeTextFonts = {
  scenarioTitle: '950 22px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  scenarioDescription: '700 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  productTitle: '950 21px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  productDescription: '700 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  supportTitle: '900 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  supportDescription: '700 13px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  faqQuestion: '850 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

export default function HomePageV3() {
  return (
    <main className="home-v3">
      <FunnelPageTracker eventName="homepage_view" payload={{ page: 'home' }} />

      <header className="home-header">
        <div className="home-shell home-header-inner">
          <Link className="home-brand" href="/" aria-label="荣旺健康首页">
            <BrandMark />
            <span className="home-brand-copy home-visually-hidden">
              <strong>荣旺健康</strong>
              <small>RONGWANG HEALTH</small>
            </span>
          </Link>

          <nav className="home-nav" aria-label="主导航">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="home-nav-link"
                aria-current={item.label === '首页' ? 'page' : undefined}
                data-active={item.label === '首页' ? 'true' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="home-header-actions">
            <Link className="home-icon-button" href="/products" aria-label="搜索">
              <HomeIcon name="search" />
            </Link>
            <Link className="home-icon-button" href="/about" aria-label="语言">
              <HomeIcon name="globe" />
            </Link>
            <Link className="home-contact-button" href="/contact">
              联系客服
            </Link>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-shell home-hero-inner">
          <div className="home-hero-copy">
            <h1>
              先选健康场景
              <span>再查看适合的<em>营养支持方案</em></span>
            </h1>
            <p className="home-hero-description">
              荣旺健康提供健康教育、生活方式建议与营养支持参考，内容不替代医生诊断，购买将在第三方平台完成。
            </p>
            <div className="home-hero-actions">
              <Link className="home-primary-button" href="/#health-scenarios">
                <HomeIcon name="clipboard-check" />
                按健康场景查看方案
                <span className="home-button-arrow">→</span>
              </Link>
              <Link className="home-secondary-button" href="/ai-consult">
                <HomeIcon name="users" />
                开始3分钟AI健康评估
              </Link>
            </div>

            <div className="home-hero-trust-strip" aria-label="荣旺健康服务特点">
              {homeHeroTrustTags.map((item) => (
                <span key={item.title}>
                  <HomeIcon name={item.icon} />
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
              ))}
            </div>

            <p className="home-hero-note">
              香港注册健康科技企业｜专注亚健康人群营养支持方案
            </p>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <Image
              className="home-hero-family"
              src={homeHeroAssets.family}
              alt=""
              width={1280}
              height={720}
              priority
            />
            <div className="home-hero-disclaimer-card">
              <HomeIcon name="shield-check" />
              <div>
                <strong>健康教育声明</strong>
                <p>本站内容仅用于健康教育，不构成医疗诊断、治疗建议或用药指导。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-scenarios" id="health-scenarios">
        <div className="home-shell">
          <div className="home-section-heading">
            <h2>热门健康场景方案</h2>
            <p>选择您最关注的健康问题，查看个性化营养支持建议与推荐产品</p>
          </div>

          <div className="home-scenario-grid">
            {scenarioCards.map((card) => (
              <Link className="home-scenario-card" key={card.title} href={card.href} data-accent={card.accent} aria-label={card.title}>
                <Image
                  className="home-scenario-art"
                  src={card.image}
                  alt=""
                  width={160}
                  height={320}
                  priority={card.title === '睡眠与压力'}
                />
                <span className="home-scenario-icon-wrap">
                  <HomeIcon name={card.icon} />
                </span>
                <MeasuredText as="strong" font={homeTextFonts.scenarioTitle} lineHeight={28} maxLines={2}>
                  {card.title}
                </MeasuredText>
                <MeasuredText font={homeTextFonts.scenarioDescription} lineHeight={22} maxLines={2}>
                  {card.description}
                </MeasuredText>
                <span className="home-scenario-link">查看方案 →</span>
                <span className="home-card-accessible">{card.title}。{card.description}。查看方案。</span>
              </Link>
            ))}
          </div>

          <div className="home-center-action">
            <Link className="home-chip-button" href="/#health-scenarios">
              查看更多健康场景 →
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section home-products">
        <div className="home-shell home-products-shell">
          <div className="home-section-heading">
            <h2>精选营养支持产品推荐</h2>
            <p>基于科学研究和用户需求，精选优质营养补充剂</p>
          </div>

          <div className="home-product-grid">
            {productCards.map((card, index) => (
              <Link className="home-product-card" key={card.title} href={card.productHref} aria-label={card.title}>
                <span className="home-product-tag" data-accent={card.accent}>{card.tag}</span>
                <span className="home-product-bottle-wrap">
                  <Image
                    src={card.bottleImage}
                    alt=""
                    width={186}
                    height={246}
                    priority={index < 3}
                  />
                </span>
                <MeasuredText as="strong" font={homeTextFonts.productTitle} lineHeight={27} maxLines={2}>
                  {card.title}
                </MeasuredText>
                <MeasuredText font={homeTextFonts.productDescription} lineHeight={23} maxLines={3}>
                  {card.description}
                </MeasuredText>
                <span className="home-product-price">{card.price}</span>
                <span className="home-product-link">查看详情 →</span>
                <Image
                  className="home-product-art"
                  src={card.image}
                  alt=""
                  width={196}
                  height={284}
                  priority={index < 3}
                />
                <span className="home-card-accessible">{card.tag}。{card.title}。{card.description}。{card.price}。查看详情。</span>
              </Link>
            ))}
          </div>

          <div className="home-center-action">
            <Link className="home-chip-button" href="/products">
              查看所有产品 →
            </Link>
          </div>
        </div>
      </section>

      <section className="home-stat-band" aria-label="平台亮点">
        <div className="home-shell home-stat-band-inner">
          {stats.map((item) => (
            <div className="home-stat-item" key={item.label}>
              <HomeIcon name={item.icon} />
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section home-support-area">
        <div className="home-shell home-support-grid">
          <article className="home-panel">
            <h2>为什么选择荣旺健康？</h2>
            <div className="home-why-grid">
              {whyItems.map((item) => (
                <div className="home-why-item" key={item.title}>
                  <span>◎</span>
                  <div>
                    <MeasuredText as="strong" font={homeTextFonts.supportTitle} lineHeight={19} maxLines={1}>
                      {item.title}
                    </MeasuredText>
                    <MeasuredText font={homeTextFonts.supportDescription} lineHeight={20} maxLines={2}>
                      {item.description}
                    </MeasuredText>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="home-panel">
            <h2>购买流程说明</h2>
            <div className="home-process-grid">
              {processSteps.map((step, index) => (
                <div className="home-process-item" key={step.title}>
                  <span>{index + 1}</span>
                  <MeasuredText as="strong" font={homeTextFonts.supportTitle} lineHeight={19} maxLines={1}>
                    {step.title}
                  </MeasuredText>
                  <MeasuredText font={homeTextFonts.supportDescription} lineHeight={20} maxLines={2}>
                    {step.description}
                  </MeasuredText>
                </div>
              ))}
            </div>
          </article>

          <article className="home-panel home-faq-panel">
            <h2>常见问题</h2>
            <div className="home-faq-list">
              {faqItems.map((item) => (
                <div className="home-faq-row" key={item}>
                  <MeasuredText
                    as="span"
                    className="home-faq-question"
                    font={homeTextFonts.faqQuestion}
                    lineHeight={20}
                    maxLines={2}
                  >
                    {item}
                  </MeasuredText>
                  <strong>⌄</strong>
                </div>
              ))}
            </div>
            <Link className="home-faq-more" href="/faq">
              查看更多问题 →
            </Link>
          </article>
        </div>
      </section>

      <section className="home-compliance-band" aria-label="重要声明">
        <div className="home-shell home-compliance-inner">
          <div>
            <span className="home-compliance-label">重要声明：</span>
            <p>
              {PRODUCT_NOT_MEDICINE_NOTICE}
              {ORIGIN_STANDARD_DIFFERENCE_NOTICE}
              {NOT_MEDICAL_ADVICE}
              {CONSULT_PROFESSIONAL_WARNING}
            </p>
          </div>
          <nav className="home-legal-links" aria-label="法律与客服入口">
            <Link href="/compliance">合规说明</Link>
            <Link href="/privacy">隐私政策</Link>
            <Link href="/terms">服务条款</Link>
            <Link href="/contact">联系我们</Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
