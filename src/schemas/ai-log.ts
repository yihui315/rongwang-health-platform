import { z } from "zod";
import { healthConsultationResultSchema } from "@/schemas/ai-result";

export const aiLogStatusSchema = z.enum([
  "success",
  "fallback",
  "provider_error",
  "parse_error",
  "validation_error",
]);

export const aiLogSchema = z.object({
  requestId: z.string().trim().min(1).optional(),
  provider: z.string().trim().min(1),
  model: z.string().trim().min(1).optional(),
  promptVersion: z.string().trim().min(1),
  status: aiLogStatusSchema,
  fallbackUsed: z.boolean().default(false),
  finishReason: z.string().trim().min(1).optional(),
  rawInput: z.unknown().optional(),
  rawOutput: z.unknown().optional(),
  parsedOutput: healthConsultationResultSchema.optional(),
  errorMessage: z.string().trim().min(1).optional(),
  createdAt: z.string().datetime().optional(),
});

export type AiLogStatus = z.infer<typeof aiLogStatusSchema>;
export type AiLogRecord = z.infer<typeof aiLogSchema>;
