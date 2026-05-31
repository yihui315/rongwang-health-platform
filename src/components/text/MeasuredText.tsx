'use client';

import { useCallback, useRef, type CSSProperties } from 'react';

import { usePretextTextLayout } from '@/src/hooks/usePretextTextLayout';

type MeasuredTextProps = {
  as?: 'p' | 'span' | 'strong' | 'h2' | 'h3';
  children: string;
  className?: string;
  font: string;
  lineHeight: number;
  maxLines: number;
  wordBreak?: 'normal' | 'keep-all';
  id?: string;
};

export default function MeasuredText({
  as = 'p',
  children,
  className,
  font,
  lineHeight,
  maxLines,
  wordBreak = 'keep-all',
  id,
}: MeasuredTextProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const setElementRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);
  const policy = usePretextTextLayout(elementRef, children, {
    font,
    lineHeight,
    maxLines,
    wordBreak,
  });
  const style = {
    '--text-layout-line-height': `${lineHeight}px`,
    '--text-layout-max-lines': maxLines,
    '--text-layout-target-height': `${policy.targetHeight}px`,
  } as CSSProperties;

  const commonProps = {
    id,
    className,
    'data-text-layout': 'pretext',
    'data-text-layout-state': policy.state,
    'data-text-overflow': policy.isOverflowing ? 'true' : undefined,
    'data-line-count': policy.lineCount || undefined,
    title: policy.isOverflowing ? children : undefined,
    style,
  };

  if (as === 'span') {
    return (
      <span ref={setElementRef} {...commonProps}>
        {children}
      </span>
    );
  }

  if (as === 'strong') {
    return (
      <strong ref={setElementRef} {...commonProps}>
        {children}
      </strong>
    );
  }

  if (as === 'h2') {
    return (
      <h2 ref={setElementRef} {...commonProps}>
        {children}
      </h2>
    );
  }

  if (as === 'h3') {
    return (
      <h3 ref={setElementRef} {...commonProps}>
        {children}
      </h3>
    );
  }

  return (
    <p ref={setElementRef} {...commonProps}>
      {children}
    </p>
  );
}
