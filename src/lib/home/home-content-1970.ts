/**
 * 1970 Uncle Darren's 官网首页 - 静态数据
 * 产品数据来源：京东全球购旗舰店 mall.jd.hk/index-1012309692.html
 */

// ============================================================
// 品类导航
// ============================================================

export interface HealthDirection1970 {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  emoji: string;
  bgColor: string;
  tags: string[];
  featured: string; // 爆款单品名
}

export const healthDirections1970: HealthDirection1970[] = [
  {
    slug: "heart",
    title: "心臟健康",
    subtitle: "心血管 · 辅酶Q10",
    href: "/products/category/heart",
    emoji: "❤️",
    bgColor: "#fef2f2",
    tags: ["辅酶Q10", "心脏营养", "心血管"],
    featured: "高含量辅酶Q10胶囊",
  },
  {
    slug: "bone",
    title: "骨骼健康",
    subtitle: "钙片 · 软骨素",
    href: "/products/category/bone",
    emoji: "🦴",
    bgColor: "#f0fdf4",
    tags: ["钙片", "胶原蛋白", "软骨素"],
    featured: "中老年钙片复合胶囊",
  },
  {
    slug: "gut",
    title: "腸道健康",
    subtitle: "益生菌 · 消化支持",
    href: "/products/category/gut",
    emoji: "🌿",
    bgColor: "#f0f9ff",
    tags: ["益生菌", "膳食纤维", "消化支持"],
    featured: "成人复合益生菌",
  },
  {
    slug: "brain",
    title: "腦力提升",
    subtitle: "DHA · 認知營養",
    href: "/products/category/brain",
    emoji: "🧠",
    bgColor: "#faf5ff",
    tags: ["DHA藻油", "PS磷脂酰丝氨酸", "NMN"],
    featured: "DHA藻油+PS复合胶囊",
  },
];

// ============================================================
// 營養包套裝
// ============================================================

export interface BundleProduct {
  slug: string;
  name: string;
  gender: "male" | "female";
  spec: string;
  ingredients: string[];
  price: number;
  marketPrice: number;
  href: string;
  accentColor: string;
  image: string;
}

export const bundleProducts: BundleProduct[] = [
  {
    slug: "heart-male",
    name: "男士心臟健康营养包",
    gender: "male",
    spec: "28袋/盒 · 每日1袋",
    ingredients: ["辅酶Q10", "Omega3", "大蒜精", "镁"],
    price: 399,
    marketPrice: 699,
    href: "/products/bundles/heart-male",
    accentColor: "#dc2626",
    image: "/images/bundles/bundle-heart-male.jpg",
  },
  {
    slug: "heart-female",
    name: "女士心臟健康营养包",
    gender: "female",
    spec: "28袋/盒 · 每日1袋",
    ingredients: ["辅酶Q10", "胶原蛋白", "铁", "B族"],
    price: 399,
    marketPrice: 699,
    href: "/products/bundles/heart-female",
    accentColor: "#be185d",
    image: "/images/bundles/bundle-heart-female.jpg",
  },
  {
    slug: "gut-male",
    name: "男士肠胃调理营养包",
    gender: "male",
    spec: "28袋/盒 · 每日1袋",
    ingredients: ["15菌株益生菌", "益生元", "膳食纤维", "消化酶"],
    price: 349,
    marketPrice: 599,
    href: "/products/bundles/gut-male",
    accentColor: "#7c3aed",
    image: "/images/bundles/bundle-gut-male.jpg",
  },
  {
    slug: "gut-female",
    name: "女士肠胃调理营养包",
    gender: "female",
    spec: "28袋/盒 · 每日1袋",
    ingredients: ["5大菌株", "益生元", "低聚果糖", "果蔬纤维"],
    price: 349,
    marketPrice: 599,
    href: "/products/bundles/gut-female",
    accentColor: "#059669",
    image: "/images/bundles/bundle-gut-female.jpg",
  },
];

// ============================================================
// 单品热卖
// ============================================================

export interface HotProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  tags: string[];
  href: string;
  emoji: string;
  image: string;
}

export const hotSingleProducts: HotProduct[] = [
  {
    slug: "enkodaulen-heart-male",
    name: "恩科达伦男士心脏套装 辅酶Q10+Omega-3 心血管支持",
    category: "心臟健康",
    price: 299,
    originalPrice: 699,
    tags: ["恩科达伦", "心脏套装", "辅酶Q10"],
    href: "/bundles/heart-male",
    emoji: "❤️",
    image: "/images/bundles/bundle-heart-male.jpg",
  },
  {
    slug: "enkodaulen-heart-female",
    name: "恩科达伦女士心脏套装 辅酶Q10+铁元素 血红蛋白支持",
    category: "心臟健康",
    price: 299,
    originalPrice: 699,
    tags: ["恩科达伦", "心脏套装", "女士专用"],
    href: "/bundles/heart-female",
    emoji: "💖",
    image: "/images/bundles/bundle-heart-female.jpg",
  },
  {
    slug: "enkodaulen-gut-male",
    name: "恩科达伦男士肠胃套装 益生菌+消化酶 肠道健康",
    category: "腸道健康",
    price: 289,
    originalPrice: 659,
    tags: ["恩科达伦", "肠胃套装", "益生菌"],
    href: "/bundles/gut-male",
    emoji: "🌿",
    image: "/images/bundles/bundle-gut-male.jpg",
  },
  {
    slug: "enkodaulen-gut-female",
    name: "恩科达伦女士肠胃套装 益生菌+膳食纤维 女性肠道",
    category: "腸道健康",
    price: 289,
    originalPrice: 659,
    tags: ["恩科达伦", "肠胃套装", "女士专用"],
    href: "/bundles/gut-female",
    emoji: "🌸",
    image: "/images/bundles/bundle-gut-female.jpg",
  },
  {
    slug: "enkodaulen-heart-male-2",
    name: "恩科达伦男士心脏套装（加强版）双份辅酶Q10",
    category: "心臟健康",
    price: 399,
    originalPrice: 899,
    tags: ["恩科达伦", "加强版", "双份含量"],
    href: "/bundles/heart-male",
    emoji: "💪",
    image: "/images/bundles/bundle-heart-male.jpg",
  },
  {
    slug: "enkodaulen-gut-female-2",
    name: "恩科达伦女士肠胃套装（日常版）日常肠道保养",
    category: "腸道健康",
    price: 199,
    originalPrice: 499,
    tags: ["恩科达伦", "日常版", "肠道保养"],
    href: "/bundles/gut-female",
    emoji: "✨",
    image: "/images/bundles/bundle-gut-female.jpg",
  },
];

