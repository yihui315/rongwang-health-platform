import { testimonials } from '@/src/lib/home/home-content';
import HomeIcon from './HomeIcon';
import HomeSectionHeader from './HomeSectionHeader';

export default function HomeTestimonials() {
  return (
    <section className="home-section home-testimonials-section">
      <div className="home-container">
        <HomeSectionHeader title="他们的真实反馈" />
        <div className="home-testimonials-grid">
          {testimonials.map((item) => (
            <article className="home-testimonial-card" key={item.name}>
              <div className="home-testimonial-avatar" aria-hidden>
                {item.initials}
              </div>
              <div>
                <HomeIcon name="quote" className="home-testimonial-quote" />
                <p>{item.quote}</p>
                <strong>{item.name}</strong>
                <span>{item.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
