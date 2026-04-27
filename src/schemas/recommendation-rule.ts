import { z } from "zod";
import { riskLevelSchema } from "@/schemas/ai-result";
import { solutionTypeValues } from "@/lib/health/mappings";

const lifestyleConditionSchema = z
  .object({
    alcohol: z.boolean().optional(),
    smoking: z.boolean().optional(),
    sleepIncludes: z.array(z.string().trim().min(1)).optional(),
    exerciseIncludes: z.array(z.string().trim().min(1)).optional(),
  })
  .strict();

export const recommendationConditionSchema = z
  .object({
    solutionTypes: z.array(z.enum(solutionTypeValues)).optional(),
    riskLevels: z.array(riskLevelSchema).optional(),
    genders: z.array(z.enum(["male", "female", "other"])).optional(),
    minAge: z.number().int().nonnegative().optional(),
    maxAge: z.number().int().nonnegative().optional(),
    symptomIncludes: z.array(z.string().trim().min(1)).optional(),
    goalIncludes: z.array(z.string().trim().min(1)).optional(),
    lifestyle: lifestyleConditionSchema.optional(),
  })
  .strict();

export const recommendationRuleSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  condition: recommendationConditionSchema,
  productIds: z.array(z.string().trim().min(1)).min(1),
  priority: z.number().int().min(0).default(100),
  active: z.boolean().default(true),
  note: z.string().trim().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type RecommendationCondition = z.infer<typeof recommendationConditionSchema>;
export type RecommendationRuleRecord = z.infer<typeof recommendationRuleSchema>;
