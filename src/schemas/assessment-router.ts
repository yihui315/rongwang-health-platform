import { z } from "zod";

export const ASSESSMENT_VERSION = "RHTP-assessment-v1.0";
export const ASSESSMENT_RULE_VERSION = "RHTP-rules-v1.0";

export const assessmentScenarioValues = [
  "unknown",
  "sleep",
  "fatigue",
  "alcohol",
  "immunity",
  "female",
  "male",
] as const;

export const assessmentScenarioSchema = z.enum(assessmentScenarioValues);
export type AssessmentScenario = z.infer<typeof assessmentScenarioSchema>;

export const assessmentRouterContextSchema = z.object({
  assessment_id: z.string().trim().min(1).max(80),
  assessment_version: z.literal(ASSESSMENT_VERSION),
  rule_version: z.literal(ASSESSMENT_RULE_VERSION),
  entry_scenario: assessmentScenarioSchema,
  selected_scenario: assessmentScenarioSchema,
  entry_source: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9_-]+$/),
  started_at: z.string().datetime(),
});

export type AssessmentRouterContext = z.infer<typeof assessmentRouterContextSchema>;

export const assessmentScenarioOptions: Array<{
  value: AssessmentScenario;
  label: string;
  helper: string;
}> = [
  {
    value: "unknown",
    label: "不确定，AI 帮我判断",
    helper: "最适合混合症状或首次使用",
  },
  {
    value: "sleep",
    label: "睡眠不好",
    helper: "入睡难 / 睡浅",
  },
  {
    value: "fatigue",
    label: "总是疲劳",
    helper: "恢复慢 / 没精神",
  },
  {
    value: "alcohol",
    label: "应酬恢复慢",
    helper: "饮酒 / 熬夜后负担",
  },
  {
    value: "immunity",
    label: "免疫状态低",
    helper: "换季 / 状态波动",
  },
  {
    value: "female",
    label: "女性健康",
    helper: "周期 / 气色 / 压力",
  },
  {
    value: "male",
    label: "男性精力",
    helper: "应酬 / 压力 / 体力",
  },
];

export function normalizeAssessmentScenario(value: unknown): AssessmentScenario {
  if (typeof value === "string" && assessmentScenarioSchema.safeParse(value).success) {
    return value as AssessmentScenario;
  }

  return "unknown";
}

export function normalizeAssessmentEntrySource(value: unknown) {
  if (typeof value !== "string") {
    return "assessment_router";
  }

  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 80);
  return normalized || "assessment_router";
}

export function createAssessmentId() {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return `rhtp_${randomUuid}`;
  }

  return `rhtp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createAssessmentRouterContext(input: {
  entryScenario: AssessmentScenario;
  selectedScenario?: AssessmentScenario;
  entrySource?: string;
  startedAt?: string;
  assessmentId?: string;
}): AssessmentRouterContext {
  return {
    assessment_id: input.assessmentId ?? createAssessmentId(),
    assessment_version: ASSESSMENT_VERSION,
    rule_version: ASSESSMENT_RULE_VERSION,
    entry_scenario: input.entryScenario,
    selected_scenario: input.selectedScenario ?? input.entryScenario,
    entry_source: normalizeAssessmentEntrySource(input.entrySource),
    started_at: input.startedAt ?? new Date().toISOString(),
  };
}

export function updateAssessmentRouterContextScenario(
  context: AssessmentRouterContext,
  selectedScenario: AssessmentScenario,
): AssessmentRouterContext {
  return {
    ...context,
    selected_scenario: selectedScenario,
  };
}

export function getAssessmentScenarioLabel(scenario: AssessmentScenario) {
  return assessmentScenarioOptions.find((option) => option.value === scenario)?.label ?? "不确定，AI 帮我判断";
}
