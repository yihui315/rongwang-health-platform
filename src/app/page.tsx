import HeroSection from "@/components/sections/HeroSection";
import SceneGrid from "@/components/sections/SceneGrid";
import PlanGrid from "@/components/sections/PlanGrid";
import FamilySection from "@/components/sections/FamilySection";
import ContentSection from "@/components/sections/ContentSection";
import TrustSection from "@/components/sections/TrustSection";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import FaqSection from "@/components/sections/FaqSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <SceneGrid />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">热门健康方案</h2>
          <p className="mt-3 text-slate-500">
            不是单品，而是基于问题类型设计的组合方案
          </p>
        </div>
        <PlanGrid />
      </section>
      <FamilySection />
      <ContentSection />
      <TrustSection />
      <SubscriptionSection />
      <FaqSection />
    </main>
  );
}
