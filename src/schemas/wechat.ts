import { z } from "zod";

export const wechatOrderStatusValues = [
  "pending_payment",
  "paid",
  "cancelled",
  "refund_pending",
  "refunded",
  "closed",
] as const;

export const wechatPaymentStatusValues = [
  "unpaid",
  "prepay_created",
  "paid",
  "failed",
  "refunding",
  "refunded",
] as const;

export const wechatFulfillmentStatusValues = [
  "unfulfilled",
  "fulfilling",
  "shipped",
  "delivered",
  "after_sales",
] as const;

export const wechatMiniProgramLoginSchema = z.object({
  code: z.string().min(1).max(256),
  profile: z
    .object({
      nickname: z.string().max(80).optional(),
      avatarUrl: z.string().url().optional(),
    })
    .optional(),
});

export const wechatMiniProgramOrderItemSchema = z.object({
  slug: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const wechatMiniProgramOrderSchema = z.object({
  openId: z.string().min(1).max(128),
  items: z.array(wechatMiniProgramOrderItemSchema).min(1).max(50),
  customer: z.object({
    name: z.string().min(1).max(80),
    phone: z.string().min(3).max(40),
  }).passthrough(),
});

export const wechatPayPrepaySchema = z.object({
  orderNo: z.string().min(1).max(80),
  openId: z.string().min(1).max(128),
});

export type WechatMiniProgramOrder = z.infer<typeof wechatMiniProgramOrderSchema>;
