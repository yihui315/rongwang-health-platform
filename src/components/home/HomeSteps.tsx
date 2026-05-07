import { homeSteps } from '@/src/lib/home/home-content';
import HomeSectionHeader from './HomeSectionHeader';

export default function HomeSteps() {
  return (
    <section className="home-section home-steps-section">
      <div className="home-container">
        <HomeSectionHeader title="如何开始" />
        <div className="home-steps-grid">
          {homeSteps.map((step, index) => (
            <article className="home-step-card" key={step.title}>
              <span className="home-step-number">{index + 1}</span>
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
