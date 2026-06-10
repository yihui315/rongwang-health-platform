import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

/**
 * 骨架屏加载组件
 * 使用：<Skeleton /> 或 <Skeleton lines={3} height="h-4" />
 */
export function Skeleton({ className = '', lines = 1, height = 'h-4' }: SkeletonProps) {
  const baseClass = 'animate-pulse rounded bg-gradient-to-r from-[#e8e3db] via-[#f0ebe3] to-[#e8e3db] bg-[length:200%_100%]';

  if (lines === 1) {
    return <div className={`${baseClass} ${height} ${className}`} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClass} ${height}`}
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * 方案页骨架屏
 */
export function SolutionPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="space-y-4 border-b border-[var(--border-subtle)] pb-8">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-64 h-10" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-48 h-6" />
        <div className="flex gap-3">
          <Skeleton className="w-32 h-12" />
          <Skeleton className="w-32 h-12" />
        </div>
      </div>
      {/* 内容区 */}
      <div className="space-y-4">
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * 首页方案卡片骨架屏
 */
export function SolutionCardSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] p-6 space-y-4">
      <Skeleton className="w-20 h-6" />
      <Skeleton className="w-48 h-8" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-32 h-4" />
    </div>
  );
}

/**
 * 案例卡片骨架屏
 */
export function CaseCardSkeleton() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="w-full h-16" />
    </div>
  );
}
