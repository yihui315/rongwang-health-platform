'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 滚动入场动画 Hook
 * 元素进入视口时触发 fade-up 动画
 *
 * @param threshold - 触发时机（0-1），默认0.15
 * @param once - 是否只触发一次，默认true
 * @param delay - 延迟毫秒，默认0
 */
export function useInView(options: {
  threshold?: number;
  once?: boolean;
  delay?: number;
} = {}) {
  const { threshold = 0.15, once = true, delay = 0 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsInView(true), delay);
          } else {
            setIsInView(true);
          }
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, delay]);

  return { ref, isInView };
}

/**
 * 滚动入场包装组件
 * 配合 Tailwind 的 animate-fade-up 使用
 */
export function FadeInSection({
  children,
  className = '',
  delay = 0,
  threshold = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}) {
  const { ref, isInView } = useInView({ threshold, delay });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`transition-all ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
      style={{ transitionDuration: '0.5s', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {children}
    </section>
  );
}
