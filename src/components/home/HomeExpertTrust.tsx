import { homeWhyChoosePoints } from '@/src/lib/home/home-content';
import HomeIcon from './HomeIcon';

export default function HomeExpertTrust() {
  return (
    <section className="home-compact-card home-why-card" aria-label="为什么选择荣旺健康">
      <h2>为什么选择荣旺健康？</h2>
      <div className="home-why-grid">
        {homeWhyChoosePoints.map((point) => (
          <div className="home-why-item" key={point.title}>
            <span>
              <HomeIcon name={point.icon} />
            </span>
            <div>
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
