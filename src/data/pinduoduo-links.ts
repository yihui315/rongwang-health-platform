/**
 * 荣旺健康 · 拼多多购买链接配置
 *
 * 使用说明：
 * 1. 登录拼多多开放平台 (open.pinduoduo.com) 获取Affiliate链接
 * 2. 或直接在拼多多店铺找到对应产品/活动页面链接
 * 3. 将下方占位链接替换为真实链接
 *
 * 链接类型优先级：
 *   - 活动/优惠券页（最高转化）
 *   - 单品页（高转化）
 *   - 店铺首页（多产品曝光）
 */

export interface PlanLink {
  /** 拼多多活动/优惠券页面（优先） */
  campaign?: string;
  /** 拼多多单品页面 */
  product?: string;
  /** 拼多多旗舰店/店铺首页 */
  store?: string;
}

export const pinduoduoLinks: Record<string, PlanLink> = {
  // ===== 三大核心矩阵 =====
  liver: {
    // TODO: 替换为真实商务护肝组合链接
    campaign: 'https://youpin.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    product: 'https://mobile.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    store: 'https://youpin.pinduoduo.com/?pid=PLACEHOLDER',
  },
  beauty: {
    // TODO: 替换为真实内调抗衰组合链接
    campaign: 'https://youpin.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    product: 'https://mobile.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    store: 'https://youpin.pinduoduo.com/?pid=PLACEHOLDER',
  },
  cardio: {
    // TODO: 替换为真实心脑调理组合链接
    campaign: 'https://youpin.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    product: 'https://mobile.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    store: 'https://youpin.pinduoduo.com/?pid=PLACEHOLDER',
  },

  // ===== 四大基础OTC引流产品 =====
  fatigue: {
    // TODO: 替换为真实抗疲劳组合链接
    campaign: 'https://youpin.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    product: 'https://mobile.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    store: 'https://youpin.pinduoduo.com/?pid=PLACEHOLDER',
  },
  sleep: {
    // TODO: 替换为真实深度睡眠组合链接
    campaign: 'https://youpin.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    product: 'https://mobile.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    store: 'https://youpin.pinduoduo.com/?pid=PLACEHOLDER',
  },
  immune: {
    // TODO: 替换为真实免疫防护组合链接
    campaign: 'https://youpin.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    product: 'https://mobile.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    store: 'https://youpin.pinduoduo.com/?pid=PLACEHOLDER',
  },
  stress: {
    // TODO: 替换为真实压力缓解组合链接
    campaign: 'https://youpin.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    product: 'https://mobile.pinduoduo.com/goods.html?goods_id=PLACEHOLDER',
    store: 'https://youpin.pinduoduo.com/?pid=PLACEHOLDER',
  },
};

/** 获取最优购买链接（优先campaign > product > store） */
export function getPurchaseLink(planSlug: string): string {
  const link = pinduoduoLinks[planSlug];
  if (!link) return '#';
  return link.campaign || link.product || link.store || '#';
}
