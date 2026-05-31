export type TextLayoutMeasurement = {
  lineCount: number;
  height: number;
};

export type TextLayoutPolicyOptions = {
  lineHeight: number;
  maxLines: number;
};

export type TextLayoutPolicy = {
  state: 'unmeasured' | 'fit' | 'tight' | 'clamped';
  isOverflowing: boolean;
  lineCount: number;
  measuredHeight: number;
  targetHeight: number;
};

export type DraftLayoutResult = {
  tone: 'neutral' | 'success' | 'warning' | 'danger';
  label: string;
};

export type DraftLayoutGroupResult = DraftLayoutResult & {
  measuredCount: number;
  totalCount: number;
  overflowCount: number;
};

export function resolveTextLayoutPolicy(
  measurement: TextLayoutMeasurement | null,
  options: TextLayoutPolicyOptions,
): TextLayoutPolicy {
  const targetHeight = options.lineHeight * options.maxLines;

  if (!measurement) {
    return {
      state: 'unmeasured',
      isOverflowing: false,
      lineCount: 0,
      measuredHeight: 0,
      targetHeight,
    };
  }

  const overflowLines = measurement.lineCount - options.maxLines;

  return {
    state: overflowLines <= 0 ? 'fit' : overflowLines === 1 ? 'tight' : 'clamped',
    isOverflowing: overflowLines > 0,
    lineCount: measurement.lineCount,
    measuredHeight: measurement.height,
    targetHeight,
  };
}

export function describeDraftLayoutResult(policy: TextLayoutPolicy): DraftLayoutResult {
  if (policy.state === 'unmeasured') {
    return {
      tone: 'neutral',
      label: `等待测量 · 目标高度 ${policy.targetHeight}px`,
    };
  }

  if (policy.state === 'fit') {
    return {
      tone: 'success',
      label: `预计 ${policy.lineCount} 行 · 可用于当前展示槽位`,
    };
  }

  if (policy.state === 'tight') {
    return {
      tone: 'warning',
      label: `预计 ${policy.lineCount} 行 · 建议压缩 1 行`,
    };
  }

  return {
    tone: 'danger',
    label: `预计 ${policy.lineCount} 行 · 必须压缩文案`,
  };
}

export function describeDraftLayoutGroupResult(
  policies: TextLayoutPolicy[],
  totalCount = policies.length,
): DraftLayoutGroupResult {
  const measuredCount = policies.filter((policy) => policy.state !== 'unmeasured').length;
  const tightCount = policies.filter((policy) => policy.state === 'tight').length;
  const clampedCount = policies.filter((policy) => policy.state === 'clamped').length;
  const overflowCount = tightCount + clampedCount;

  if (measuredCount < totalCount) {
    return {
      tone: 'neutral',
      label: `已测量 ${measuredCount}/${totalCount} 条 · 等待 Pretext 完成`,
      measuredCount,
      totalCount,
      overflowCount,
    };
  }

  if (clampedCount > 0) {
    return {
      tone: 'danger',
      label: `${clampedCount} 条必须压缩 · ${overflowCount} 条超出目标行数`,
      measuredCount,
      totalCount,
      overflowCount,
    };
  }

  if (tightCount > 0) {
    return {
      tone: 'warning',
      label: `${tightCount} 条建议压缩 · 避免移动端消息卡变高`,
      measuredCount,
      totalCount,
      overflowCount,
    };
  }

  return {
    tone: 'success',
    label: `${totalCount} 条草稿均适配 · 可进入人工内容审核`,
    measuredCount,
    totalCount,
    overflowCount,
  };
}
