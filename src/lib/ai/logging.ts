import type { HealthConsultationResult } from "@/schemas/ai-result";
import { aiLogSchema, type AiLogRecord } from "@/schemas/ai-log";
import type { ParsedHealthConsultationOutput } from "@/lib/ai/parse";
import type { TextGenerationResult } from "@/lib/ai/provider";

interface CreateAiLogInput {
  generation: TextGenerationResult;
  rawInput?: unknown;
  rawOutput?: unknown;
  parsed?: ParsedHealthConsultationOutput;
}

export function createAiLogRecord({
  generation,
  rawInput,
  rawOutput,
  parsed,
}: CreateAiLogInput): AiLogRecord {
  let status: AiLogRecord["status"] = "success";

  if (!generation.success) {
    status = "provider_error";
  } else if (parsed?.reason === "schema_error") {
    status = "validation_error";
  } else if (parsed?.reason) {
    status = "parse_error";
  } else if (generation.fallbackUsed) {
    status = "fallback";
  }

  const parsedOutput: HealthConsultationResult | undefined =
    parsed?.result ?? undefined;

  return aiLogSchema.parse({
    provider: generation.resolvedProvider,
    model: generation.model,
    promptVersion: generation.promptVersion,
    status,
    fallbackUsed: generation.fallbackUsed,
    rawInput,
    rawOutput,
    parsedOutput,
    errorMessage: generation.error ?? parsed?.error,
    createdAt: new Date().toISOString(),
  });
}
