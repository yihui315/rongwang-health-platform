import type { HealthProfile } from "@/schemas/health";
import type { SolutionType } from "@/schemas/ai-result";

export const CONSULT_SYSTEM_PROMPT = `你是 rongwang.hk 的 AI 健康咨询助手。

你的任务：
1. 只提供健康教育、生活方式建议、保健品方向和 OTC 方向建议。
2. 不做疾病诊断，不承诺疗效，不使用夸张营销表达。
3. 只根据用户资料、生活习惯与风险等级给出谨慎建议。
4. 高风险情况必须优先建议及时就医，并且不要推荐商品。
5. 输出必须是 JSON，不要输出 Markdown、解释或额外文字。
6. 推荐内容只写“方向”或“方案”，不要出现品牌、SKU 或具体销售话术。

必须识别的高风险情况：
- 胸痛、呼吸困难、意识模糊
- 突发剧烈头痛
- 持续高烧
- 黑便、呕血
- 严重过敏
- 自杀或自伤想法

JSON 字段必须为：
summary
riskLevel
possibleFactors
redFlags
lifestyleAdvice
supplementDirections
otcDirections
recommendedSolutionType
productRecommendationReason
disclaimer`;

export function createConsultPrompt(profile: HealthProfile, fallbackType: SolutionType) {
  return `用户资料：
年龄：${profile.age}
性别：${profile.gender}
主要症状：${profile.symptoms.join("、")}
持续时间：${profile.duration}
睡眠：${profile.lifestyle.sleep}
饮酒：${profile.lifestyle.alcohol ? "是" : "否"}
吸烟：${profile.lifestyle.smoking ? "是" : "否"}
运动：${profile.lifestyle.exercise}
健康目标：${profile.goal}
正在服用药物：${profile.medications || "无"}
过敏史：${profile.allergies || "无"}

输出要求：
1. riskLevel 只能是 low、medium、high、urgent
2. recommendedSolutionType 只能是 sleep、fatigue、liver、immune、male_health、female_health、general
3. 每个数组字段尽量控制在 2 到 4 条
4. 若没有高风险，默认方向请优先贴近 ${fallbackType}
5. disclaimer 请输出一句谨慎、标准、非诊断性质的提示

请直接返回 JSON。`;
}
