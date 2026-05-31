'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { usePretextTextLayout } from '@/src/hooks/usePretextTextLayout';
import {
  describeDraftLayoutGroupResult,
  describeDraftLayoutResult,
  type TextLayoutPolicy,
} from '@/src/lib/text-layout-policy';

type DraftLayoutPreviewProps = {
  id?: string;
  label: string;
  text: string;
  font: string;
  lineHeight: number;
  maxLines: number;
  className?: string;
  onPolicyChange?: (id: string, policy: TextLayoutPolicy) => void;
};

type DraftLayoutPreviewItem = {
  id: string;
  label: string;
  text: string;
};

type DraftLayoutPreviewGroupProps = {
  title: string;
  description: string;
  items: DraftLayoutPreviewItem[];
  font: string;
  lineHeight: number;
  maxLines: number;
  badge?: string;
  className?: string;
};

export default function DraftLayoutPreview({
  id,
  label,
  text,
  font,
  lineHeight,
  maxLines,
  className,
  onPolicyChange,
}: DraftLayoutPreviewProps) {
  const elementRef = useRef<HTMLParagraphElement | null>(null);
  const setElementRef = useCallback((element: HTMLParagraphElement | null) => {
    elementRef.current = element;
  }, []);
  const policy = usePretextTextLayout(elementRef, text, {
    font,
    lineHeight,
    maxLines,
    wordBreak: 'keep-all',
  });
  const {
    isOverflowing,
    lineCount,
    measuredHeight,
    state,
    targetHeight,
  } = policy;

  useEffect(() => {
    if (id) {
      onPolicyChange?.(id, {
        state,
        isOverflowing,
        lineCount,
        measuredHeight,
        targetHeight,
      });
    }
  }, [
    id,
    isOverflowing,
    lineCount,
    measuredHeight,
    onPolicyChange,
    state,
    targetHeight,
  ]);

  const result = describeDraftLayoutResult(policy);
  const previewStyle = {
    '--text-layout-line-height': `${lineHeight}px`,
    '--text-layout-max-lines': maxLines,
    '--text-layout-target-height': `${policy.targetHeight}px`,
  } as CSSProperties;

  return (
    <article className={className ?? 'draft-layout-preview'} data-layout-tone={result.tone}>
      <div className="draft-layout-preview-head">
        <span>{label}</span>
        <strong>{result.label}</strong>
      </div>
      <p
        ref={setElementRef}
        style={previewStyle}
        data-text-layout="pretext"
        data-text-layout-state={policy.state}
        data-text-overflow={policy.isOverflowing ? 'true' : undefined}
        data-line-count={policy.lineCount || undefined}
      >
        {text}
      </p>
    </article>
  );
}

export function DraftLayoutPreviewGroup({
  title,
  description,
  items,
  font,
  lineHeight,
  maxLines,
  badge = 'Pretext',
  className,
}: DraftLayoutPreviewGroupProps) {
  const [policiesById, setPoliciesById] = useState<Record<string, TextLayoutPolicy>>({});
  const policies = useMemo(
    () => items.map((item) => policiesById[item.id]).filter((policy): policy is TextLayoutPolicy => Boolean(policy)),
    [items, policiesById],
  );
  const groupResult = describeDraftLayoutGroupResult(policies, items.length);

  const handlePolicyChange = useCallback((id: string, policy: TextLayoutPolicy) => {
    setPoliciesById((current) => {
      const previous = current[id];
      if (
        previous &&
        previous.state === policy.state &&
        previous.lineCount === policy.lineCount &&
        previous.isOverflowing === policy.isOverflowing &&
        previous.measuredHeight === policy.measuredHeight &&
        previous.targetHeight === policy.targetHeight
      ) {
        return current;
      }

      return {
        ...current,
        [id]: policy,
      };
    });
  }, []);

  return (
    <section className={className ?? 'draft-layout-panel'} aria-label={title}>
      <div className="draft-layout-panel-head">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{badge}</span>
      </div>
      <div className="draft-layout-summary" data-layout-tone={groupResult.tone}>
        <strong>{groupResult.label}</strong>
        <span>
          已测量 {groupResult.measuredCount}/{groupResult.totalCount} 条 · 溢出 {groupResult.overflowCount} 条
        </span>
      </div>
      {items.map((item) => (
        <DraftLayoutPreview
          key={item.id}
          id={item.id}
          label={item.label}
          text={item.text}
          font={font}
          lineHeight={lineHeight}
          maxLines={maxLines}
          onPolicyChange={handlePolicyChange}
        />
      ))}
    </section>
  );
}
