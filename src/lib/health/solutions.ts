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
  },
];

export function getSolutionGuideBySlug(slug: string) {
  const canonicalSlug = normalizeSolutionSlug(slug);
  if (!canonicalSlug) {
    return undefined;
  }

  return solutionGuides.find((guide) => guide.slug === canonicalSlug);
}

export { canonicalSolutionSlugs, normalizeSolutionSlug, solutionTypeToSlug } from "@/lib/health/mappings";
