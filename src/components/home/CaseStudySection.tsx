'use client';

import React, { useState } from 'react';
import { type CaseStudy } from '@/lib/health/cases';

interface CaseStudyCardProps {
  cases: CaseStudy[];
}

export default function CaseStudySection({ cases }: CaseStudyCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!cases || cases.length === 0) return null;

  return (
    <section className="card-elevated overflow-hidden">
      <div className="border-b border-[var(--border-subtle)] bg-[#f0fdf4] px-5 py-4">
        <h2 className="text-xl font-semibold text-[#166534]">真实案例分享</h2>
        <p className="mt-1 text-sm text-[#166534]/70">已验证用户真实反馈（脱敏处理）</p>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {cases.map((c) => {
          const isOpen = expandedId === c.id;
          return (
            <div key={c.id} className="p-5">
              {/* 用户基本信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#cfe7df] text-lg font-bold text-[#2c504a]">
                    {c.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {c.name} <span className="font-normal text-[var(--text-secondary)]">· {c.age}岁 · {c.location}</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">{c.timeline}</div>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(isOpen ? null : c.id)}
                  className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[#2c504a] hover:text-[#2c504a]"
                >
                  {isOpen ? '收起' : '查看详情'}
                </button>
              </div>

              {/* Before/After 预览 */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                  <div className="mb-2 text-xs font-semibold text-red-600">调理前</div>
                  <div className="space-y-1">
                    {c.beforeState.slice(0, 2).map((s) => (
                      <div key={s} className="flex items-start gap-1.5 text-xs text-red-800">
                        <span className="mt-0.5 text-red-400">✗</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                  <div className="mb-2 text-xs font-semibold text-green-600">调理后</div>
                  <div className="space-y-1">
                    {c.afterState.slice(0, 2).map((s) => (
                      <div key={s} className="flex items-start gap-1.5 text-xs text-green-800">
                        <span className="mt-0.5 text-green-500">✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 引用 */}
              <blockquote className="mt-3 rounded-lg border-l-4 border-[#2c504a] bg-[var(--surface)] px-4 py-3 text-sm italic text-[var(--text-secondary)]">
                "{c.quote}"
              </blockquote>

              {/* 详细展开内容 */}
              {isOpen && (
                <div className="mt-4 space-y-4 border-t border-[var(--border-subtle)] pt-4">
                  <div>
                    <div className="mb-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Before → After 完整对比</div>
                    <div className="space-y-2">
                      {c.beforeState.map((b, i) => (
                        <div key={b} className="flex items-start gap-3">
                          <span className="mt-1 shrink-0 rounded-full bg-red-100 p-0.5 text-center text-xs text-red-600">✗</span>
                          <div className="flex-1">
                            <div className="text-sm text-red-700 line-through decoration-red-300">{b}</div>
                            <div className="mt-0.5 flex items-start gap-1 text-sm text-green-700">
                              <span className="text-green-500">→</span>
                              <span>{c.afterState[i]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">使用产品：</span>
                    {c.products.map((p) => (
                      <span key={p} className="rounded-full bg-[#cfe7df] px-2.5 py-1 text-xs font-medium text-[#2c504a]">{p}</span>
                    ))}
                  </div>

                  <div className="rounded-lg bg-[#f0f7f4] px-3 py-2 text-xs text-[#2c504a]">
                    ⏱ {c.duration}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
