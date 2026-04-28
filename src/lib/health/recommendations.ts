import { products, type Product } from "@/data/products";
import { solutionTypeToSlug } from "@/lib/health/mappings";
import type { HealthConsultationResult, SolutionType } from "@/schemas/ai-result";
import type { HealthProfile } from "@/schemas/health";

export const solutionPlanMap: Record<SolutionType, string[]> = {
  sleep: ["sleep", "stress"],
  fatigue: ["fatigue", "stress"],
  liver: ["liver", "immune"],
  immune: ["immune"],
  male_health: ["fatigue", "liver", "stress"],
  female_health: ["beauty", "fatigue", "sleep"],
  general: ["fatigue", "immune"],
};

export const tierWeight: Record<string, number> = {
  hero: 4,
  profit: 3,
  traffic: 2,
};

const solutionTypeLabels: Record<SolutionType, string> = {
  sleep: "睡眠支持",
  fatigue: "疲劳恢复",
  liver: "肝脏支持",
  immune: "免疫支持",
  male_health: "男性健康",
  female_health: "女性健康",
  general: "通用评估",
};

const ruleNotesBySolutionType: Record<SolutionType, string[]> = {
  sleep: [
    "优先命中 sleep / stress plans。",
    "经常熬夜时会额外抬高 sleep 方向商品分数。",
  ],
  fatigue: [
    "优先命中 fatigue / stress plans。",
    "熬夜和低活动量场景更容易把恢复型商品推到前列。",
  ],
  liver: [
    "优先命中 liver / immune plans。",
    "有饮酒习惯时会额外抬高 liver 方向商品分数。",
  ],
  immune: [
    "优先命中 immune plans。",
    "吸烟或恢复慢等场景会优先看日常防护与恢复支持。",
  ],
  male_health: [
    "优先命中 fatigue / liver / stress plans。",
    "男性且处于高压作息场景时，会增强精力恢复方向商品排序。",
  ],
  female_health: [
    "优先命中 beauty / fatigue / sleep plans。",
    "女性周期、气色疲劳、睡眠情绪相关场景会优先看日常营养与恢复支持。",
  ],
  general: [
    "AI 未识别出明确主方向时，回到 fatigue / immune 的基础支持规则。",
    "仍然受 urgent 风险禁购约束。",
  ],
};

export interface RecommendationRulePreviewItem {
  productSlug: string;
  name: string;
  brand: string;
  tier: string;
  memberPrice: number;
  plans: Product["plans"];
  score: number;
}

export interface RecommendationRulePreview {
  solutionType: SolutionType;
  label: string;
  solutionSlug: string;
  targetPlans: string[];
  notes: string[];
  previewProfileSummary: string[];
  candidates: RecommendationRulePreviewItem[];
}

export interface ProductRecommendation {
  id: string;
  productSlug: string;
  name: string;
  brand: string;
  price: number;
  image: string | null;
  tagline: string;
  reason: string;
  destinationUrl: string;
  isExternal: boolean;
}

function buildReason(product: Product, solutionType: SolutionType, profile: HealthProfile) {
  if (solutionType === "liver" && profile.lifestyle.alcohol) {
    return "这款方向更贴近应酬、饮酒与恢复周期拉长的场景。";
  }

  if (solutionType === "sleep") {
    return "这款方向更贴近睡眠恢复、夜间稳定和晚间放松需求。";
  }

  if (solutionType === "immune") {
    return "这款方向更贴近日常防护、恢复支持和换季阶段的基础补给。";
  }

  if (solutionType === "male_health") {
    return "这款方向更贴近男性精力、恢复效率与高压作息支持。";
  }

  if (solutionType === "female_health") {
    return "这款方向更贴近女性周期节律、气色疲劳、睡眠情绪与日常营养支持场景。";
  }

  return "这款方向更贴近当前评估到的恢复与日常支持需求。";
}

