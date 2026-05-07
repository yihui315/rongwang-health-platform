import { homeTrustPoints } from '@/src/lib/home/home-content';
import HomeIcon from './HomeIcon';

export default function HomeTrustBar() {
  return (
    <section className="home-trust-band" aria-label="荣旺健康信任点">
      <div className="home-container home-trust-grid">
        {homeTrustPoints.map((item) => (
          <article className="home-trust-card" key={item.title}>
            <span className="home-trust-icon">
              <HomeIcon name={item.icon} />
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
