import { homeSteps } from '@/src/lib/home/home-content';
import HomeIcon from './HomeIcon';
import HomeSectionHeader from './HomeSectionHeader';

export default function HomeSteps() {
  return (
    <section className="home-section home-steps-section">
      <div className="home-container">
        <HomeSectionHeader eyebrow="Process" title="购买流程" note="从健康场景到第三方平台购买，路径清晰可追踪" />
        <div className="home-steps-grid">
          {homeSteps.map((step, index) => (
            <article className="home-step-card" key={step.title}>
              <span className="home-step-number">
                <HomeIcon name={step.icon} />
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < homeSteps.length - 1 ? <span className="home-step-arrow" aria-hidden>›</span> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
