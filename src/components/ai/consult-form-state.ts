import { healthProfileSchema, type HealthProfile } from "@/schemas/health";

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

export function firstConsultFormErrorMessage(
  error: ReturnType<typeof healthProfileSchema.safeParse>,
) {
  if (error.success) return "";
  const flattened = error.error.flatten().fieldErrors;
  return Object.values(flattened).flat()[0] ?? "请先补全评估信息。";
}