function scoreProduct(product: Product, profile: HealthProfile, solutionType: SolutionType) {
  const targetPlans = solutionPlanMap[solutionType];
  let score = targetPlans.filter((plan) => product.plans.includes(plan as never)).length * 5;
  score += tierWeight[product.tier] ?? 1;

  if (profile.lifestyle.alcohol && product.plans.includes("liver" as never)) {
    score += 3;
  }

  if (profile.lifestyle.sleep.includes("经常熬夜") && product.plans.includes("sleep" as never)) {
    score += 2;
  }

  if (profile.lifestyle.smoking && product.plans.includes("immune" as never)) {
    score += 1;
  }

  if (profile.gender === "male" && solutionType === "male_health" && product.plans.includes("fatigue" as never)) {
    score += 2;
  }

  if (profile.gender === "female" && solutionType === "female_health") {
    if (product.plans.includes("beauty" as never)) {
      score += 3;
    }
    if (product.plans.includes("fatigue" as never) || product.plans.includes("sleep" as never)) {
      score += 2;
    }
  }

  return score;
}

function getProductsForSolutionTypeFromCatalog(
  catalog: Product[],
  solutionType: SolutionType,
  limit?: number,
) {
  const targetPlans = solutionPlanMap[solutionType];
  const matched = catalog.filter((product) =>
    product.plans.some((plan) => targetPlans.includes(plan)),
  );

  return typeof limit === "number" ? matched.slice(0, limit) : matched;
}

function buildPreviewProfile(solutionType: SolutionType): HealthProfile {
  if (solutionType === "sleep") {
    return {
      age: 31,
      gender: "female",
      symptoms: ["入睡困难", "夜间易醒", "熬夜后不适"],
      duration: "1 到 4 周",
      lifestyle: {
        sleep: "经常熬夜或睡眠不足",
        alcohol: false,
        smoking: false,
        exercise: "每周 1 到 2 次",
      },
      goal: "改善睡眠质量",
      medications: "",
      allergies: "",
    };
  }

  if (solutionType === "fatigue") {
    return {
      age: 34,
      gender: "female",
      symptoms: ["容易疲劳", "白天犯困", "恢复慢"],
      duration: "1 到 3 个月",
      lifestyle: {
        sleep: "经常熬夜或睡眠不足",
        alcohol: false,
        smoking: false,
        exercise: "几乎不运动",
      },
      goal: "改善白天精力",
      medications: "",
      allergies: "",
    };
  }

  if (solutionType === "liver") {
    return {
      age: 39,
      gender: "male",
      symptoms: ["饮酒后疲惫", "熬夜后不适", "恢复慢"],
      duration: "1 到 3 个月",
      lifestyle: {
        sleep: "经常熬夜或睡眠不足",
        alcohol: true,
        smoking: false,
        exercise: "每周 1 到 2 次",
      },
      goal: "减少熬夜和应酬后的不适",
      medications: "",
      allergies: "",
    };
  }

  if (solutionType === "immune") {
    return {
      age: 29,
      gender: "female",
      symptoms: ["换季易感冒", "恢复慢"],
      duration: "1 到 3 个月",
      lifestyle: {
        sleep: "偶尔晚睡或睡不沉",
        alcohol: false,
        smoking: true,
        exercise: "几乎不运动",
      },
      goal: "提升换季防护状态",
      medications: "",
      allergies: "",
    };
  }

  if (solutionType === "male_health") {
    return {
      age: 37,
      gender: "male",
      symptoms: ["男性精力状态下降", "恢复慢", "压力大"],
      duration: "1 到 3 个月",
      lifestyle: {
        sleep: "经常熬夜或睡眠不足",
        alcohol: true,
        smoking: false,
        exercise: "每周 1 到 2 次",
      },
      goal: "做一份男性健康方向评估",
      medications: "",
      allergies: "",
    };
  }

  if (solutionType === "female_health") {
    return {
      age: 34,
      gender: "female",
      symptoms: ["经期前后疲劳", "睡眠不稳", "气色状态波动"],
      duration: "1 到 3 个月",
      lifestyle: {
        sleep: "经常熬夜或睡眠不足",
        alcohol: false,
        smoking: false,
        exercise: "每周 1 到 2 次",
      },
      goal: "改善女性周期相关疲劳与日常状态",
      medications: "",
      allergies: "",
    };
  }

  return {
    age: 33,
    gender: "other",
    symptoms: ["容易疲劳", "恢复慢"],
    duration: "1 到 4 周",
    lifestyle: {
      sleep: "偶尔晚睡或睡不沉",
      alcohol: false,
      smoking: false,
      exercise: "每周 1 到 2 次",
    },
    goal: "改善白天精力",
    medications: "",
    allergies: "",
  };
}

