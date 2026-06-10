import type { RoutedSolutionType, SolutionSlug } from "@/lib/health/mappings";
import { normalizeSolutionSlug } from "@/lib/health/mappings";

export interface SolutionGuide {
  slug: SolutionSlug;
  solutionType: RoutedSolutionType;
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  metaDescription: string;
  assessmentIntro: string;
  commonSymptoms: string[];
  commonCauses: string[];
  seekCareSignals: string[];
  baselinePlan: string[];
  supplementDirections: string[];
  otcDirections: string[];
  // 阶段2.3：产品详情扩展字段
  /** 产品定位一句话（用于产品卡） */
  productTagline?: string;
  /** 主要功效成分 */
  keyIngredients?: string[];
  /** 建议服用周期 */
  usageCycle?: string;
  /** 目标用户性别 */
  targetGender?: 'male' | 'female' | 'unisex';
  /** 服用注意事项（不含医嘱警告，警告在 otcDirections/seekCareSignals） */
  notes?: string[];
  /** 关联产品名称列表（对应 storeName，用于 /shop 跳转） */
  relatedProducts?: string[];
  /** 产品详情页路径（如有独立产品页） */
  productDetailHref?: string;
  // 阶段2.3：产品详情页信任体系
  /** 用户评分 */
  rating?: { score: number; reviewCount: number };
  /** 成分说明表格 */
  ingredients?: { name: string; dosage: string; effect: string; source: string }[];
  /** 荣旺方案 vs 普通方案对比 */
  comparison?: { our: string; normal: string }[];
  // 阶段2.2：场景页产品详情升级
  /** 适合人群标签 */
  targetAudience?: string[];
  /** 男女配方差异 */
  genderFormula?: { male: string[]; female: string[] };
  /** 组合推荐 */
  comboRecommendation?: { title: string; items: string[]; note: string }[];
}

