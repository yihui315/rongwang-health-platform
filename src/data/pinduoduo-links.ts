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
 *
 * 当前策略：由于尚未开通拼多多联盟账号，暂使用店铺内分类搜索链接作为过渡。
 * 后续步骤：申请拼多多联盟MCN → 获取商品推广链接 → 替换下方 PLACEHOLDER
 */

export interface PlanLink {
  /** 拼多多活动/优惠券页面（优先） */
  campaign?: string;
  /** 拼多多单品页面 */
  product?: string;
  /** 拼多多旗舰店/店铺首页 */
  store?: string;
}

const STORE_URL = 'https://mobile.yangkeduo.com/mall_page.html?mall_id=516573367';
const STORE_SEARCH = 'https://mobile.yangkeduo.com/proxy/api/search?search_src_url=&search_key=&search_id=&source=search_result&activity_id=';

export const pinduoduoLinks: Record<string, PlanLink> = {
  // ===== 三大核心矩阵 =====
  liver: {
    // 护肝 = NADH解酒片 + 奶蓟草组合
    campaign: `${STORE_URL}&search_key=护肝`,
    product: `${STORE_URL}&search_key=NADH`,
    store: STORE_URL,
  },
  beauty: {
    // 美容抗衰 = 胶原蛋白 + AKK菌 + NMN
    campaign: `${STORE_URL}&search_key=胶原蛋白`,
    product: `${STORE_URL}&search_key=NMN`,
    store: STORE_URL,
  },
  cardio: {
    // 心脑调理 = 辅酶Q10 + Omega3
    campaign: `${STORE_URL}&search_key=辅酶Q10`,
    product: `${STORE_URL}&search_key=辅酶Q10`,
    store: STORE_URL,
  },

  // ===== 四大基础OTC引流产品 =====
  fatigue: {
    // 抗疲劳 = NADH + 维生素B族
    campaign: `${STORE_URL}&search_key=NADH`,
    product: `${STORE_URL}&search_key=维生素B`,
    store: STORE_URL,
  },
  sleep: {
    // 睡眠支持 = 甘氨酸镁 + GABA + 褪黑素
    campaign: `${STORE_URL}&search_key=睡眠`,
    product: `${STORE_URL}&search_key=褪黑素`,
    store: STORE_URL,
  },
  immune: {
    // 免疫防护 = 维生素D3 + K2
    campaign: `${STORE_URL}&search_key=维生素D3`,
    product: `${STORE_URL}&search_key=维生素D3`,
    store: STORE_URL,
  },
  stress: {
    // 压力缓解 = 镁元素 + L-茶氨酸
    campaign: `${STORE_URL}&search_key=镁`,
    product: `${STORE_URL}&search_key=茶氨酸`,
    store: STORE_URL,
  },
};

/** 获取最优购买链接（优先campaign > product > store） */
export function getPurchaseLink(planSlug: string): string {
  const link = pinduoduoLinks[planSlug];
  if (!link) return STORE_URL;
  return link.campaign || link.product || link.store || STORE_URL;
}
