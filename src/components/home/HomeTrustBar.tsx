import { homeTrustBandPoints } from '@/src/lib/home/home-content';
import HomeIcon from './HomeIcon';

export default function HomeTrustBar() {
  return (
    <section className="home-trust-band" aria-label="荣旺健康信任点">
      <div className="home-container">
        <div className="home-trust-strip-frame">
          {homeTrustBandPoints.map((point) => (
            <div className="home-trust-band-item" key={point.title}>
              <HomeIcon name={point.icon} />
              <div>
                <strong>{point.title}</strong>
                <span>{point.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
