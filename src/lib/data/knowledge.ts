import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export type KnowledgeStatus = "draft" | "reviewed" | "retired";

export interface HealthKnowledgeEntryRecord {
  id: string;
  slug: string;
  title: string;
  category: string;
  audience: string | null;
  summary: string;
  body: string;
  evidenceLevel: string | null;
  status: KnowledgeStatus;
  redFlags: string[];
  contraindications: string[];
  tags: string[];
  sourceTitle: string | null;
  productLinks: Array<{
    productSlug: string;
    relationType: string;
    note: string | null;
  }>;
  updatedAt: string;
}

export const defaultKnowledgeSources = [
  {
    id: "source-rw-review-v1",
    title: "Rongwang reviewed health education baseline",
    sourceType: "internal_review",
    publisher: "Rongwang Health",
    citation: "Internal reviewed education copy for MVP launch.",
    status: "reviewed",
  },
] as const;

export const defaultKnowledgeEntries: HealthKnowledgeEntryRecord[] = [
  {
    id: "kb-fatigue-red-flags",
    slug: "fatigue-red-flags",
    title: "疲劳评估的就医信号",
    category: "risk_safety",
    audience: "general_adult",
    summary: "持续加重、伴随胸痛、呼吸困难、黑便、明显体重下降等情况，应优先线下就医。",
    body: "AI 评估只能做风险分层和教育提醒。出现急性胸痛、呼吸困难、晕厥、黑便、持续发热、明显体重下降或症状快速加重时，不应优先进入补充剂购买路径。",
    evidenceLevel: "clinical_safety",
    status: "reviewed",
    redFlags: ["胸痛", "呼吸困难", "晕厥", "黑便", "明显体重下降", "持续发热"],
    contraindications: [],
    tags: ["fatigue", "red_flag", "assessment"],
    sourceTitle: "Rongwang reviewed health education baseline",
    productLinks: [],
    updatedAt: new Date("2026-04-29T00:00:00.000Z").toISOString(),
  },
  {
    id: "kb-magnesium-sleep-education",
    slug: "magnesium-sleep-education",
    title: "镁与睡眠放松教育",
    category: "otc_education",
    audience: "general_adult",
    summary: "镁相关产品只能作为睡前放松和营养支持方向，不能替代失眠诊疗。",
    body: "睡眠问题需要先排查作息、压力、咖啡因、酒精和药物因素。镁类补充剂可以作为营养支持教育方向，但肾功能异常、正在使用相关药物或孕期/哺乳期人群应先咨询专业人士。",
    evidenceLevel: "education",
    status: "reviewed",
    redFlags: ["长期严重失眠", "情绪危机", "白天嗜睡影响驾驶"],
    contraindications: ["严重肾功能异常", "孕期或哺乳期未咨询医生", "正在使用需监测电解质的药物"],
    tags: ["sleep", "magnesium", "otc"],
    sourceTitle: "Rongwang reviewed health education baseline",
    productLinks: [
      {
        productSlug: "msr-nadh-tipsynox",
        relationType: "education",
        note: "仅用于睡眠方向教育解释，商品选择仍由规则库决定。",
      },
    ],
    updatedAt: new Date("2026-04-29T00:00:00.000Z").toISOString(),
  },
  {
    id: "kb-coq10-fatigue-draft",
    slug: "coq10-fatigue-draft",
    title: "CoQ10 与疲劳教育草稿",
    category: "otc_education",
    audience: "general_adult",
    summary: "草稿内容不得进入用户侧 AI 文案。",
    body: "该条目保留为审核状态测试样例。",
    evidenceLevel: "draft",
    status: "draft",
    redFlags: [],
    contraindications: [],
    tags: ["fatigue", "coq10", "draft"],
    sourceTitle: "Rongwang reviewed health education baseline",
    productLinks: [],
    updatedAt: new Date("2026-04-29T00:00:00.000Z").toISOString(),
  },
  // ═══════════════════════════════════════════════════════════════
  // 来源：nihaixia-tcm (https://github.com/JuneYaooo/nihaixia-tcm)
  // 倪海厦中医课程 — 伤寒论 / 神农本草 / 针灸精华
  // 仅作养生教育与产品知识补充，不构成医疗建议
  // ═══════════════════════════════════════════════════════════════
  {
    id: "kb-nihaixia-sleep-pattern",
    slug: "nihaixia-sleep-pattern",
    title: "中医睡眠调理：酸枣仁与心神安定",
    category: "tcm_education",
    audience: "general_adult",
    summary: "中医认为失眠与心、肝、脾、肾相关，养心安神、疏肝解郁是调理关键。倪海厦伤寒论和神农本草中对失眠有系统辨证。",
    body: "伤寒论体系将失眠分为：太阳病不得眠（表证未解）、阳明病不得眠（热扰心神）、少阴病不得眠（心肾不交）、虚劳不得眠（肝血不足）。神农本草记载：酸枣仁入心、肝经，治虚烦不眠；茯苓健脾宁心；龙骨牡蛎潜阳安神。倪海厦特别强调：失眠需先辨证是'阳不入阴'还是'阴不足'，不可盲目使用安眠药压制症状，需调养脏腑气机。",
    evidenceLevel: "education",
    status: "reviewed",
    redFlags: ["持续严重失眠超过2周", "伴随情绪危机", "白天嗜睡影响安全"],
    contraindications: ["严重抑郁症或焦虑症需寻求精神科", "孕产妇用药需医师指导"],
    tags: ["sleep", "insomnia", "tcm", "suanzaoren", "anxiety"],
    sourceTitle: "倪海厦伤寒论课程 + 神农本草课程",
    productLinks: [
      {
        productSlug: "msr-nadh-tipsynox",
        relationType: "education",
        note: "NADH提升细胞能量代谢，间接支持睡眠修复，适合压力大、代谢低人群。",
      },
    ],
    updatedAt: new Date("2026-06-01T05:30:00.000Z").toISOString(),
  },
  {
    id: "kb-nihaixia-liver-protection",
    slug: "nihaixia-liver-protection",
    title: "中医护肝：疏肝解郁与解毒机制",
    category: "tcm_education",
    audience: "general_adult",
    summary: "中医无'肝脏'器官概念，但有完整的肝系统功能体系（疏泄、藏血、调经），护肝核心在疏肝理气、活血化瘀、避免熬夜。",
    body: "倪海厦伤寒论指出：肝与胆相表里，肝主疏泄条达，情绪压力直接导致肝气郁结，表现为胸胁胀闷、口苦、眠差。'夜卧血归肝'，夜间23点-凌晨3点不睡，肝无法藏血修复，日久必伤。肝气郁结日久化火，形成口苦、烦躁、头痛。调理原则：疏肝解郁（柴胡类方）、活血化瘀（桃仁红花）、养血安神。灵芝归肝经，能补益肝气，适合长期熬夜人群日常养护。",
    evidenceLevel: "education",
    status: "reviewed",
    redFlags: ["持续右上腹疼痛", "眼白发黄", "黑便"],
    contraindications: ["已有严重肝病人群需线下就诊", "服用抗凝药者慎用活血化瘀类"],
    tags: ["liver", "tcm", "gan", "hangover", "fatigue"],
    sourceTitle: "倪海厦伤寒论 + 神农本草课程",
    productLinks: [
      {
        productSlug: "msr-nadh-tipsynox",
        relationType: "education",
        note: "NADH直接激活解酒酶ADH/ALDH，加速酒精代谢，适合商务应酬人群。",
      },
    ],
    updatedAt: new Date("2026-06-01T05:30:00.000Z").toISOString(),
  },
  {
    id: "kb-nihaixia-immunity",
    slug: "nihaixia-immunity",
    title: "中医免疫：正气与卫气的防御体系",
    category: "tcm_education",
    audience: "general_adult",
    summary: "中医'正气'相当于现代免疫概念，'卫气'是体表防御层。扶正祛邪是中医免疫调理的核心思想，倪海厦针灸课程有完整阐述。",
    body: "倪海厦针灸课程指出：卫气行于体表（太阳经），是人体第一道防线，'卫气'强则外邪不侵。正气存内，邪不可干；邪之所凑，其气必虚。提升免疫力的中医思路：健脾（脾为气血生化之源）、补肺（肺主皮毛，司卫气）、温肾（肾为先天之本）。灵芝、黄芪、人参被倪师列为'上药'，可日常服用扶正气。针灸配穴：足三里（健脾）、关元（补肾）、合谷（驱风）。换季容易感冒者，多属卫气不足、表虚证，可从补气固表方向调理。",
    evidenceLevel: "education",
    status: "reviewed",
    redFlags: ["高热不退", "呼吸困难", "反复感染伴随淋巴结肿大"],
    contraindications: ["自身免疫性疾病（红斑狼疮等）患者需先咨询医生", "器官移植后服用免疫抑制剂者禁用"],
    tags: ["immunity", "tcm", "weiqi", "defense", "seasonal"],
    sourceTitle: "倪海厦针灸课程 + 神农本草课程",
    productLinks: [
      {
        productSlug: "pst-lingzhi-spore-oil",
        relationType: "education",
        note: "灵芝三萜类化合物调节免疫细胞活性，适合体虚易感人群日常调理。",
      },
    ],
    updatedAt: new Date("2026-06-01T05:30:00.000Z").toISOString(),
  },
  {
    id: "kb-nihaixia-stress-adaptation",
    slug: "nihaixia-stress-adaptation",
    title: "中医减压：甘麦大枣汤与脏躁调理",
    category: "tcm_education",
    audience: "general_adult",
    summary: "情绪压力导致肝气郁结、心神失养。倪海厦伤寒论记载的甘麦大枣汤是调理'脏躁'代表方，甘草、小麦、大枣养心安神、柔肝缓急。",
    body: "倪海厦伤寒论详解'脏躁'：因长期情绪压力导致脏腑津液耗伤，心神失养，表现为莫名悲伤欲哭、心烦失眠、焦虑不安。甘麦大枣汤（甘草、小麦、大枣）是经典养心舒肝方，药性平和，适合长期精神紧张、压力大人群。神农本草课程指出：甘草调和诸药、补脾益气；小麦养心阴、除烦躁；大枣补气血、缓肝急。此外，倪师强调：减压需配合作息调整（早睡、适度运动），单纯服药不能根治情绪问题。肾虚不纳气也会导致慢性疲劳和情绪低落，需从肾气不足角度考虑。",
    evidenceLevel: "education",
    status: "reviewed",
    redFlags: ["出现自杀念头", "严重焦虑影响日常功能", "情绪剧烈波动"],
    contraindications: ["严重精神障碍需寻求精神科专业治疗"],
    tags: ["stress", "anxiety", "tcm", "ganmai", "emotional"],
    sourceTitle: "倪海厦伤寒论 + 神农本草课程",
    productLinks: [
      {
        productSlug: "msr-nadh-tipsynox",
        relationType: "education",
        note: "NADH提升细胞ATP能量水平，改善慢性疲劳和脑雾，间接缓解压力性倦怠。",
      },
    ],
    updatedAt: new Date("2026-06-01T05:30:00.000Z").toISOString(),
  },
  {
    id: "kb-nihaixia-six-channel",
    slug: "nihaixia-six-channel",
    title: "六经辨证入门：自我症状定位指南",
    category: "tcm_education",
    audience: "general_adult",
    summary: "倪海厦伤寒论核心是六经辨证，将疾病进程分为太阳→少阳→阳明→太阴→少阴→厥阴六个阶段，适合有一定中医基础的用户自我学习。",
    body: "六经辨证是伤寒论的核心框架：①太阳病（表证）：怕冷、头痛、项强、脉浮，最常见的外感阶段。②少阳病（半表半里）：忽冷忽热、胸胁苦满、口苦，是疾病转折点。③阳明病（里热）：高热、大渴、大汗、不恶寒，是机体抗病最亢奋阶段。④太阴病（里虚寒）：腹满、纳差、大便稀，脾胃虚弱。⑤少阴病（心肾虚寒）：精神萎靡、手脚冰凉、脉微细，是危重阶段。⑥厥阴病（阴阳气绝）：寒热错杂、手脚冰冷至肘膝，是最严重阶段。日常养生主要关注①②阶段，及时调理可阻止疾病深入。",
    evidenceLevel: "education",
    status: "reviewed",
    redFlags: ["高热超过3天", "胸痛呼吸困难", "意识模糊", "手脚冰冷超过肘膝"],
    contraindications: [],
    tags: ["six_channel", "tcm", "shanghan", "diagnosis", "beginner"],
    sourceTitle: "倪海厦伤寒论课程",
    productLinks: [],
    updatedAt: new Date("2026-06-01T05:30:00.000Z").toISOString(),
  },
  {
    id: "kb-nihaixia-herb-warm",
    slug: "nihaixia-herb-warm",
    title: "药食同源：温热性食材的日常应用",
    category: "tcm_education",
    audience: "general_adult",
    summary: "倪海厦神农本草课程强调药食同源，食物也有四气五味，日常饮食中的温热性食材适合手脚冰凉、脾胃虚寒人群。",
    body: "神农本草课程将药物分为上中下三品：上药可久服无副作用（如灵芝、甘草、小麦、大枣）；中药调理为主；下药峻烈不可久服。日常温热性食材：生姜（温中散寒）、红枣（补气血）、桂圆（养心血）、羊肉（温补肾阳）、山药（健脾补肺肾）。倪师特别提醒：现代人普遍熬夜伤阴，阳虚者多但阴虚者也多，不可盲目温补，需先辨证。手脚冰凉若伴有口干、失眠，多属阴虚火旺，应滋阴清热而非温补。脾胃虚寒（吃凉就腹泻、胃痛）适合温补；内有实热（便秘、口臭、舌红苔黄）则需清热。",
    evidenceLevel: "education",
    status: "reviewed",
    redFlags: ["长期手脚冰凉伴随疼痛", "反复口腔溃疡"],
    contraindications: ["实热体质者不宜单独温补", "糖尿病患者慎用红枣桂圆"],
    tags: ["tcm", "food_therapy", "warm_herbs", "diet", "herbology"],
    sourceTitle: "倪海厦神农本草课程",
    productLinks: [],
    updatedAt: new Date("2026-06-01T05:30:00.000Z").toISOString(),
  },
];

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function mapKnowledgeEntry(row: {
  id: string;
  slug: string;
  title: string;
  category: string;
  audience?: string | null;
  summary: string;
  body: string;
  evidenceLevel?: string | null;
  status: string;
  redFlags: string[];
  contraindications: string[];
  tags: string[];
  updatedAt: Date | string;
  source?: { title: string } | null;
  productLinks?: Array<{ productSlug: string; relationType: string; note?: string | null }>;
}): HealthKnowledgeEntryRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    audience: row.audience ?? null,
    summary: row.summary,
    body: row.body,
    evidenceLevel: row.evidenceLevel ?? null,
    status: row.status as KnowledgeStatus,
    redFlags: row.redFlags,
    contraindications: row.contraindications,
    tags: row.tags,
    sourceTitle: row.source?.title ?? null,
    productLinks: (row.productLinks ?? []).map((link) => ({
      productSlug: link.productSlug,
      relationType: link.relationType,
      note: link.note ?? null,
    })),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export function isReviewedKnowledgeEntry(entry: Pick<HealthKnowledgeEntryRecord, "status">) {
  return entry.status === "reviewed";
}