export const solutionGuides: SolutionGuide[] = [
  {
    slug: "sleep",
    solutionType: "sleep",
    title: "睡眠支持方案",
    shortTitle: "睡眠评估",
    eyebrow: "入睡困难 / 夜间易醒 / 睡醒仍累",
    summary: "先评估作息、压力与恢复质量，再给出睡眠支持方向，而不是直接推单品。",
    metaDescription: "围绕入睡困难、夜间易醒、睡醒仍累等问题，提供 AI 睡眠评估、基础调理建议与购买入口。",
    assessmentIntro: "围绕入睡速度、夜醒频率、作息规律和压力状态，给出更稳妥的睡眠支持建议。",
    commonSymptoms: ["入睡超过 30 分钟", "半夜醒来后不易再睡", "睡醒仍疲惫", "熬夜后睡眠节律紊乱"],
    commonCauses: ["作息不规律", "精神压力高", "睡前刺激过多", "运动与恢复节奏失衡"],
    seekCareSignals: ["胸闷气促伴失眠", "长期严重情绪低落", "连续数周几乎无法入睡", "伴明显心悸、晕厥"],
    baselinePlan: ["固定起床时间", "睡前 1 小时减少蓝光和酒精", "晚间避免大强度训练", "先观察 2 到 4 周睡眠趋势"],
    supplementDirections: ["镁 / 甘氨酸镁方向", "GABA 或茶氨酸方向", "低剂量褪黑素方向"],
    otcDirections: ["如伴鼻塞、咽痛、胃部不适，请先咨询药师确认是否有影响睡眠的 OTC 选择"],
    // 阶段2.3
    rating: { score: 4.8, reviewCount: 128 },
    ingredients: [
      { name: "甘氨酸镁", dosage: "400mg/粒", effect: "支持神经放松与日常营养补充", source: "美国原料" },
      { name: "GABA", dosage: "200mg/粒", effect: "支持日常放松状态的营养补充", source: "日本发酵法" },
      { name: "茶叶茶氨酸", dosage: "100mg/粒", effect: "支持日常放松与舒缓的营养补充", source: "天然茶叶提取" },
    ],
    comparison: [
      { our: "复方配比，协同增效", normal: "单一成分，效果有限" },
      { our: "日本发酵GABA，活性高", normal: "普通化学合成GABA" },
      { our: "根据评估结果推荐剂量", normal: "自行盲目服用" },
    ],
    // 阶段2.2
    targetAudience: ["入睡困难人群", "夜间易醒人群", "睡眠质量差人群", "高压人群"],
    genderFormula: {
      male: ["建议搭配B族维生素", "加班熬夜后加倍剂量"],
      female: ["经期前后情绪波动时加量", "搭配镁缓解经期不适"],
    },
    comboRecommendation: [
      { title: "轻度睡眠困扰", items: ["甘氨酸镁 1粒/晚", "规律作息"], note: "优先调整作息，配合镁补充" },
      { title: "中度睡眠问题", items: ["甘氨酸镁 + GABA", "睡前1小时服用"], note: "需完成AI评估确认剂量" },
    ],
  },
  {
    slug: "fatigue",
    solutionType: "fatigue",
    title: "疲劳恢复方案",
    shortTitle: "疲劳评估",
    eyebrow: "白天犯困 / 精力透支 / 恢复慢",
    summary: "先判断是恢复不足、节律紊乱，还是应酬与压力叠加，再给出精力支持方向。",
    metaDescription: "围绕白天犯困、精力透支、恢复慢等问题，提供 AI 疲劳评估、调理方向和购买入口。",
    assessmentIntro: "结合白天精力、睡眠债、应酬频率和运动水平，评估更适合你的恢复方向。",
    commonSymptoms: ["午后明显犯困", "工作后恢复慢", "睡够也提不起劲", "熬夜或应酬后状态下滑明显"],
    commonCauses: ["睡眠债积累", "高压力输出", "运动不足", "营养摄入结构单一"],
    seekCareSignals: ["疲劳伴胸痛胸闷", "疲劳伴持续发热或体重骤降", "明显心悸、气短", "近期症状快速加重"],
    baselinePlan: ["先补足睡眠时长", "减少连续应酬和熬夜", "白天安排轻强度活动", "记录一周精力波动"],
    supplementDirections: ["B 族维生素方向", "辅酶 Q10 方向", "Omega-3 或恢复支持方向"],
    otcDirections: ["若伴头痛、胃部不适或感冒样症状，先咨询药师，不建议长期依赖提神类产品"],
    // 阶段2.3
    rating: { score: 4.7, reviewCount: 96 },
    ingredients: [
      { name: "B族维生素", dosage: "复合配方", effect: "支持日常能量代谢与营养补充", source: "酵母提取" },
      { name: "辅酶Q10", dosage: "100mg/粒", effect: "支持细胞能量代谢与日常营养", source: "日本发酵法" },
      { name: "Omega-3", dosage: "EPA+DHA 1000mg", effect: "支持日常抗氧化的营养补充", source: "深海小鱼" },
    ],
    comparison: [
      { our: "复合B族协同增效", normal: "单一B1/B2效果弱" },
      { our: "辅酶Q10高生物活性", normal: "普通氧化型辅酶Q10" },
      { our: "Omega-3纯净无污染", normal: "廉价鱼油可能氧化" },
    ],
    // 阶段2.2
    targetAudience: ["高强度工作者", "熬夜应酬人群", "运动恢复者", "慢性疲劳人群"],
    genderFormula: {
      male: ["搭配辅酶Q10增强精力", "运动后加倍B族摄入"],
      female: ["经期后补铁+辅酶Q10", "搭配维生素C促进吸收"],
    },
    comboRecommendation: [
      { title: "轻度疲劳", items: ["B族维生素 1粒/晨", "保证睡眠"], note: "先补足睡眠是最重要的" },
      { title: "中度疲劳", items: ["辅酶Q10 + B族", "Omega-3随餐"], note: "需完成AI评估确认方案" },
    ],
  },
  {
    slug: "liver",
    solutionType: "liver",
    title: "肝脏支持方案",
    shortTitle: "肝脏评估",
    eyebrow: "熬夜应酬 / 饮酒后不适 / 恢复拖慢",
    summary: "把应酬、饮酒、熬夜后的恢复支持放到前面，先做风险分层，再看调理方向。",
    metaDescription: "围绕应酬、熬夜、饮酒后不适等问题，提供 AI 肝脏支持评估、生活建议与购买入口。",
    assessmentIntro: "围绕饮酒频率、熬夜情况、恢复速度和当前不适，提供更谨慎的支持方向。",
    commonSymptoms: ["饮酒后疲惫明显", "熬夜后恢复慢", "应酬后第二天状态差", "长期生活节律紊乱"],
    commonCauses: ["酒精负担", "睡眠不足", "持续高压输出", "恢复窗口不足"],
    seekCareSignals: ["黑便或呕血", "持续高热", "明显黄疸、意识异常", "腹痛剧烈并加重"],
    baselinePlan: ["先减少连续饮酒", "把睡眠恢复放到优先级第一", "多饮水并规律进食", "高风险信号优先就医"],
    supplementDirections: ["肝脏恢复支持方向", "抗氧化恢复方向", "饮酒后恢复方向"],
    otcDirections: ["如伴消化道不适、发热或明显疼痛，请先咨询医生或药师，不建议自行叠加多种产品"],
    // 阶段2.3
    rating: { score: 4.9, reviewCount: 84 },
    ingredients: [
      { name: "水飞蓟宾", dosage: "200mg/粒", effect: "支持肝脏日常营养与抗氧化营养补充", source: "德国进口原料" },
      { name: "N-乙酰半胱氨酸", dosage: "600mg/粒", effect: "支持肝脏代谢与日常营养补充", source: "美国原料" },
      { name: "硫辛酸", dosage: "300mg/粒", effect: "支持日常抗氧化与能量代谢", source: "日本发酵法" },
    ],
    comparison: [
      { our: "水飞蓟宾标准化提取物", normal: "劣质水飞蓟素含量不清" },
      { our: "NAC高剂量配方", normal: "普通奶蓟草片效果弱" },
      { our: "根据饮酒频率定制方案", normal: "不问饮酒习惯直接推" },
    ],
    // 阶段2.2
    targetAudience: ["经常应酬人群", "熬夜加班人群", "长期饮酒人群", "肝功能异常人群"],
    genderFormula: {
      male: ["经常饮酒者加强版方案", "搭配复合维生素B族"],
      female: ["熬夜后加倍NAC剂量", "搭配维生素C促进恢复"],
    },
    comboRecommendation: [
      { title: "偶尔应酬", items: ["水飞蓟宾 1粒/日", "饮酒后加倍"], note: "应急型支持" },
      { title: "频繁应酬", items: ["水飞蓟宾 + NAC", "配合规律作息"], note: "需完成AI评估确认方案" },
    ],
  },
  {
    slug: "immune",
    solutionType: "immune",
    title: "免疫支持方案",
    shortTitle: "免疫评估",
    eyebrow: "换季易感冒 / 恢复慢 / 防护状态差",
    summary: "先看作息、压力和活动量，再判断是日常支持还是需要及时线下排查。",
    metaDescription: "围绕换季易感冒、恢复慢、防护状态差等问题，提供 AI 免疫支持评估与购买入口。",
    assessmentIntro: "围绕作息、运动、恢复速度与近期症状，评估更适合你的日常支持方向。",
    commonSymptoms: ["换季时容易不适", "小问题恢复慢", "连续忙碌后容易倒下", "经常感觉状态虚弱"],
    commonCauses: ["睡眠不足", "活动量低", "压力高", "恢复周期不够"],
    seekCareSignals: ["持续高热", "呼吸困难", "咳血或黑便", "症状持续且明显加重"],
    baselinePlan: ["补足睡眠", "保持每周稳定活动量", "避免压力和熬夜双重叠加", "观察 2 到 4 周恢复趋势"],
    supplementDirections: ["维生素 D3 / K2 方向", "维生素 C 方向", "益生菌方向"],
    otcDirections: ["如已有感冒、过敏或呼吸道不适，先向药师确认是否适合 OTC 辅助处理"],
    // 阶段2.3
    rating: { score: 4.6, reviewCount: 72 },
    ingredients: [
      { name: "维生素D3", dosage: "2000IU/滴", effect: "支持骨骼与日常营养的维生素补充", source: "羊毛脂提取" },
      { name: "维生素K2", dosage: "100mcg/粒", effect: "支持骨骼钙代谢的日常营养补充", source: "日本纳豆提取" },
      { name: "益生菌", dosage: "100亿CFU/粒", effect: "支持肠道日常微生态平衡", source: "丹麦菌株" },
    ],
    comparison: [
      { our: "D3+K2黄金配比", normal: "单独D3不搭配K2" },
      { our: "高活性益生菌菌株", normal: "普通益生菌活性低" },
      { our: "根据季节和体质推荐", normal: "全年统一配方" },
    ],
    // 阶段2.2
    targetAudience: ["换季易感人群", "免疫力低下人群", "慢性病患者", "老年人群"],
    genderFormula: {
      male: ["搭配锌增强免疫", "运动后补充维生素C"],
      female: ["经期后补充铁+D3", "孕期需咨询医生后使用"],
    },
    comboRecommendation: [
      { title: "日常免疫维持", items: ["D3+K2 1粒/日", "每周运动3次"], note: "基础免疫支持" },
      { title: "季节交替期", items: ["D3+K2 + 益生菌", "配合充足睡眠"], note: "需完成AI评估确认方案" },
    ],
  },
  {
    slug: "female-health",
    solutionType: "female_health",
    title: "女性健康支持方案",
    shortTitle: "女性健康评估",
    eyebrow: "周期波动 / 气色疲劳 / 睡眠与情绪状态",
    summary:
      "围绕女性常见的周期节律、疲劳恢复、睡眠情绪和日常营养支持，先做风险分层，再给出谨慎的调理方向。",
    metaDescription:
      "女性健康支持方案，覆盖周期波动、疲劳恢复、睡眠情绪、气色状态等问题，提供 AI 健康评估、基础调理建议和保健品/OTC 方向。",
    assessmentIntro:
      "结合年龄、周期相关不适、疲劳恢复、睡眠、压力和用药情况，帮助判断更适合从生活方式、营养支持还是线下就医开始。",
    commonSymptoms: [
      "经期前后疲劳或状态波动",
      "睡眠不稳、情绪容易受压力影响",
      "气色、皮肤或恢复状态变差",
      "工作家庭压力下精力恢复慢",
      "更年期或周期变化带来的日常困扰",
    ],
    commonCauses: [
      "睡眠债和长期压力叠加",
      "周期节律变化影响精力与情绪",
      "饮食结构单一或铁、维生素 D 等摄入不足",
      "运动不足或恢复窗口不够",
      "正在服药、备孕、孕期或哺乳期带来的额外限制",
    ],
    seekCareSignals: [
      "异常大量出血或持续出血",
      "突发或持续剧烈腹痛、胸痛、呼吸困难",
      "疑似怀孕、孕期或哺乳期出现明显不适",
      "持续发热、晕厥、黑便或呕血",
      "情绪低落明显并出现自伤想法",
    ],
    baselinePlan: [
      "先记录 2 到 4 周的周期、睡眠、疲劳和情绪变化",
      "保证规律进食和足够蛋白质摄入",
      "把睡眠恢复和压力管理放在补充剂之前",
      "备孕、孕期、哺乳期或正在服药时先咨询医生或药师",
      "如果症状持续加重，优先线下评估而不是自行叠加产品",
    ],
    supplementDirections: [
      "铁 / 叶酸 / B 族维生素方向",
      "维生素 D / 钙镁支持方向",
      "益生菌或肠道状态支持方向",
      "睡眠恢复与压力支持方向",
    ],
    otcDirections: [
      "如涉及痛经、异常出血、疑似感染、备孕孕期或正在服药，请先咨询医生或药师，不建议自行长期使用 OTC。",
    ],
    // 阶段2.3
    rating: { score: 4.8, reviewCount: 156 },
    ingredients: [
      { name: "铁", dosage: "25mg/粒", effect: "支持日常铁营养补充，经期女性适用", source: "氨基酸螯合铁" },
      { name: "叶酸", dosage: "400mcg/粒", effect: "支持细胞代谢的日常营养素", source: "甲基叶酸" },
      { name: "维生素B族", dosage: "复合配方", effect: "支持日常能量代谢与营养均衡", source: "酵母提取" },
      { name: "维生素D3", dosage: "1000IU/粒", effect: "支持骨骼与钙代谢的日常营养", source: "羊毛脂提取" },
    ],
    comparison: [
      { our: "氨基酸螯合铁吸收率高", normal: "普通铁剂刺激胃肠道" },
      { our: "甲基叶酸无需代谢转化", normal: "普通叶酸代谢率低" },
      { our: "复合配方协同增效", normal: "单一成分效果有限" },
    ],
    // 阶段2.2
    targetAudience: ["经期不规律人群", "痛经人群", "备孕/孕期人群", "气血不足人群"],
    genderFormula: {
      male: ["不适用本方案", "建议选择男性健康方案"],
      female: ["经期后加强铁摄入", "经前一周开始补充B族"],
    },
    comboRecommendation: [
      { title: "日常维护", items: ["铁 + B族 1粒/日", "规律作息"], note: "经期后补铁最重要" },
      { title: "备孕期", items: ["叶酸 + 铁 + D3", "配合体检"], note: "需完成AI评估确认方案" },
    ],
  },
  {
    slug: "male-health",
    solutionType: "male_health",
    title: "男性健康支持方案",
    shortTitle: "男性健康评估",
    eyebrow: "精力状态 / 恢复效率 / 应酬压力",
    summary: "围绕男性常见的精力、压力、恢复和生活方式问题，先做分层，再决定支持方向。",
    metaDescription: "围绕男性精力、恢复、应酬与压力问题，提供 AI 男性健康支持评估与购买入口。",
    assessmentIntro: "围绕精力状态、压力、睡眠和应酬习惯，评估更适合你的男性健康支持方向。",
    commonSymptoms: ["精力状态下降", "恢复效率变慢", "熬夜后更难回到状态", "长期压力影响日常表现"],
    commonCauses: ["高压力输出", "作息失衡", "饮酒和吸烟负担", "恢复与运动节奏不稳"],
    seekCareSignals: ["胸痛、呼吸困难", "明显头晕或晕厥", "持续剧烈疼痛", "伴持续发热或出血"],
    baselinePlan: ["先稳定睡眠和起床时间", "减少连续饮酒和熬夜", "增加轻到中等强度运动", "必要时优先线下评估"],
    supplementDirections: ["精力恢复方向", "应酬后恢复方向", "压力与睡眠支持方向"],
    otcDirections: ["如涉及疼痛、泌尿或其他明显不适，请先咨询医生或药师，不建议自行推断疾病"],
    // 阶段2.3
    rating: { score: 4.7, reviewCount: 112 },
    ingredients: [
      { name: "锌", dosage: "15mg/粒", effect: "支持日常代谢与营养补充", source: "氨基酸螯合锌" },
      { name: "玛卡提取物", dosage: "500mg/粒", effect: "支持日常精力与营养补充", source: "秘鲁安第斯山脉" },
      { name: "南非醉茄", dosage: "300mg/粒", effect: "支持日常压力管理的营养补充", source: "印度阿育吠陀" },
    ],
    comparison: [
      { our: "复合男性配方协同增效", normal: "单一锌片效果单一" },
      { our: "天然适应原非合成提神", normal: "咖啡因类提神伤身" },
      { our: "根据症状评估后推荐", normal: "不问症状直接推" },
    ],
    // 阶段2.2
    targetAudience: ["精力下降人群", "应酬压力大人群", "熬夜人群", "运动表现下降人群"],
    genderFormula: {
      male: ["日常维护方案", "运动后加强玛卡"],
      female: ["不适用本方案", "建议选择女性健康方案"],
    },
    comboRecommendation: [
      { title: "轻度精力下降", items: ["锌 + 复合维生素 1粒/日", "规律作息"], note: "先改善生活习惯" },
      { title: "中度精力问题", items: ["玛卡 + 南非醉茄", "配合运动"], note: "需完成AI评估确认方案" },
    ],
  },
];

export function getSolutionGuideBySlug(slug: string) {
  const canonicalSlug = normalizeSolutionSlug(slug);
  if (!canonicalSlug) {
    return undefined;
  }

  return solutionGuides.find((guide) => guide.slug === canonicalSlug);
}

export function buildSolutionJsonLd(slug: string) {
  const allSlugs = ['sleep', 'fatigue', 'liver', 'immune', 'male-health', 'female-health'];
  if (!allSlugs.includes(slug)) return null;
  const guide = getSolutionGuideBySlug(slug);
  if (!guide) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: guide.title,
    description: guide.metaDescription,
    brand: { '@type': 'Brand', name: '荣旺健康' },
    offers: {
      '@type': 'Offer',
      url: `https://rongwang.hk/solutions/${slug}`,
      availability: 'https://schema.org/InStock',
    },
  };
}

export {
  canonicalSolutionSlugs,
  normalizeSolutionSlug,
  solutionTypeToSlug,
  type SolutionSlug,
} from "@/lib/health/mappings";
