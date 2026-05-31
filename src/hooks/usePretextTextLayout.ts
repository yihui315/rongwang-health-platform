'use client';

import { useEffect, useMemo, useState, type RefObject } from 'react';
import { layout, prepare } from '@chenglou/pretext';

import {
  resolveTextLayoutPolicy,
  type TextLayoutPolicy,
  type TextLayoutPolicyOptions,
} from '@/src/lib/text-layout-policy';

type UsePretextTextLayoutOptions = TextLayoutPolicyOptions & {
  font: string;
  wordBreak?: 'normal' | 'keep-all';
  whiteSpace?: 'normal' | 'pre-wrap';
  letterSpacing?: number;
};

type UsePretextTextLayoutResult = TextLayoutPolicy & {
  width: number;
};

export function usePretextTextLayout<T extends HTMLElement>(
  ref: RefObject<T | null>,
  text: string,
  options: UsePretextTextLayoutOptions,
): UsePretextTextLayoutResult {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const updateWidth = () => {
      const nextWidth = Math.floor(element.getBoundingClientRect().width);
      setWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    if ('fonts' in document) {
      document.fonts.ready.then(updateWidth).catch(() => undefined);
    }

    return () => observer.disconnect();
  }, [ref]);

  const measurement = useMemo(() => {
    const canMeasure =
      typeof window !== 'undefined' &&
      typeof Intl !== 'undefined' &&
      typeof Intl.Segmenter !== 'undefined' &&
      width > 0 &&
      text.trim().length > 0;

    if (!canMeasure) return null;

    const prepared = prepare(text, options.font, {
      whiteSpace: options.whiteSpace ?? 'normal',
      wordBreak: options.wordBreak ?? 'keep-all',
      letterSpacing: options.letterSpacing,
    });

    return layout(prepared, width, options.lineHeight);
  }, [
    options.font,
    options.letterSpacing,
    options.lineHeight,
    options.whiteSpace,
    options.wordBreak,
    text,
    width,
  ]);

  return {
    ...resolveTextLayoutPolicy(measurement, options),
    width,
  };
}
