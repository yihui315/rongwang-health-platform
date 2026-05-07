import Link from 'next/link';
import Image from 'next/image';
import { homeHealthDirections } from '@/src/lib/home/home-content';
import HomeIcon from './HomeIcon';
import HomeSectionHeader from './HomeSectionHeader';

export default function HomeHealthDirections() {
  return (
    <section className="home-section home-directions-section">
      <div className="home-container">
        <HomeSectionHeader title="关注你的健康方向" />
        <div className="home-directions-grid">
          {homeHealthDirections.map((item) => (
            <article className="home-direction-card" data-accent={item.accent} key={item.title}>
              <div className="home-direction-visual">
                <Image src={item.image} alt={`${item.title}方向场景图`} width={360} height={270} />
              </div>
              <div className="home-direction-body">
                <span className="home-direction-icon">
                  <HomeIcon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link href={item.href}>进入评估</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
