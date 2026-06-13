/**
 * 荣旺健康 · 拼多多购买链接配置
 *
 * 使用说明：
 * 1. 登录拼多多联盟 (pub.pinduoduo.com) 获取商品推广链接
 * 2. 推广链接格式：https://apivincible.pinduoduo.com/...?__dp_pid=XXXX&duoduo_type=XX
 * 3. 将真实推广链接替换下方 PLACEHOLDER_CPS 字段
 *
 * 链接优先级：campaign(CPS推广页) > product(单品) > store(店铺)
 * 每次点击自动记录到 /api/pdd/click 并附加 UTM 归因参数
 */

// ===== CPS 联盟配置 =====
// TODO: 替换为真实拼多多联盟推广链接 (pub.pinduoduo.com)
// 格式: https://apivincible.pinduoduo.com/...?__dp_pid=XXXXX&duoduo_type=2&...
// 开通MCN: 拼多多开放平台 → 联盟 → MCN管理 → 申请入驻
const CPS_AFFILIATE_PREFIX = 'https://apivincible.pinduoduo.com';

export interface PlanLink {
  /** 拼多多CPS推广链接（佣金追踪，需从pub.pinduoduo.com获取） */
  campaign?: string;
  /** 拼多多单品推广链接 */
  product?: string;
  /** 拼多多旗舰店/店铺首页 */
  store?: string;
  /** UTM来源标识（用于归因：douyin/xiaohongshu/articles/solutions/bundle） */
  utmSource?: string;
}

const STORE_URL = 'https://mobile.yangkeduo.com/mall_page.html?mall_id=516573367';

// ===== UTM 归因参数 =====
export type UtmChannel = 'douyin' | 'xiaohongshu' | 'articles' | 'solutions' | 'bundle' | 'shop' | 'direct';

/** 生成带UTM参数的追踪链接 */
export function withUtm(url: string, channel: UtmChannel, planSlug: string): string {
  const base = new URL(url, 'https://rongwang.hk');
  base.searchParams.set('utm_source', channel);
  base.searchParams.set('utm_medium', 'affiliate');
  base.searchParams.set('utm_campaign', planSlug);
  base.searchParams.set('ref', 'rw');
  return base.toString();
}

/** 获取点击追踪URL（先记录到DB，再重定向到目标） */
export function getTrackedUrl(planSlug: string, channel: UtmChannel = 'direct'): string {
  const target = getPurchaseLink(planSlug);
  const tracked = withUtm(target, channel, planSlug);
  // 通过服务端API记录点击，再重定向
  // 前端实际使用：/api/pdd/redirect?url=Base64(tracked)
  return `/api/pdd/redirect?url=${Buffer.from(tracked).toString('base64')}&plan=${planSlug}&ch=${channel}`;
}

export const pinduoduoLinks: Record<string, PlanLink> = {
  // ===== 三大核心矩阵 =====
  liver: {
    // 护肝 = NADH解酒片 + 奶蓟草组合
    // TODO: 替换为真实CPS推广链接
    campaign: `${STORE_URL}&search_key=护肝`,
    product: `${STORE_URL}&search_key=NADH`,
    store: STORE_URL,
    utmSource: 'solutions',
  },
  beauty: {
    // 美容抗衰 = 胶原蛋白 + AKK菌 + NMN
    campaign: `${STORE_URL}&search_key=胶原蛋白`,
    product: `${STORE_URL}&search_key=NMN`,
    store: STORE_URL,
    utmSource: 'solutions',
  },
  cardio: {
    // 心脑调理 = 辅酶Q10 + Omega3
    campaign: `${STORE_URL}&search_key=辅酶Q10`,
    product: `${STORE_URL}&search_key=辅酶Q10`,
    store: STORE_URL,
    utmSource: 'bundle',
  },

  // ===== 四大基础OTC引流产品 =====
  fatigue: {
    // 抗疲劳 = NADH + 维生素B族
    campaign: `${STORE_URL}&search_key=NADH`,
    product: `${STORE_URL}&search_key=维生素B`,
    store: STORE_URL,
    utmSource: 'solutions',
  },
  sleep: {
    // 睡眠支持 = 甘氨酸镁 + GABA + 褪黑素
    campaign: `${STORE_URL}&search_key=睡眠`,
    product: `${STORE_URL}&search_key=褪黑素`,
    store: STORE_URL,
    utmSource: 'solutions',
  },
  immune: {
    // 免疫防护 = 维生素D3 + K2
    campaign: `${STORE_URL}&search_key=维生素D3`,
    product: `${STORE_URL}&search_key=维生素D3`,
    store: STORE_URL,
    utmSource: 'solutions',
  },
  stress: {
    // 压力缓解 = 镁元素 + L-茶氨酸
    campaign: `${STORE_URL}&search_key=镁`,
    product: `${STORE_URL}&search_key=茶氨酸`,
    store: STORE_URL,
    utmSource: 'solutions',
  },
};

/** 获取最优购买链接（优先campaign > product > store） */
export function getPurchaseLink(planSlug: string): string {
  const link = pinduoduoLinks[planSlug];
  if (!link) return STORE_URL;
  return link.campaign || link.product || link.store || STORE_URL;
}

/** 获取带UTM的购买链接（用于前端直接跳转，不过滤重定向） */
export function getUtmPurchaseLink(planSlug: string, channel: UtmChannel = 'direct'): string {
  const base = getPurchaseLink(planSlug);
  return withUtm(base, channel, planSlug);
}