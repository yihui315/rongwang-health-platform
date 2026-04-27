import { createAnalyticsEvent, type AnalyticsEvent } from "@/lib/analytics";
import type { AttributionContext } from "@/lib/attribution";
import { getAiConsultHrefForValue, getSolutionHrefForValue } from "@/lib/health/consult-entry";
import type { SolutionSlug } from "@/lib/health/mappings";

export type FreeToolSlug =
  | "health-check"
  | "sleep-score"
  | "fatigue-check"
  | "female-health-check"
  | "liver-lifestyle-check"
  | "immune-readiness"
  | "male-health-check";

export interface FreeToolQuestion {
  id: string;
  label: string;
  lowLabel: string;
  mediumLabel: string;
  highLabel: string;
}

export interface FreeToolScoreBand {
  id: "low" | "medium" | "care_first";
  min: number;
  max: number;
  label: string;
  description: string;
  careFirst: boolean;
}

export interface FreeHealthTool {
  slug: FreeToolSlug;
  title: string;
  shortTitle: string;
  solutionSlug: SolutionSlug | null;
  metaDescription: string;
  hero: string;
  useCase: string;
  primaryCta: {
    label: string;
    href: string;
  };
  solutionHref: string | null;
  questions: FreeToolQuestion[];
  scoreBands: FreeToolScoreBand[];
  disclaimer: string;
}

export interface FreeToolResult {
  score: number;
  band: FreeToolScoreBand;
  nextStep: string;
  primaryCta: FreeHealthTool["primaryCta"];
}

export interface FreeToolCompletionContext extends AttributionContext {
  source?: string;
}

const disclaimer = "本工具仅供健康教育和一般参考，不构成医学诊断、治疗建议或处方。若症状严重、持续或正在服药，请咨询医生或药师。";

const commonBands: FreeToolScoreBand[] = [
  {
    id: "low",
    min: 0,
    max: 3,
    label: "低关注",
    description: "当前信号相对轻，适合先从作息、饮食、压力和运动记录开始观察。",
    careFirst: false,
  },
  {
    id: "medium",
    min: 4,
    max: 6,
    label: "建议完整评估",
    description: "已有多个影响因素，建议完成 AI 健康评估，获得更结构化的风险分层和调理方向。",
    careFirst: false,
  },
  {
    id: "care_first",
    min: 7,
    max: 99,
    label: "优先谨慎处理",
    description: "信号较多或持续影响生活，建议先咨询医生或药师；同时可完成 AI 评估整理信息。",
    careFirst: true,
  },
];

function question(id: string, label: string): FreeToolQuestion {
  return {
    id,
    label,
    lowLabel: "很少或没有",
    mediumLabel: "偶尔出现",
    highLabel: "频繁或明显影响生活",
  };
}

function tool(input: Omit<FreeHealthTool, "primaryCta" | "solutionHref" | "scoreBands" | "disclaimer">): FreeHealthTool {
  return {
    ...input,
    primaryCta: {
      label: "进入完整 AI 健康评估",
      href: getAiConsultHrefForValue(input.solutionSlug),
    },
    solutionHref: input.solutionSlug ? getSolutionHrefForValue(input.solutionSlug) : "/articles",
    scoreBands: commonBands,
    disclaimer,
  };
}

