import { homeFaqItems } from '@/src/lib/home/home-content';
import HomeIcon from './HomeIcon';
import HomeSectionHeader from './HomeSectionHeader';

export default function HomeFAQ() {
  return (
    <section
      className="home-section home-faq-section"
      aria-label="AI评估仅提供健康教育参考，不作为诊断依据；中高风险建议优先就医并咨询医生。"
    >
      <div className="home-container">
        <HomeSectionHeader title="常见问题" />
        <div className="home-faq-grid">
          {homeFaqItems.map((item) => (
            <article className="home-faq-card" key={item.question}>
              <span>
                <HomeIcon name={item.icon} />
              </span>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
