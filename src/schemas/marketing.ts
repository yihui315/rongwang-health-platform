import { z } from "zod";

export const marketingObjectiveValues = [
  "assessment_conversion",
  "seo_growth",
  "retention",
  "reactivation",
  "pdd_conversion",
] as const;

export const marketingChannelValues = [
  "seo_article",
  "landing_page",
  "xiaohongshu",
  "wechat",
  "douyin",
  "email",
] as const;

const defaultAudience = "关注日常健康管理、希望先评估再选择方案的用户";

export const marketingCampaignRequestSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  objective: z.enum(marketingObjectiveValues).default("assessment_conversion"),
  audience: z.string().min(2).max(160).default(defaultAudience),
  solution: z.string().max(80).optional(),
  keyword: z.string().min(2).max(80).optional(),
  campaignSlug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-]*$/i)
    .optional(),
  channels: z.array(z.enum(marketingChannelValues)).min(1).max(6).default([
    "seo_article",
    "landing_page",
    "xiaohongshu",
    "email",
  ]),
  offer: z.string().max(120).optional(),
  ref: z.string().max(80).optional(),
  execute: z.boolean().optional().default(false),
});

export const marketingAutopilotRequestSchema = marketingCampaignRequestSchema.extend({
  lookbackDays: z.number().int().min(1).max(90).optional().default(14),
  minCompletionRate: z.number().min(0).max(1).optional().default(0.35),
  minRecommendationClickRate: z.number().min(0).max(1).optional().default(0.18),
  minPddRedirectRate: z.number().min(0).max(1).optional().default(0.12),
});

export type MarketingObjective = (typeof marketingObjectiveValues)[number];
export type MarketingChannel = (typeof marketingChannelValues)[number];
export type MarketingCampaignRequest = z.infer<typeof marketingCampaignRequestSchema>;
export type MarketingCampaignRequestInput = z.input<typeof marketingCampaignRequestSchema>;
export type MarketingAutopilotRequest = z.infer<typeof marketingAutopilotRequestSchema>;
export type MarketingAutopilotRequestInput = z.input<typeof marketingAutopilotRequestSchema>;
