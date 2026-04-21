'use client';

import { useState, useEffect } from 'react';

interface CountdownBannerProps {
  endTime?: Date;
  title?: string;
  subtitle?: string;
}

export default function CountdownBanner({
  endTime,
  title = '限时优惠',
  subtitle = '新会员首月订阅享 8 折'
}: CountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const targetTime = endTime ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = targetTime.getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const units = [
    { value: timeLeft.days, label: '天' },
    { value: timeLeft.hours, label: '时' },
    { value: timeLeft.minutes, label: '分' },
    { value: timeLeft.seconds, label: '秒' },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 md:p-6"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
    >
      {/* Subtle teal glow */}
      <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-teal-500/15 blur-[60px]" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <p className="text-[13px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex gap-2.5">
          {units.map((unit, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl w-14 h-14 flex items-center justify-center border border-white/5">
                <span className="text-xl font-bold text-white tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="mt-1 text-[11px] text-slate-500 font-medium">{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
