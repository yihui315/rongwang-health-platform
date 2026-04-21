'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  avatar: string;
}

const defaultTestimonials: Testimonial[] = [
  { id: 1, name: "张伟", role: "产品经理", rating: 5, text: "这个产品彻底改变了我们的工作流程。团队效率提升了40%！", avatar: "/images/avatars/avatar-1.svg" },
  { id: 2, name: "李娜", role: "设计师", rating: 5, text: "界面设计简洁美观，用户体验极佳。我们迫不及待想继续合作。", avatar: "/images/avatars/avatar-2.svg" },
  { id: 3, name: "王强", role: "技术总监", rating: 5, text: "技术实现非常专业，响应速度快，解决问题及时。值得信赖的合作伙伴。", avatar: "/images/avatars/avatar-3.svg" },
];

interface TestimonialCarouselProps {
  testimonials?: Testimonial[];
}

export default function TestimonialCarousel({ testimonials = defaultTestimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="relative h-72 md:h-64">
          {testimonials.map((t, index) => (
            <div
              key={t.id}
              className={`absolute inset-0 transition-all duration-500 ${
                index === currentIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                {/* Avatar */}
                <div className="mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center text-teal-700 text-lg font-bold ring-2 ring-white shadow-sm">
                  {t.name[0]}
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? 'text-amber-400' : 'text-slate-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[15px] text-slate-600 leading-relaxed max-w-lg">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Name */}
                <div className="mt-4">
                  <h4 className="text-[14px] font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[12px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-teal-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`第 ${index + 1} 条评价`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
