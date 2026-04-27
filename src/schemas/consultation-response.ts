import { z } from "zod";
import { aiLogStatusSchema } from "@/schemas/ai-log";
import { healthConsultationResultSchema } from "@/schemas/ai-result";
import { healthProfileSchema } from "@/schemas/health";

export const productRecommendationSchema = z.object({
  id: z.string().trim().min(1),
  productSlug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  price: z.number().nonnegative(),
  image: z.string().nullable(),
  tagline: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  destinationUrl: z.string().trim().min(1),
  isExternal: z.boolean(),
});

export const safetyResponseSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high", "urgent"]),
  redFlags: z.array(z.string()),
  cautionFlags: z.array(z.string()),
  commerceAllowed: z.boolean(),
  clinicianAdvice: z.array(z.string()),
});

export const aiMetaSchema = z
  .object({
    provider: z.string().trim().min(1),
    model: z.string().trim().min(1).optional(),
    promptVersion: z.string().trim().min(1),
    status: aiLogStatusSchema,
    fallbackUsed: z.boolean(),
  })
  .nullable();

export const consultationResponseSchema = z.object({
  consultationId: z.string().trim().min(1),
  generatedAt: z.string().datetime(),
  profile: healthProfileSchema,
  result: healthConsultationResultSchema,
  recommendations: z.array(productRecommendationSchema),
  safety: safetyResponseSchema,
  ai: aiMetaSchema,
});

export type ConsultationResponse = z.infer<typeof consultationResponseSchema>;