export function filterPublicKnowledgeEntries(entries: HealthKnowledgeEntryRecord[]) {
  return entries.filter(isReviewedKnowledgeEntry);
}

export function assertKnowledgeDoesNotSelectSku(entry: HealthKnowledgeEntryRecord) {
  return entry.productLinks.every((link) => link.relationType === "education");
}

export async function listKnowledgeEntriesForAdmin(): Promise<HealthKnowledgeEntryRecord[]> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.healthKnowledgeEntry.findMany({
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        include: {
          source: { select: { title: true } },
          productLinks: {
            select: { productSlug: true, relationType: true, note: true },
          },
        },
      });

      if (rows.length > 0) {
        return rows.map(mapKnowledgeEntry);
      }
    } catch {
      // Fall back to reviewed static seed while the database is being provisioned.
    }
  }

  return defaultKnowledgeEntries;
}

export async function listPublicKnowledgeEntries(category?: string) {
  const rows = await listKnowledgeEntriesForAdmin();
  return filterPublicKnowledgeEntries(
    category ? rows.filter((row) => row.category === category) : rows,
  );
}

export async function upsertDefaultKnowledgeSeed(prisma: any) {
  for (const source of defaultKnowledgeSources) {
    await prisma.knowledgeSource.upsert({
      where: { id: source.id },
      update: {
        title: source.title,
        sourceType: source.sourceType,
        publisher: source.publisher,
        citation: source.citation,
        status: source.status,
        reviewedAt: new Date(),
      },
      create: {
        id: source.id,
        title: source.title,
        sourceType: source.sourceType,
        publisher: source.publisher,
        citation: source.citation,
        status: source.status,
        reviewedAt: new Date(),
      },
    });
  }

  for (const entry of defaultKnowledgeEntries) {
    const savedEntry = await prisma.healthKnowledgeEntry.upsert({
      where: { slug: entry.slug },
      update: {
        title: entry.title,
        category: entry.category,
        audience: entry.audience,
        summary: entry.summary,
        body: entry.body,
        evidenceLevel: entry.evidenceLevel,
        status: entry.status,
        redFlags: entry.redFlags,
        contraindications: entry.contraindications,
        tags: entry.tags,
        sourceId: defaultKnowledgeSources[0].id,
        metadata: toJson({ seed: true }),
      },
      create: {
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        category: entry.category,
        audience: entry.audience,
        summary: entry.summary,
        body: entry.body,
        evidenceLevel: entry.evidenceLevel,
        status: entry.status,
        redFlags: entry.redFlags,
        contraindications: entry.contraindications,
        tags: entry.tags,
        sourceId: defaultKnowledgeSources[0].id,
        metadata: toJson({ seed: true }),
      },
    });

    for (const link of entry.productLinks) {
      await prisma.productKnowledgeLink.upsert({
        where: {
          entryId_productSlug: {
            entryId: savedEntry.id,
            productSlug: link.productSlug,
          },
        },
        update: {
          relationType: link.relationType,
          note: link.note,
        },
        create: {
          entryId: savedEntry.id,
          productSlug: link.productSlug,
          relationType: link.relationType,
          note: link.note,
        },
      });
    }
  }
}
