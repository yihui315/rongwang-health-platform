import HomeHero from "@/components/home/HomeHero";
import HomeTrustBar from "@/components/home/HomeTrustBar";
import HomeSteps from "@/components/home/HomeSteps";
import HomeHealthDirections from "@/components/home/HomeHealthDirections";
import HomeExpertTrust from "@/components/home/HomeExpertTrust";
import HomeProductPreview from "@/components/home/HomeProductPreview";
import HomeTestimonials from "@/components/home/HomeTestimonials";
import HomeFAQ from "@/components/home/HomeFAQ";

/**
 * 荣旺健康首页 V3
 * 设计原则：简约 / 专业 / 强信任 / 高转化 / 合规优先 (assessment-first)
 */
export default function HomePageV3() {
  return (
    <main className="bg-white text-slate-900">
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
