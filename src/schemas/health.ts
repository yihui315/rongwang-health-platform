import { z } from "zod";

const optionalNote = z
  .string()
  .trim()
  .max(200, "内容请控制在200字以内")
  .optional()
  .transform((value) => value ?? "");

export const healthProfileSchema = z.object({
  age: z
    .coerce
    .number()
    .int("年龄需要是整数")
    .min(12, "年龄需要大于等于12岁")
    .max(90, "年龄需要小于等于90岁"),
  gender: z.enum(["male", "female", "other"], "请选择性别"),
  symptoms: z
    .array(z.string().trim().min(1))
    .min(1, "请至少选择1个主要困扰")
    .max(8, "最多选择8个主要困扰"),
  duration: z.string().trim().min(1, "请选择持续时间").max(80),
  lifestyle: z.object({
    sleep: z.string().trim().min(1, "请选择睡眠情况").max(80),
    alcohol: z.boolean(),
    smoking: z.boolean(),
    exercise: z.string().trim().min(1, "请选择运动情况").max(80),
  }),
  goal: z.string().trim().min(1, "请填写健康目标").max(160, "目标请控制在160字以内"),
  medications: optionalNote,
  allergies: optionalNote,
});

export type HealthProfile = z.infer<typeof healthProfileSchema>;

export const consultationRequestSchema = z.object({
  profile: healthProfileSchema,
});

export const symptomOptions = [
  "容易疲劳",
  "白天犯困",
  "入睡困难",
  "夜间易醒",
  "熬夜后不适",
  "饮酒后疲惫",
  "换季易不适",
  "恢复变慢",
  "压力大",
  "焦虑紧绷",
  "情绪波动",
  "男性精力状态下降",
] as const;

export const durationOptions = [
  "不到1周",
  "1到4周",
  "1到3个月",
  "超过3个月",
] as const;

export const sleepOptions = [
  "规律，基本能睡够",
  "偶尔晚睡或睡不沉",
  "经常熬夜或睡眠不足",
] as const;

export const exerciseOptions = [
  "几乎不运动",
  "每周1到2次",
  "每周3次以上",
] as const;

export const goalOptions = [
  "改善白天精力",
  "改善睡眠质量",
  "减少熬夜和应酬后的不适",
  "提升换季防护状态",
  "缓解压力并稳定状态",
  "做一份男性健康方向评估",
] as const;
