import Image from 'next/image';
import Link from 'next/link';

import BrandMark from '@/src/components/branding/BrandMark';
import FunnelPageTracker from '@/src/components/marketing/FunnelPageTracker';
import HomeIcon from './HomeIcon';
import {
  CONSULT_PROFESSIONAL_WARNING,
  NOT_MEDICAL_ADVICE,
  ORIGIN_STANDARD_DIFFERENCE_NOTICE,
  PRODUCT_NOT_MEDICINE_NOTICE,
} from '@/src/lib/compliance/copy';
import { homeHeroAssets } from '@/src/lib/home/home-content';
import type { HomeIconName } from '@/src/lib/home/home-content';

const navItems = [
  { label: '首页', href: '/' },
  { label: '健康场景方案', href: '#health-scenarios' },
  { label: 'AI健康评估', href: '/ai-consult' },
  { label: '产品推荐', href: '/products' },
  { label: '健康知识', href: '/blog' },
  { label: '关于我们', href: '/about' },
];

const scenarioCards: Array<{
  title: string;
  description: string;
  href: string;
  icon: HomeIconName;
  accent: string;
  image: string;
}> = [
  {
    title: '睡眠与压力',
    description: '入睡困难、睡眠质量差、压力大、易疲劳',
    href: '/solutions/sleep-support',
    icon: 'moon',
    accent: 'purple',
    image: '/images/home/homepage-kit/assets/scenarios/cards/01-sleep-pressure.png',
  },
  {
    title: '脑力与专注',
    description: '记忆力下降、注意力不集中、脑力疲劳',
    href: '/solutions/brain-focus',
    icon: 'spark',
    accent: 'blue',
    image: '/images/home/homepage-kit/assets/scenarios/cards/02-brain-focus.png',
  },
  {
    title: '消化与代谢',
    description: '消化不良、腹胀、便秘、代谢困扰',
    href: '/solutions/digestive-support',
    icon: 'leaf',
    accent: 'green',
    image: '/images/home/homepage-kit/assets/scenarios/cards/03-digestion-metabolism.png',
  },
  {
    title: '关节与骨骼',
    description: '关节不适、活动受限、骨骼健康关注',
    href: '/solutions/joint-bone',
    icon: 'shield-check',
    accent: 'amber',
    image: '/images/home/homepage-kit/assets/scenarios/cards/04-joint-bone.png',
  },
  {
    title: '肝胆代谢',
    description: '饮食油腻、应酬较多、代谢管理关注',
    href: '/solutions/liver-metabolism',
    icon: 'chart',
    accent: 'orange',
    image: '/images/home/homepage-kit/assets/scenarios/cards/05-liver-metabolism.png',
  },
  {
    title: '免疫支持',
    description: '换季敏感、日常防护、体质管理关注',
    href: '/solutions/immune-support',
    icon: 'shield-heart',
    accent: 'red',
    image: '/images/home/homepage-kit/assets/scenarios/cards/06-immune-support.png',
  },
  {
    title: '男士健康',
    description: '活力管理、基础营养、中年健康关注',
    href: '/solutions/men-health',
    icon: 'zap',
    accent: 'blue',
    image: '/images/home/homepage-kit/assets/scenarios/cards/07-men-health.png',
  },
  {
    title: '女士健康',
    description: '内分泌平衡、经期健康、营养支持',
    href: '/solutions/women-health',
    icon: 'female',
    accent: 'pink',
    image: '/images/home/homepage-kit/assets/scenarios/cards/08-women-health.png',
  },
];

const productCards = [
  {
    title: '睡眠支持复合配方',
    tag: '睡眠支持',
    description: '支持放松状态与规律作息',
    price: 'HK$ 298',
    bottleImage: '/images/home/homepage-kit/assets/products/bottles/01-sleep-support.png',
    cardImage: '/images/home/homepage-kit/assets/products/cards/01-sleep-support.png',
  },
  {
    title: '脑力专注复合配方',
    tag: '脑力支持',
    description: '支持日常专注状态与用脑营养',
    price: 'HK$ 328',
    bottleImage: '/images/home/homepage-kit/assets/products/bottles/02-brain-support.png',
    cardImage: '/images/home/homepage-kit/assets/products/cards/02-brain-support.png',
  },
  {
    title: '肝脏营养复合配方',
    tag: '肝健康支持',
    description: '支持肝脏营养与代谢管理',
    price: 'HK$ 358',
    bottleImage: '/images/home/homepage-kit/assets/products/bottles/03-liver-support.png',
    cardImage: '/images/home/homepage-kit/assets/products/cards/03-liver-support.png',
  },
  {
    title: '关节灵活复合配方',
    tag: '关节支持',
    description: '支持关节健康，增加灵活性',
    price: 'HK$ 338',
    bottleImage: '/images/home/homepage-kit/assets/products/bottles/04-joint-support.png',
    cardImage: '/images/home/homepage-kit/assets/products/cards/04-joint-support.png',
  },
  {
    title: '免疫营养复合配方',
    tag: '免疫支持',
    description: '支持日常免疫营养与防护管理',
    price: 'HK$ 288',
    bottleImage: '/images/home/homepage-kit/assets/products/bottles/05-immune-support.png',
    cardImage: '/images/home/homepage-kit/assets/products/cards/05-immune-support.png',
  },
  {
    title: '能量活力复合配方',
    tag: '能量支持',
    description: '支持日常活力与基础营养',
    price: 'HK$ 308',
    bottleImage: '/images/home/homepage-kit/assets/products/bottles/06-energy-support.png',
    cardImage: '/images/home/homepage-kit/assets/products/cards/06-energy-support.png',
  },
];

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

const faqItems = ['AI健康评估提供什么参考？', '产品适用前需要注意什么？', '购买后多久能收到产品？', '如何联系客服？'];

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

            <Image
              className="home-hero-trust-strip"
              src="/images/home/homepage-kit/assets/hero/trust-strip-v2.png"
              alt="AI健康评估、香港健康品牌、营养支持建议、第三方平台购买、隐私保护"
              width={1370}
              height={92}
              priority={false}
            />

            <p className="home-hero-note">
              香港注册健康科技企业｜专注亚健康人群营养支持方案
            </p>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <Image
              className="home-hero-skyline"
              src={homeHeroAssets.skyline}
              alt=""
              width={942}
              height={238}
            />
            <Image
              className="home-hero-family"
              src={homeHeroAssets.family}
              alt=""
              width={535}
              height={300}
              priority
            />
            <Image
              className="home-hero-disclaimer-card"
              src={homeHeroAssets.healthEducationCard}
              alt=""
              width={415}
              height={153}
            />
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
              <Link className="home-product-card" key={card.title} href="/products" aria-label={card.title}>
                <Image
                  className="home-product-art"
                  src={card.cardImage}
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
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
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
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="home-panel home-faq-panel">
            <h2>常见问题</h2>
            <div className="home-faq-list">
              {faqItems.map((item) => (
                <div className="home-faq-row" key={item}>
                  <span>{item}</span>
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
          <span className="home-compliance-label">重要声明：</span>
          <p>
            {PRODUCT_NOT_MEDICINE_NOTICE}
            {ORIGIN_STANDARD_DIFFERENCE_NOTICE}
            {NOT_MEDICAL_ADVICE}
            {CONSULT_PROFESSIONAL_WARNING}
          </p>
        </div>
      </section>
    </main>
  );
}
