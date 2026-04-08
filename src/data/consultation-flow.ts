/**
 * 专业健康问询流程定义
 *
 * 遵循医学问诊的 OPQRST + SAMPLE 框架简化版：
 * 1. 基本信息收集（年龄、性别）
 * 2. 主诉症状（主要健康关注点）
 * 3. 生活方式评估（睡眠、运动、饮食、压力）
 * 4. 风险与病史补充（慢病、用药、过敏）
 * 5. 综合评估（基于收集的信息生成分析）
 * 6. 个性化推荐（产品方案 + 生活方式建议）
 */

import type { ConsultationPhase, UserProfile } from "@/types/chat";

/** 咨询阶段配置 */
export interface PhaseConfig {
  id: ConsultationPhase;
  label: string;
  icon: string;
  description: string;
}

/** 咨询阶段列表（按流程顺序） */
export const consultationPhases: PhaseConfig[] = [
  {
    id: "welcome",
    label: "开始咨询",
    icon: "👋",
    description: "欢迎来到荣旺健康AI咨询",
  },
  {
    id: "basic-info",
    label: "基本信息",
    icon: "📋",
    description: "了解您的年龄和性别",
  },
  {
    id: "symptoms",
    label: "健康关注",
    icon: "🩺",
    description: "了解您最关心的健康问题",
  },
  {
    id: "lifestyle",
    label: "生活方式",
    icon: "🏃",
    description: "了解您的日常习惯",
  },
  {
    id: "history",
    label: "病史补充",
    icon: "🧾",
    description: "了解慢病史、用药和注意事项",
  },
  {
    id: "assessment",
    label: "综合评估",
    icon: "📊",
    description: "基于您的信息进行专业分析",
  },
  {
    id: "recommendation",
    label: "方案推荐",
    icon: "💊",
    description: "为您定制健康方案",
  },
];

/** 问询阶段的提示消息 */
export const phaseMessages: Record<ConsultationPhase, string> = {
  welcome:
    "👋 您好！欢迎来到荣旺健康AI咨询。\n\n为了给您提供更专业、更有针对性的健康建议，我需要先了解一下您的基本情况。整个过程大约需要2-3分钟。\n\n准备好了吗？请点击「开始健康咨询」或直接告诉我您的健康问题。",
  "basic-info":
    "📋 首先，请告诉我您的年龄范围：",
  symptoms:
    "🩺 了解了！接下来请告诉我，您目前最关心的健康问题是什么？\n（可以选择多个）",
  lifestyle:
    "🏃 感谢分享！为了更全面地了解您的情况，请告诉我：\n\n**您的睡眠质量如何？**",
  history:
    "🧾 最后再补充一下：您目前是否有慢性病、长期用药或需要特别注意的健康史？",
  assessment:
    "📊 感谢您耐心地完成了所有问题！让我根据您提供的信息进行综合分析...",
  recommendation:
    "💊 根据我的分析，以下是为您定制的健康方案建议：",
};

/** 症状→产品推荐映射表 */
export const symptomToProductMap: Record<string, string[]> = {
  sleep: ["plan-sleep"],
  fatigue: ["plan-fatigue"],
  immune: ["plan-immune"],
  stress: ["plan-stress"],
  "anti-aging": ["plan-antiaging"],
  bone: ["plan-family"],
  cardio: ["plan-family"],
  eye: ["plan-family"],
  digestive: ["plan-family"],
  brain: ["plan-antiaging"],
};

export const concernLabels: Record<string, string> = {
  sleep: "睡眠问题",
  fatigue: "疲劳乏力",
  immune: "免疫力低",
  stress: "压力焦虑",
  bone: "骨骼关节",
  cardio: "心血管",
  eye: "眼睛干涩",
  digestive: "消化不适",
  "anti-aging": "抗衰老",
  brain: "记忆力下降",
};

export const lifestyleLabels = {
  sleepQuality: {
    good: "睡眠良好",
    fair: "偶尔失眠",
    poor: "经常失眠",
    "very-poor": "严重失眠",
  },
  exerciseLevel: {
    sedentary: "久坐少动",
    light: "偶尔运动",
    moderate: "规律运动",
    active: "高频运动",
  },
  stressLevel: {
    low: "压力较小",
    medium: "压力一般",
    high: "压力较大",
    "very-high": "压力很大",
  },
} as const;

