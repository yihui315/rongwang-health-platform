import { HEALTH_EDUCATION_DISCLAIMER, PRODUCT_NOT_MEDICINE_NOTICE } from '@/src/lib/compliance/copy';
import { homeHeroAssets, homeHeroTrustTags } from '@/src/lib/home/home-content';
import TrackedLink from '@/src/components/marketing/TrackedLink';
import HomeIcon from './HomeIcon';
import Image from 'next/image';

export default function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-container home-hero-shell">
        <p className="home-hero-eyebrow">科学营养 · 精准支持 · 全家健康</p>
        <div className="home-hero-top">
          <div className="home-hero-copy">
            <div className="home-hero-logo">
              <Image src={homeHeroAssets.logo} alt="荣旺健康 RONGWANG HEALTH" width={154} height={67} priority />
            </div>
            <h1 aria-label="先选健康场景，再查看适合的营养支持方案">
              先选健康场景
              <span>再查看适合的营养支持方案</span>
            </h1>
            <p className="home-hero-subtitle">荣旺健康提供健康教育、生活方式建议与营养支持参考，内容不替代医生诊断，购买将在第三方平台完成。</p>
            <div className="home-hero-actions">
              <TrackedLink
                className="home-button home-button-primary"
                href="#health-scenarios"
                eventName="scenario_click"
                payload={{ scenario_slug: 'homepage_anchor', cta_id: 'hero_scenario_anchor', route: '/', section: 'hero' }}
              >
                <HomeIcon name="leaf" /> 按健康场景查看方案 <span aria-hidden>→</span>
              </TrackedLink>
              <TrackedLink
                className="home-button home-button-secondary"
                href="/ai-consult"
                eventName="assessment_start"
                payload={{ cta_id: 'hero_assessment', route: '/ai-consult', section: 'hero' }}
              >
                <HomeIcon name="clipboard-check" /> 开始3分钟AI健康评估
              </TrackedLink>
            </div>
            <div className="home-hero-tags" aria-label="荣旺健康首页信任点">
              {homeHeroTrustTags.map((item) => (
                <span key={item.title}>
                  <HomeIcon name={item.icon} />
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
              ))}
            </div>
          </div>

          <div className="home-hero-family" aria-label="荣旺健康家庭健康服务主视觉">
            <Image
              className="home-hero-family-panel"
              src={homeHeroAssets.family}
              alt="家庭健康场景"
              width={535}
              height={330}
              priority
            />
          </div>

          <div className="home-hero-side">
            <div className="home-education-card-wrap">
              <Image className="home-education-card" src={homeHeroAssets.healthEducationCard} alt="健康教育声明卡片" width={415} height={153} priority={false} />
            </div>
          </div>
        </div>

        <Image className="home-hero-skyline" src={homeHeroAssets.skyline} alt="城市天际线与湖景背景" width={942} height={238} priority={false} />

        <Image className="home-hero-trust-strip" src={homeHeroAssets.trustStrip} alt="荣旺健康服务特点图标条" width={1370} height={92} priority={false} />

        <Image className="home-hero-leaves home-hero-leaves-left" src={homeHeroAssets.leavesLeft} alt="" width={350} height={242} />
        <Image className="home-hero-leaves home-hero-leaves-right" src={homeHeroAssets.leavesRight} alt="" width={338} height={246} />

        <p className="home-hero-compliance">
          <HomeIcon name="shield-check" />
          {HEALTH_EDUCATION_DISCLAIMER}{PRODUCT_NOT_MEDICINE_NOTICE}
        </p>
      </div>
    </section>
  );
}
