import {
  healthConsultationResultSchema,
  type HealthConsultationResult,
} from "@/schemas/ai-result";

export type ParseFailureReason = "missing_json" | "invalid_json" | "schema_error";

export interface ParsedHealthConsultationOutput {
  result: HealthConsultationResult | null;
  rawJson: string | null;
  error?: string;
  reason?: ParseFailureReason;
}

export function extractJsonObject(input: string) {
  const fenced = input.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? input;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return fenced.slice(start, end + 1);
}

export function parseHealthConsultationOutput(input: string): ParsedHealthConsultationOutput {
  const rawJson = extractJsonObject(input);

  if (!rawJson) {
    return {
      result: null,
      rawJson: null,
      error: "No JSON object found in model output.",
      reason: "missing_json",
    };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch (error) {
    return {
      result: null,
      rawJson,
      error: error instanceof Error ? error.message : "Invalid JSON output.",
      reason: "invalid_json",
    };
  }

  const parsed = healthConsultationResultSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return {
      result: null,
      rawJson,
      error: parsed.error.message,
      reason: "schema_error",
    };
  }

  return {
    result: parsed.data,
    rawJson,
  };
}
