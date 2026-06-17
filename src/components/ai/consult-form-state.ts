import { healthProfileSchema, type HealthProfile } from "@/schemas/health";
import type { AssessmentScenario } from "@/schemas/assessment-router";

export interface ConsultFormState {
  age: string;
  gender: HealthProfile["gender"];
  symptoms: string[];
  duration: string;
  sleep: string;
  alcohol: boolean;
  smoking: boolean;
  exercise: string;
  goal: string;
  medications: string;
  allergies: string;
}

export const initialConsultFormState = {
  age: "",
  gender: "female",
  symptoms: [],
  duration: "1到4周",
  sleep: "偶尔晚睡或睡不沉",
  alcohol: false,
  smoking: false,
  exercise: "每周1到2次",
  goal: "改善白天精力",
  medications: "",
  allergies: "",
} satisfies ConsultFormState;

const scenarioFormPatches = {
  unknown: {
    symptoms: [],
    goal: initialConsultFormState.goal,
    alcohol: false,
  },
  sleep: {
    symptoms: ["入睡困难", "夜间易醒"],
    goal: "改善睡眠质量",
    sleep: "偶尔晚睡或睡不沉",
    alcohol: false,
  },
  fatigue: {
    symptoms: ["容易疲劳", "恢复变慢"],
    goal: "改善白天精力",
    alcohol: false,
  },
  alcohol: {
    symptoms: ["饮酒后疲惫", "熬夜后不适"],
    goal: "减少熬夜和应酬后的不适",
    sleep: "经常熬夜或睡眠不足",
    alcohol: true,
  },
  immunity: {
    symptoms: ["换季易不适", "恢复变慢"],
    goal: "提升换季防护状态",
    alcohol: false,
  },
  female: {
    symptoms: ["情绪波动", "容易疲劳"],
    gender: "female",
    goal: "缓解压力并稳定状态",
    alcohol: false,
  },
  male: {
    symptoms: ["男性精力状态下降", "恢复变慢"],
    gender: "male",
    goal: "做一份男性健康方向评估",
    alcohol: false,
  },
} satisfies Record<AssessmentScenario, Partial<ConsultFormState>>;

export function applyScenarioToConsultFormState(
  current: ConsultFormState,
  scenario: AssessmentScenario,
): ConsultFormState {
  const patch = scenarioFormPatches[scenario];
  return {
    ...current,
    ...patch,
    symptoms: patch.symptoms ? [...patch.symptoms] : [...current.symptoms],
  };
}

export function buildScenarioConsultFormState(scenario: AssessmentScenario): ConsultFormState {
  return applyScenarioToConsultFormState(
    {
      ...initialConsultFormState,
      symptoms: [...initialConsultFormState.symptoms],
    },
    scenario,
  );
}

export function firstConsultFormErrorMessage(
  error: ReturnType<typeof healthProfileSchema.safeParse>,
) {
  if (error.success) return "";
  const flattened = error.error.flatten().fieldErrors;
  return Object.values(flattened).flat()[0] ?? "请先补全评估信息。";
}
