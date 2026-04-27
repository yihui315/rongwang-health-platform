import type { SolutionType } from "@/schemas/ai-result";
import type { HealthProfile } from "@/schemas/health";
import { CONSULT_SYSTEM_PROMPT, createConsultPrompt } from "@/lib/health/ai-prompts";

export interface PromptBundle {
  systemPrompt: string;
  userPrompt: string;
  promptVersion: string;
}

export function getHealthConsultPromptBundle(
  profile: HealthProfile,
  fallbackType: SolutionType,
): PromptBundle {
  return {
    systemPrompt: CONSULT_SYSTEM_PROMPT,
    userPrompt: createConsultPrompt(profile, fallbackType),
    promptVersion: process.env.AI_PROMPT_VERSION?.trim() || "health-consult-v1",
  };
}
