import HeroSection from "@/components/sections/HeroSection";
import TrustBar from "@/components/sections/TrustBar";
import SceneGrid from "@/components/sections/SceneGrid";
import PlanGrid from "@/components/sections/PlanGrid";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContentSection from "@/components/sections/ContentSection";
import FaqSection from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";
import FloatingButton from "@/components/sections/FloatingButton";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <SceneGrid />
      <section id="plans" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            热门方案 · 订阅用户最爱
          </h2>
          <p className="mt-3 text-slate-500">
            AI精准匹配，科学组合，订阅享20%折扣
          </p>
        </div>
        <PlanGrid />
      </section>
      <TestimonialsSection />
      <ContentSection />
      <FaqSection />
      <CtaSection />
      <FloatingButton />
    </main>
  );
}
