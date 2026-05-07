import Image from 'next/image';
import { expertChecklist, expertTrustPoints } from '@/src/lib/home/home-content';
import HomeIcon from './HomeIcon';

export default function HomeExpertTrust() {
  return (
    <section className="home-section home-expert-section">
      <div className="home-container">
        <div className="home-expert-panel">
          <div className="home-expert-copy">
            <h2>
              专业团队 + 科学逻辑，
              <span>提供更可靠的健康建议</span>
            </h2>
            <div className="home-expert-points">
              {expertTrustPoints.map((point) => (
                <article key={point.title}>
                  <span>
                    <HomeIcon name={point.icon} />
                  </span>
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="home-expert-visual" aria-label="健康顾问示意图">
            <Image
              src="/images/home/expert-consultant.png"
              alt="健康顾问正在整理营养建议"
              width={520}
              height={292}
              priority={false}
            />
          </div>

          <div className="home-expert-checklist">
            {expertChecklist.map((item) => (
              <div key={item}>
                <HomeIcon name="check" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
