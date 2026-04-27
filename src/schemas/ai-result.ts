import { z } from "zod";
import { solutionTypeValues, type SolutionType as SharedSolutionType } from "@/lib/health/mappings";

export const riskLevelSchema = z.enum(["low", "medium", "high", "urgent"]);
export const solutionTypeSchema = z.enum(solutionTypeValues);

export const healthConsultationResultSchema = z.object({
  summary: z.string().trim().min(1),
  riskLevel: riskLevelSchema,
  possibleFactors: z.array(z.string().trim().min(1)).max(5),
  redFlags: z.array(z.string().trim().min(1)).max(5),
  lifestyleAdvice: z.array(z.string().trim().min(1)).max(6),
  supplementDirections: z.array(z.string().trim().min(1)).max(5),
  otcDirections: z.array(z.string().trim().min(1)).max(5),
  recommendedSolutionType: solutionTypeSchema,
  productRecommendationReason: z.string().trim().min(1),
  disclaimer: z.string().trim().min(1),
});

export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type SolutionType = SharedSolutionType;
export type HealthConsultationResult = z.infer<typeof healthConsultationResultSchema>;
