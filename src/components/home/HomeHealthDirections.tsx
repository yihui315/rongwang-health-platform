import Image from 'next/image';
import { homeHealthDirections } from '@/src/lib/home/home-content';
import TrackedLink from '@/src/components/marketing/TrackedLink';
import HomeSectionHeader from './HomeSectionHeader';

export default function HomeHealthDirections() {
  return (
    <section className="home-section home-directions-section" id="health-scenarios">
      <div className="home-container">
        <HomeSectionHeader
          title="热门健康场景方案"
          note="选择您最关注的健康问题，查看个性化营养支持建议与推荐产品"
        />
        <div className="home-directions-grid">
          {homeHealthDirections.map((item) => (
            <TrackedLink
              className="home-direction-card"
              href={item.href}
              eventName="scenario_click"
              payload={{
                scenario_slug: item.href.split('/').pop() ?? item.title,
                cta_id: 'homepage_scenario_card',
                route: item.href,
                section: 'health_scenarios',
              }}
              key={item.title}
              aria-label={`${item.title}：${item.description}，查看方案`}
            >
              <Image src={item.image} alt={`${item.title}健康场景卡`} width={160} height={320} priority={item.href === '/solutions/sleep-support'} />
              <span className="home-direction-overlay">{item.safetyNote}</span>
            </TrackedLink>
          ))}
        </div>
        <div className="home-section-action">
          <TrackedLink
            className="home-mini-button"
            href="#health-scenarios"
            eventName="scenario_click"
            payload={{ scenario_slug: 'more_scenarios', cta_id: 'homepage_more_scenarios', route: '/', section: 'health_scenarios' }}
          >
            查看更多健康场景 <span aria-hidden>→</span>
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