const freeTools: FreeHealthTool[] = [
  tool({
    slug: "health-check",
    title: "AI 健康评估入口工具",
    shortTitle: "健康入口自测",
    solutionSlug: null,
    metaDescription: "用轻量问题快速梳理当前健康信号，再进入完整 AI 健康评估。",
    hero: "先用 1 分钟看清方向，再进入完整 AI 评估。",
    useCase: "适合还不确定自己更偏睡眠、疲劳、免疫、肝脏还是男女健康支持的人。",
    questions: [
      question("sleep", "最近睡眠是否明显影响白天状态？"),
      question("fatigue", "最近是否经常感到恢复慢或精力不足？"),
      question("stress", "压力、熬夜或应酬是否明显增加？"),
      question("duration", "这些情况是否已经持续超过两周？"),
    ],
  }),
  tool({
    slug: "sleep-score",
    title: "3 分钟睡眠风险自测",
    shortTitle: "睡眠自测",
    solutionSlug: "sleep",
    metaDescription: "快速了解入睡、夜醒、恢复感和压力因素，再进入 AI 睡眠评估。",
    hero: "把睡眠问题先分层，再决定下一步。",
    useCase: "适合入睡慢、夜醒、睡醒仍累或熬夜后恢复差的人。",
    questions: [
      question("sleep_latency", "入睡通常是否超过 30 分钟？"),
      question("night_wake", "夜间醒来后是否难以再次入睡？"),
      question("morning_fatigue", "醒来后是否仍觉得疲劳？"),
      question("stress_screen", "睡前是否常被压力、手机或工作信息打断？"),
    ],
  }),
  tool({
    slug: "fatigue-check",
    title: "疲劳恢复方向自测",
    shortTitle: "疲劳自测",
    solutionSlug: "fatigue",
    metaDescription: "快速梳理疲劳、恢复、作息和运动信号，再进入完整 AI 健康评估。",
    hero: "别急着补，先看疲劳来自哪里。",
    useCase: "适合白天犯困、恢复慢、精力波动或长期高压输出的人。",
    questions: [
      question("daytime_energy", "白天精力是否经常下滑？"),
      question("recovery", "工作或运动后是否恢复很慢？"),
      question("routine", "作息是否经常不稳定？"),
      question("nutrition", "饮食是否经常不规律或结构单一？"),
    ],
  }),
  tool({
    slug: "female-health-check",
    title: "女性健康支持自测",
    shortTitle: "女性健康自测",
    solutionSlug: "female-health",
    metaDescription: "围绕周期、疲劳、睡眠、情绪和压力做轻量自测，再进入完整 AI 女性健康评估。",
    hero: "把周期、疲劳和压力信号先梳理清楚。",
    useCase: "适合关注周期波动、经前后疲劳、睡眠情绪和日常营养支持的女性。",
    questions: [
      question("cycle", "周期前后状态是否明显波动？"),
      question("fatigue", "经前后或压力期是否更容易疲劳？"),
      question("sleep_mood", "睡眠和情绪是否容易受压力影响？"),
      question("special_state", "是否处于备孕、孕期、哺乳期或正在服药？"),
    ],
  }),
  tool({
    slug: "liver-lifestyle-check",
    title: "熬夜饮酒生活方式自测",
    shortTitle: "肝脏支持自测",
    solutionSlug: "liver",
    metaDescription: "快速梳理熬夜、饮酒、应酬和恢复信号，再进入 AI 肝脏支持评估。",
    hero: "先看生活方式负担，再看支持方向。",
    useCase: "适合经常熬夜、应酬、饮酒后恢复慢或生活节律紊乱的人。",
    questions: [
      question("alcohol", "近期饮酒或应酬频率是否增加？"),
      question("late_night", "是否经常熬夜或睡眠不足？"),
      question("recovery", "饮酒或熬夜后第二天是否明显不适？"),
      question("digestive", "是否伴随胃肠不适、发热、黑便或明显疼痛？"),
    ],
  }),
  tool({
    slug: "immune-readiness",
    title: "免疫支持准备度自测",
    shortTitle: "免疫自测",
    solutionSlug: "immune",
    metaDescription: "快速了解作息、恢复、活动和近期不适信号，再进入 AI 免疫支持评估。",
    hero: "先稳住基础，再看日常防护支持。",
    useCase: "适合换季易不适、恢复慢、压力大或活动不足的人。",
    questions: [
      question("sleep", "最近睡眠是否不足或不稳定？"),
      question("activity", "每周规律活动是否不足？"),
      question("recovery", "小不适后恢复是否比以前慢？"),
      question("red_flags", "是否有持续高烧、呼吸困难或明显加重？"),
    ],
  }),
  tool({
    slug: "male-health-check",
    title: "男性精力恢复自测",
    shortTitle: "男性健康自测",
    solutionSlug: "male-health",
    metaDescription: "快速梳理精力、压力、睡眠和应酬信号，再进入完整 AI 男性健康评估。",
    hero: "先看精力和恢复节奏，再决定支持方向。",
    useCase: "适合关注精力状态、应酬压力、睡眠和恢复效率的男性。",
    questions: [
      question("energy", "最近精力状态是否明显下降？"),
      question("stress", "工作压力或应酬是否持续偏高？"),
      question("sleep", "睡眠不足是否影响第二天表现？"),
      question("habits", "饮酒、吸烟或久坐是否较多？"),
    ],
  }),
];

export const freeToolSlugs = freeTools.map((item) => item.slug);

export function listFreeTools() {
  return freeTools;
}

export function getFreeToolBySlug(slug: string) {
  return freeTools.find((item) => item.slug === slug);
}

export function calculateFreeToolResult(
  tool: FreeHealthTool,
  answers: Record<string, number | undefined>,
): FreeToolResult {
  const score = tool.questions.reduce((total, item) => {
    const value = answers[item.id] ?? 0;
    return total + Math.min(Math.max(value, 0), 2);
  }, 0);
  const band = tool.scoreBands.find((item) => score >= item.min && score <= item.max) ?? tool.scoreBands[0];
  const nextStep = band.careFirst
    ? "如果症状严重、持续或伴随高风险信号，请先咨询医生或药师；也可以用 AI 评估整理症状和生活方式信息。"
    : "建议继续完成完整 AI 评估，获得风险等级、生活方式建议和适合的健康教育方向。";

  return {
    score,
    band,
    nextStep,
    primaryCta: tool.primaryCta,
  };
}

export function buildFreeToolCompletionEvent(
  tool: FreeHealthTool,
  result: FreeToolResult,
  context: FreeToolCompletionContext = {},
): AnalyticsEvent {
  return createAnalyticsEvent({
    name: "tool_completed",
    source: context.source ?? "free-tool",
    sessionId: context.sessionId,
    solutionSlug: tool.solutionSlug ?? undefined,
    metadata: {
      toolSlug: tool.slug,
      score: result.score,
      scoreBand: result.band.id,
      careFirst: result.band.careFirst,
      primaryCtaHref: result.primaryCta.href,
      ref: context.ref,
      utm: context.utm,
    },
  });
}