// ============================================================
// 信任徽章
// ============================================================

export const heroBadges1970 = [
  "美國原瓶進口",
  "BASF/Chemi Nutra 原料",
  "SGS 第三方檢測",
  "Darren 博士配方",
];

// ============================================================
// 用戶評價
// ============================================================

export interface Testimonial1970 {
  name: string;
  initial: string;
  meta: string;
  rating: number;
  quote: string;
  product: string;
  accent: "purple" | "green" | "blue" | "pink";
}

export const testimonials1970: Testimonial1970[] = [
  {
    name: "李先生",
    initial: "李",
    meta: "58岁 · 上海 · 长期熬夜",
    rating: 5,
    quote:
      "完成评估后更清楚自己应该关注心血管营养和日常运动管理。包装正品，有防伪码可查，整体购买流程比较清楚。",
    product: "高含量辅酶Q10胶囊",
    accent: "green",
  },
  {
    name: "王女士",
    initial: "王",
    meta: "52岁 · 北京 · 心脏健康关注",
    rating: 5,
    quote:
      "顾问提醒我先结合体检结果和医生建议，再选择营养支持方案。整体服务专业，购买渠道和售后说明都很清楚。",
    product: "女士心臟健康营养包",
    accent: "pink",
  },
  {
    name: "张先生",
    initial: "张",
    meta: "63岁 · 广州 · 骨骼关节营养",
    rating: 5,
    quote:
      "钙片吃了半年，体检后各项指标稳定。顾问服务耐心，回复及时，整体比较放心。",
    product: "中老年钙片复合胶囊",
    accent: "blue",
  },
];

// ============================================================
// 品牌故事
// ============================================================

export const brandStory1970 = {
  title: "從1970年代的一個小藥房，到美國專業營養品牌",
  description:
    "Darren 是一位在美國執業40餘年的臨床藥劑師。1970年代，他在底特律开设了自己的社區藥房，每天看到大量慢性病患者因營養不均衡而飽受折磨。他堅信：好的營養，是一切健康的根基。2003年，他将自己多年的臨床配方研究成果转化为成品，创立了 1970 Uncle Darren's 品牌——只做有效成分，不做营销溢價，让真正需要的人用得上專業營養。",
};

// ============================================================
// FAQ
// ============================================================

export interface Faq1970 {
  q: string;
  a: string;
}

export const faqs1970: Faq1970[] = [
  {
    q: "1970 Uncle Darren's 是正品吗？如何辨别真伪？",
    a:
      "每一瓶产品均贴有防伪标签，可通过官方网站或官方公众号扫码验证。产品均为美國原瓶進口，报关单、检验检疫证明齐全。下单后可在订单详情查看物流和清关进度。",
  },
  {
    q: "产品需要吃多久才能看到效果？",
    a:
      "营养补充剂不是药物，效果因人而异。一般而言，持续服用30天（一个周期）后会感受到基础变化，如精力和状态有所改善等。更明显的变化通常需要3-6个月持续服用。建议配合健康饮食和适度运动。如有具体健康问题，请优先咨询医生。",
  },
  {
    q: "产品与国内普通保健品有什么区别？",
    a:
      "主要区别在于：①原料来源——我们使用美国原料商（BASF、Chemi Nutra、IFF）；②配方标准——参照美国 FDA 膳食补充剂标准生产；③含量标注——按实际有效成分含量标注，不弄虚作假；④性价比——省去中间环节，同样品质价格低于国内同类进口品牌。",
  },
  {
    q: "可以到线下体验或咨询营养师吗？",
    a:
      "目前主要通过官网和京东旗舰店销售。我们提供在线营养师咨询服务（工作时间 9:00-21:00），可以在产品页或購物車页面发起咨询。营养师会根据你的健康情况提供个性化的产品搭配建议（不涉及诊断和治疗）。",
  },
  {
    q: "孕期/哺乳期/慢性病患者可以服用吗？",
    a:
      "以下人群服用前请务必咨询医生：孕妇、哺乳期女性、正在服用抗凝药物者、严重肝肾疾病患者、手术后恢复期患者。我们的产品为膳食补充剂，不能替代药物治疗。如有任何疑虑，请在购买前咨询医疗专业人士。",
  },
  {
    q: "如何退货或售后？",
    a:
      "收到商品后7天内（未开封）可申请退货，15天内可申请换货。开封后如出现质量问题（如包装破损、过期等），凭照片可申请全额退款。退货请通过官网「我的订单」或联系在线客服处理。跨境商品退货可能涉及税费退回，具体以客服说明为准。",
  },
];
