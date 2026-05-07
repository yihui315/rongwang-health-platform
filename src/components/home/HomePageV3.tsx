import HomeExpertTrust from './HomeExpertTrust';
import HomeFAQ from './HomeFAQ';
import HomeHealthDirections from './HomeHealthDirections';
import HomeHero from './HomeHero';
import HomeProductPreview from './HomeProductPreview';
import HomeSteps from './HomeSteps';
import HomeTestimonials from './HomeTestimonials';
import HomeTrustBar from './HomeTrustBar';

export default function HomePageV3() {
  return (
    <main className="home-v3">
      <HomeHero />
      <HomeTrustBar />
      <HomeSteps />
      <HomeHealthDirections />
      <HomeExpertTrust />
      <HomeProductPreview />
      <HomeTestimonials />
      <HomeFAQ />
    </main>
  );
}