/**
 * 根据用户画像生成综合评估文本
 */
export function generateAssessment(profile: UserProfile): string {
  const parts: string[] = [];

  parts.push("📊 **您的健康画像分析**\n");

  // 年龄相关建议
  if (profile.ageRange) {
    const ageAdvice: Record<string, string> = {
      "18-30": "您处于身体机能的巅峰期，重点在于打好营养基础、管理压力和建立健康习惯。",
      "31-45": "这个阶段身体开始出现微妙变化，代谢减缓，需关注能量管理、压力调节和早期抗衰。",
      "46-60": "身体机能逐渐变化，需重点关注心血管、骨骼、认知功能和细胞活力的维护。",
      "60+": "健康养护进入关键期，骨骼、心血管、免疫力和认知功能都需要更细致的营养支持。",
    };
    parts.push(`🔹 **年龄段**：${profile.ageRange}岁\n${ageAdvice[profile.ageRange] || ""}`);
  }

  // 主要关注点
  if (profile.mainConcerns && profile.mainConcerns.length > 0) {
    const labels = profile.mainConcerns
      .map((c) => concernLabels[c] || c)
      .join("、");
    parts.push(`🔹 **主要关注**：${labels}`);
  }

  // 睡眠质量
  if (profile.sleepQuality) {
    const sleepAdvice: Record<string, string> = {
      good: "您的睡眠状况良好，继续保持！良好的睡眠是健康的基石。",
      fair: "偶尔失眠属于正常范围，注意睡眠卫生习惯，必要时可补充镁和GABA辅助。",
      poor: "⚠️ 经常性失眠需要重视。建议改善睡眠环境，考虑GABA+镁+褪黑素的组合支持。",
      "very-poor":
        "⚠️ 严重失眠可能影响多个身体系统。强烈建议在改善营养补充的同时，咨询睡眠专科医生。",
    };
    parts.push(
      `🔹 **睡眠质量**：${sleepAdvice[profile.sleepQuality] || "需进一步了解"}`
    );
  }

  // 运动水平
  if (profile.exerciseLevel) {
    const exerciseAdvice: Record<string, string> = {
      sedentary:
        "⚠️ 久坐不动会增加多种健康风险。建议从每天步行15分钟开始，逐渐增加运动量。",
      light: "偶尔运动是好的开始！建议逐渐增加到每周3-5次，每次30分钟以上。",
      moderate:
        "很好！规律运动对健康非常有益。注意运动后的营养补充和恢复。",
      active: "运动达人！注意运动中的能量消耗和营养补充，关节和肌肉的养护也很重要。",
    };
    parts.push(
      `🔹 **运动习惯**：${exerciseAdvice[profile.exerciseLevel] || "需进一步了解"}`
    );
  }

  // 压力水平
  if (profile.stressLevel) {
    const stressAdvice: Record<string, string> = {
      low: "压力管理不错！保持适度的压力有助于保持活力。",
      medium: "适度压力是正常的，注意劳逸结合，可以通过运动和冥想来调节。",
      high: "⚠️ 较高压力水平会影响睡眠、免疫和消化等多个方面。建议补充B族维生素和镁，并学习压力管理技巧。",
      "very-high":
        "⚠️ 持续高压状态对健康危害很大。除了营养支持外，强烈建议学习正念冥想，必要时寻求心理咨询帮助。",
    };
    parts.push(
      `🔹 **压力水平**：${stressAdvice[profile.stressLevel] || "需进一步了解"}`
    );
  }

  if (profile.medicalHistory) {
    parts.push(`🔹 **病史补充**：${profile.medicalHistory}`);
  }

  if (profile.redFlags && profile.redFlags.length > 0) {
    parts.push(
      `🚨 **风险提示**：检测到${profile.redFlags.join("、")}相关描述，建议优先线下就医或急诊评估。`
    );
  }

  return parts.join("\n\n");
}

/**
 * 根据用户画像生成产品推荐
 */
