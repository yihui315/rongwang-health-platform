/**
 * 荣旺健康 · 拼多多购买链接配置
 *
 * 说明：自有拼多多店铺，链接格式为 mobile.yangkeduo.com 移动端 Mall 页
 * UTM 归因：追踪用户从哪个渠道（抖音/小红书/文章/方案/bundle）点击进入店铺
 * 点击流程：前端 → /api/pdd/redirect（记录UTM到DB）→ 拼多多店铺
 */

// ===== 拼多多自有店铺链接 =====
const STORE_URL = 'https://mobile.yangkeduo.com/mall_page.html?ps=Ae4rFwpBRF';

export interface PlanLink {
  /** 拼多多店铺首页链接（带 UTM 归因追踪） */
  campaign?: string;
  /** 拼多多品类/搜索链接 */
  product?: string;
  /** 拼多多店铺主页 */
  store?: string;
  /** UTM来源标识（用于归因：douyin/xiaohongshu/articles/solutions/bundle） */
  utmSource?: string;
}

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