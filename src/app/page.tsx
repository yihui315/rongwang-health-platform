import HeroSection from "@/components/sections/HeroSection";
import SceneGrid from "@/components/sections/SceneGrid";
import PlanGrid from "@/components/sections/PlanGrid";
import FamilySection from "@/components/sections/FamilySection";
import ContentSection from "@/components/sections/ContentSection";
import TrustSection from "@/components/sections/TrustSection";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import FaqSection from "@/components/sections/FaqSection";
import CountdownBanner from "@/components/ui/CountdownBanner";
import TestimonialCarousel from "@/components/ui/TestimonialCarousel";
import ProductCompare from "@/components/ui/ProductCompare";

const testimonials = [
  {
    id: 1,
    name: "陈小雅",
    role: "金融从业者 · 香港",
    rating: 5,
    text: "用了抗疲劳方案两周，下午不再靠咖啡硬撑了。精力真的有变好，同事都说我气色不一样了。",
    avatar: "/images/avatars/avatar-1.svg",
  },
  {
    id: 2,
    name: "林志明",
    role: "创业者 · 深圳",
    rating: 5,
    text: "深度睡眠组合是真的有效，入睡比以前快很多，最关键是第二天不会昏沉。强烈推荐给压力大的朋友。",
    avatar: "/images/avatars/avatar-2.svg",
  },
  {
    id: 3,
    name: "王美琪",
    role: "全职妈妈 · 香港",
    rating: 5,
    text: "给全家订了免疫方案，两个孩子这个冬天感冒次数明显少了。家庭订阅的折扣也很划算！",
    avatar: "/images/avatars/avatar-3.svg",
  },
  {
    id: 4,
    name: "张浩然",
    role: "程序员 · 广州",
    rating: 5,
    text: "AI 测评真的很准，精确定位到我的问题是 B 族和镁不足。补了一个月，键盘都敲得更有力了。",
    avatar: "/images/avatars/avatar-4.svg",
  },
];

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      {/* Countdown banner — floating above sections */}
      <section className="mx-auto max-w-4xl px-6 lg:px-8 -mt-8 relative z-10">
        <CountdownBanner />
      </section>

      <SceneGrid />

      {/* Plans section */}
      <section className="bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-24">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              热门健康方案
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              不是单品，而是基于问题类型设计的科学组合方案
            </p>
          </div>
          <PlanGrid />
        </div>
      </section>

      {/* Plan comparison */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <ProductCompare title="热门方案对比" />
        </div>
      </section>

      <FamilySection />

      {/* Testimonials */}
      <section className="bg-slate-50/50 border-t border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">真实用户反馈</h2>
            <p className="mt-3 text-lg text-slate-500">来自香港、深圳、广州用户的真实体验</p>
          </div>
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      <ContentSection />
      <TrustSection />
      <SubscriptionSection />
      <FaqSection />
    </main>
  );
}