export function generateRecommendation(profile: UserProfile): string {
  const parts: string[] = [];
  parts.push("💊 **为您推荐的荣旺健康方案**\n");

  const recommendedPlans = new Set<string>();

  // 根据主要关注点映射产品
  if (profile.mainConcerns) {
    for (const concern of profile.mainConcerns) {
      const plans = symptomToProductMap[concern];
      if (plans) {
        plans.forEach((p) => recommendedPlans.add(p));
      }
    }
  }

  // 根据睡眠质量额外推荐
  if (
    profile.sleepQuality === "poor" ||
    profile.sleepQuality === "very-poor"
  ) {
    recommendedPlans.add("plan-sleep");
  }

  // 根据压力水平额外推荐
  if (
    profile.stressLevel === "high" ||
    profile.stressLevel === "very-high"
  ) {
    recommendedPlans.add("plan-stress");
  }

  // 年龄段特殊推荐
  if (profile.ageRange === "46-60" || profile.ageRange === "60+") {
    recommendedPlans.add("plan-antiaging");
  }

  const planDetails: Record<string, { name: string; price: number; desc: string }> = {
    "plan-fatigue": {
      name: "抗疲劳组合",
      price: 299,
      desc: "活性B族 + 螯合镁 + Omega-3",
    },
    "plan-sleep": {
      name: "深度睡眠组合",
      price: 259,
      desc: "GABA + 甘氨酸镁 + 褪黑素",
    },
    "plan-immune": {
      name: "免疫防护组合",
      price: 349,
      desc: "维C + 螯合锌 + 维D3 + 接骨木莓",
    },
    "plan-stress": {
      name: "压力缓解组合",
      price: 399,
      desc: "B族 + 镁 + 适应原草本",
    },
    "plan-antiaging": {
      name: "细胞焕活组合",
      price: 599,
      desc: "NMN + 白藜芦醇 + CoQ10 + 胶原蛋白",
    },
    "plan-family": {
      name: "家庭健康套餐",
      price: 699,
      desc: "复合维矿 + Omega-3 + 益生菌 + 维D3",
    },
  };

  if (recommendedPlans.size === 0) {
    recommendedPlans.add("plan-immune"); // 默认推荐免疫组合
  }

  let idx = 1;
  for (const planId of recommendedPlans) {
    const plan = planDetails[planId];
    if (plan) {
      parts.push(
        `**${idx}. 荣旺「${plan.name}」** — ¥${plan.price}/月\n   📦 ${plan.desc}`
      );
      idx++;
    }
  }

  parts.push(
    "\n---\n✅ 所有方案支持30天无理由退款 | 香港直邮 | 全程冷链\n💡 首次订阅享体验优惠，可随时暂停或取消\n\n您对哪个方案感兴趣？我可以为您详细介绍~"
  );

  return parts.join("\n");
}

export function buildProfileSummary(profile: UserProfile): string[] {
  const items: string[] = [];

  if (profile.ageRange) {
    items.push(`年龄段：${profile.ageRange}岁`);
  }

  if (profile.gender) {
    items.push(`性别：${profile.gender === "male" ? "男性" : profile.gender === "female" ? "女性" : profile.gender}`);
  }

  if (profile.mainConcerns?.length) {
    items.push(
      `关注重点：${profile.mainConcerns.map((item) => concernLabels[item] || item).join("、")}`
    );
  }

  if (profile.sleepQuality) {
    items.push(`睡眠：${lifestyleLabels.sleepQuality[profile.sleepQuality as keyof typeof lifestyleLabels.sleepQuality] || profile.sleepQuality}`);
  }

  if (profile.exerciseLevel) {
    items.push(`运动：${lifestyleLabels.exerciseLevel[profile.exerciseLevel as keyof typeof lifestyleLabels.exerciseLevel] || profile.exerciseLevel}`);
  }

  if (profile.stressLevel) {
    items.push(`压力：${lifestyleLabels.stressLevel[profile.stressLevel as keyof typeof lifestyleLabels.stressLevel] || profile.stressLevel}`);
  }

  if (profile.medicalHistory) {
    items.push(`病史/注意事项：${profile.medicalHistory}`);
  }

  if (profile.redFlags?.length) {
    items.push(`风险提醒：${profile.redFlags.join("、")}`);
  }

  return items;
}