function buildPreviewProfileSummary(profile: HealthProfile) {
  const summary = [
    `${profile.age} 岁`,
    profile.gender === "male" ? "男性" : profile.gender === "female" ? "女性" : "其他性别",
    profile.goal,
    profile.lifestyle.sleep,
    profile.lifestyle.alcohol ? "有饮酒习惯" : "无饮酒习惯",
    profile.lifestyle.smoking ? "有吸烟习惯" : "无吸烟习惯",
  ];

  return summary;
}

export function getRedirectDestination(product: Product) {
  const url = product.pddUrl || product.officialUrl || `/products/${product.slug}`;

  return {
    url,
    isExternal: url.startsWith("http://") || url.startsWith("https://"),
  };
}

export function buildProductRecommendation(
  product: Product,
  result: HealthConsultationResult,
  profile: HealthProfile,
): ProductRecommendation {
  const destination = getRedirectDestination(product);

  return {
    id: product.slug,
    productSlug: product.slug,
    name: product.name,
    brand: product.brand,
    price: product.memberPrice,
    image: product.images?.[0] ?? null,
    tagline: product.tagline,
    reason: buildReason(product, result.recommendedSolutionType, profile),
    destinationUrl: destination.url,
    isExternal: destination.isExternal,
  };
}

export function getProductsForSolutionType(solutionType: SolutionType, limit = 3) {
  return getProductsForSolutionTypeFromCatalog(products, solutionType, limit);
}

export function getRecommendationsFromCatalog(
  catalog: Product[],
  result: HealthConsultationResult,
  profile: HealthProfile,
  limit = 3,
): ProductRecommendation[] {
  if (result.riskLevel === "urgent") {
    return [];
  }

  return getProductsForSolutionTypeFromCatalog(catalog, result.recommendedSolutionType, 8)
    .sort((left, right) => scoreProduct(right, profile, result.recommendedSolutionType) - scoreProduct(left, profile, result.recommendedSolutionType))
    .slice(0, limit)
    .map((product) => buildProductRecommendation(product, result, profile));
}

export function getRecommendations(result: HealthConsultationResult, profile: HealthProfile, limit = 3): ProductRecommendation[] {
  return getRecommendationsFromCatalog(products, result, profile, limit);
}

export function findRecommendationProduct(id: string) {
  return products.find((product) => product.slug === id);
}

export function getRecommendationRulePreviews(catalog: Product[] = products, limit = 4): RecommendationRulePreview[] {
  return (Object.keys(solutionPlanMap) as SolutionType[]).map((solutionType) => {
    const previewProfile = buildPreviewProfile(solutionType);
    const candidates = getProductsForSolutionTypeFromCatalog(catalog, solutionType)
      .sort(
        (left, right) =>
          scoreProduct(right, previewProfile, solutionType) -
          scoreProduct(left, previewProfile, solutionType),
      )
      .slice(0, limit)
      .map((product) => ({
        productSlug: product.slug,
        name: product.name,
        brand: product.brand,
        tier: product.tier,
        memberPrice: product.memberPrice,
        plans: product.plans,
        score: scoreProduct(product, previewProfile, solutionType),
      }));

    return {
      solutionType,
      label: solutionTypeLabels[solutionType],
      solutionSlug: solutionTypeToSlug(solutionType),
      targetPlans: solutionPlanMap[solutionType],
      notes: ruleNotesBySolutionType[solutionType],
      previewProfileSummary: buildPreviewProfileSummary(previewProfile),
      candidates,
    };
  });
}
