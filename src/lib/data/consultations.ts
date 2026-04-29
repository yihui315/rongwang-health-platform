import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getMemoryStore, isMemoryStoreEnabled } from "@/lib/data/memory-store";
import { getSupabase } from "@/lib/supabase";
import type { ProductRecommendation } from "@/lib/health/recommendations";
import type { SafetyAssessment } from "@/lib/health/safety";
import type { AiLogRecord } from "@/schemas/ai-log";
import type { HealthConsultationResult } from "@/schemas/ai-result";
import { aiLogSchema } from "@/schemas/ai-log";
import { healthConsultationResultSchema } from "@/schemas/ai-result";
import { productRecommendationSchema, safetyResponseSchema } from "@/schemas/consultation-response";
import { healthProfileSchema } from "@/schemas/health";
import type { HealthProfile } from "@/schemas/health";

export interface ConsultationListItem {
  id: string;
  createdAt: string;
  riskLevel: string;
  symptoms: string[];
  goal?: string;
  age?: number;
  source?: string;
  aiProvider?: string;
  aiModel?: string;
  promptVersion?: string;
  aiStatus?: string;
  fallbackUsed?: boolean;
  aiErrorMessage?: string;
  clickCount?: number;
}

export interface ConsultationListFilters {
  limit?: number;
  riskLevel?: string;
  symptom?: string;
  source?: string;
  hasClick?: boolean;
}

export interface ConsultationLogDetail extends ConsultationListItem {
  profile?: HealthProfile;
  result?: HealthConsultationResult;
  safety?: SafetyAssessment;
  recommendations: ProductRecommendation[];
  aiLog?: AiLogRecord | null;
  rawResponse?: unknown;
  requestMeta?: {
    ipHash?: string | null;
    userAgent?: string | null;
  };
}

export interface PersistConsultationInput {
  id: string;
  profile: HealthProfile;
  result: HealthConsultationResult;
  safety: SafetyAssessment;
  recommendations: ProductRecommendation[];
  source: string;
  ipHash?: string;
  userAgent?: string;
  aiLog?: AiLogRecord | null;
}

function readProfileValue<T>(value: unknown, key: string): T | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  return record[key] as T | undefined;
}

function readNestedValue<T>(value: unknown, keys: string[]): T | undefined {
  let current: unknown = value;

  for (const key of keys) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current as T | undefined;
}

function parseWithSchema<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } }, value: unknown) {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function filterConsultationListItems(
  rows: ConsultationListItem[],
  filters: ConsultationListFilters = {},
) {
  return rows.filter((row) => {
    if (filters.riskLevel && row.riskLevel !== filters.riskLevel) {
      return false;
    }

    if (filters.source && row.source !== filters.source) {
      return false;
    }

    if (filters.symptom) {
      const needle = filters.symptom.toLowerCase();
      if (!row.symptoms.some((symptom) => symptom.toLowerCase().includes(needle))) {
        return false;
      }
    }

    if (typeof filters.hasClick === "boolean") {
      const clicked = (row.clickCount ?? 0) > 0;
      if (clicked !== filters.hasClick) {
        return false;
      }
    }

    return true;
  });
}

function normalizeListInput(input: number | ConsultationListFilters = 50): Required<Pick<ConsultationListFilters, "limit">> & ConsultationListFilters {
  if (typeof input === "number") {
    return { limit: input };
  }

  return {
    ...input,
    limit: input.limit ?? 50,
  };
}

async function queryFromPrisma(filters: ReturnType<typeof normalizeListInput>): Promise<ConsultationListItem[] | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  try {
    const rows = await prisma.consultation.findMany({
      where: {
        riskLevel: filters.riskLevel,
        source: filters.source,
        symptoms: filters.symptom ? { has: filters.symptom } : undefined,
        pddClicks: typeof filters.hasClick === "boolean"
          ? filters.hasClick
            ? { some: {} }
            : { none: {} }
          : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit,
      include: {
        _count: {
          select: { pddClicks: true },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      riskLevel: row.riskLevel,
      symptoms: row.symptoms,
      goal: readProfileValue<string>(row.profileJson, "goal"),
      age: readProfileValue<number>(row.profileJson, "age"),
      source: row.source ?? undefined,
      aiProvider: row.aiProvider ?? undefined,
      aiModel: row.aiModel ?? undefined,
      promptVersion: row.promptVersion ?? undefined,
      aiStatus: readNestedValue<string>(row.metadata, ["aiLog", "status"]),
      fallbackUsed: readNestedValue<boolean>(row.metadata, ["aiLog", "fallbackUsed"]),
      aiErrorMessage: readNestedValue<string>(row.metadata, ["aiLog", "errorMessage"]),
      clickCount: row._count.pddClicks,
    }));
  } catch {
    return null;
  }
}

async function queryFromSupabase(filters: ReturnType<typeof normalizeListInput>): Promise<ConsultationListItem[]> {
  try {
    const { data } = await getSupabase().from("consultations").select("*");
    const rows = (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>;

    return filterConsultationListItems(rows.slice(0, filters.limit).map((row) => ({
      id: String(row.id ?? ""),
      createdAt: String(row.created_at ?? ""),
      riskLevel: String(row.risk_level ?? "unknown"),
      symptoms: Array.isArray(row.symptoms) ? row.symptoms.filter((item: unknown): item is string => typeof item === "string") : [],
      goal: readProfileValue<string>(row.profile_json, "goal"),
      age: readProfileValue<number>(row.profile_json, "age"),
      source: typeof row.source === "string" ? row.source : undefined,
      aiProvider: typeof row.ai_provider === "string" ? row.ai_provider : undefined,
      aiModel: typeof row.ai_model === "string" ? row.ai_model : undefined,
      promptVersion: typeof row.prompt_version === "string" ? row.prompt_version : undefined,
      aiStatus: readNestedValue<string>(row.metadata, ["aiLog", "status"]),
      fallbackUsed: readNestedValue<boolean>(row.metadata, ["aiLog", "fallbackUsed"]),
      aiErrorMessage: readNestedValue<string>(row.metadata, ["aiLog", "errorMessage"]),
      clickCount: 0,
    })), filters);
  } catch {
    return [];
  }
}

function queryFromMemory(filters: ReturnType<typeof normalizeListInput>): ConsultationListItem[] | null {
  if (!isMemoryStoreEnabled()) {
    return null;
  }

  const rows = Array.from(getMemoryStore().consultations.values())
    .map((row) => ({
      id: String(row.id ?? ""),
      createdAt: String(row.createdAt ?? ""),
      riskLevel: String(row.riskLevel ?? "unknown"),
      symptoms: Array.isArray(row.symptoms) ? row.symptoms.filter((item): item is string => typeof item === "string") : [],
      goal: readProfileValue<string>(row.profileJson, "goal"),
      age: readProfileValue<number>(row.profileJson, "age"),
      source: typeof row.source === "string" ? row.source : undefined,
      aiProvider: typeof row.aiProvider === "string" ? row.aiProvider : undefined,
      aiModel: typeof row.aiModel === "string" ? row.aiModel : undefined,
      promptVersion: typeof row.promptVersion === "string" ? row.promptVersion : undefined,
      aiStatus: readNestedValue<string>(row.metadata, ["aiLog", "status"]),
      fallbackUsed: readNestedValue<boolean>(row.metadata, ["aiLog", "fallbackUsed"]),
      aiErrorMessage: readNestedValue<string>(row.metadata, ["aiLog", "errorMessage"]),
      clickCount: 0,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, filters.limit);

  return filterConsultationListItems(rows, filters);
}

export async function listConsultations(input: number | ConsultationListFilters = 50): Promise<ConsultationListItem[]> {
  const filters = normalizeListInput(input);
  return (await queryFromPrisma(filters)) ?? queryFromMemory(filters) ?? (await queryFromSupabase(filters));
}

async function queryLogDetailFromPrisma(id: string): Promise<ConsultationLogDetail | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  try {
    const row = await prisma.consultation.findUnique({
      where: { id },
    });

    if (!row) {
      return null;
    }

    const aiLog = parseWithSchema(aiLogSchema, readNestedValue(row.metadata, ["aiLog"]));
    const safety = parseWithSchema(safetyResponseSchema, readNestedValue(row.metadata, ["safety"]));
    const profile = parseWithSchema(healthProfileSchema, row.profileJson);
    const result = parseWithSchema(healthConsultationResultSchema, row.aiResult);
    const recommendations = parseWithSchema(productRecommendationSchema.array(), row.recommendationSnapshot) ?? [];
    const requestMeta = readNestedValue<{ ipHash?: string | null; userAgent?: string | null }>(
      row.metadata,
      ["requestMeta"],
    );

    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      riskLevel: row.riskLevel,
      symptoms: row.symptoms,
      goal: profile?.goal,
      age: profile?.age,
      source: row.source ?? undefined,
      aiProvider: row.aiProvider ?? undefined,
      aiModel: row.aiModel ?? undefined,
      promptVersion: row.promptVersion ?? undefined,
      aiStatus: aiLog?.status,
      fallbackUsed: aiLog?.fallbackUsed,
      aiErrorMessage: aiLog?.errorMessage,
      profile,
      result,
      safety,
      recommendations,
      aiLog,
      rawResponse: row.rawResponse,
      requestMeta,
    };
  } catch {
    return null;
  }
}

async function queryLogDetailFromSupabase(id: string): Promise<ConsultationLogDetail | null> {
  try {
    const { data } = await getSupabase().from("consultations").select("*");

    if (!Array.isArray(data)) {
      return null;
    }

    const row = data.find(
      (item): item is Record<string, unknown> =>
        Boolean(item) &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        String((item as Record<string, unknown>).id ?? "") === id,
    );

    if (!row) {
      return null;
    }

    const aiLog = parseWithSchema(aiLogSchema, readNestedValue(row.metadata, ["aiLog"]));
    const safety = parseWithSchema(safetyResponseSchema, readNestedValue(row.metadata, ["safety"]));
    const profile = parseWithSchema(healthProfileSchema, row.profile_json);
    const result = parseWithSchema(healthConsultationResultSchema, row.ai_result);
    const recommendations = parseWithSchema(productRecommendationSchema.array(), row.recommendation_snapshot) ?? [];
    const requestMeta = readNestedValue<{ ipHash?: string | null; userAgent?: string | null }>(
      row.metadata,
      ["requestMeta"],
    );

    return {
      id: String(row.id ?? ""),
      createdAt: String(row.created_at ?? ""),
      riskLevel: String(row.risk_level ?? "unknown"),
      symptoms: Array.isArray(row.symptoms) ? row.symptoms.filter((item: unknown): item is string => typeof item === "string") : [],
      goal: profile?.goal,
      age: profile?.age,
      source: typeof row.source === "string" ? row.source : undefined,
      aiProvider: typeof row.ai_provider === "string" ? row.ai_provider : undefined,
      aiModel: typeof row.ai_model === "string" ? row.ai_model : undefined,
      promptVersion: typeof row.prompt_version === "string" ? row.prompt_version : undefined,
      aiStatus: aiLog?.status,
      fallbackUsed: aiLog?.fallbackUsed,
      aiErrorMessage: aiLog?.errorMessage,
      profile,
      result,
      safety,
      recommendations,
      aiLog,
      rawResponse: row.raw_response,
      requestMeta,
    };
  } catch {
    return null;
  }
}

function queryLogDetailFromMemory(id: string): ConsultationLogDetail | null {
  if (!isMemoryStoreEnabled()) {
    return null;
  }

  const row = getMemoryStore().consultations.get(id);
  if (!row) {
    return null;
  }

  const aiLog = parseWithSchema(aiLogSchema, readNestedValue(row.metadata, ["aiLog"]));
  const safety = parseWithSchema(safetyResponseSchema, readNestedValue(row.metadata, ["safety"]));
  const profile = parseWithSchema(healthProfileSchema, row.profileJson);
  const result = parseWithSchema(healthConsultationResultSchema, row.aiResult);
  const recommendations = parseWithSchema(productRecommendationSchema.array(), row.recommendationSnapshot) ?? [];
  const requestMeta = readNestedValue<{ ipHash?: string | null; userAgent?: string | null }>(
    row.metadata,
    ["requestMeta"],
  );

  return {
    id: String(row.id ?? ""),
    createdAt: String(row.createdAt ?? ""),
    riskLevel: String(row.riskLevel ?? "unknown"),
    symptoms: Array.isArray(row.symptoms) ? row.symptoms.filter((item): item is string => typeof item === "string") : [],
    goal: profile?.goal,
    age: profile?.age,
    source: typeof row.source === "string" ? row.source : undefined,
    aiProvider: typeof row.aiProvider === "string" ? row.aiProvider : undefined,
    aiModel: typeof row.aiModel === "string" ? row.aiModel : undefined,
    promptVersion: typeof row.promptVersion === "string" ? row.promptVersion : undefined,
    aiStatus: aiLog?.status,
    fallbackUsed: aiLog?.fallbackUsed,
    aiErrorMessage: aiLog?.errorMessage,
    profile,
    result,
    safety,
    recommendations,
    aiLog,
    rawResponse: row.rawResponse,
    requestMeta,
  };
}

export async function getConsultationLogDetail(id: string): Promise<ConsultationLogDetail | null> {
  return (await queryLogDetailFromPrisma(id)) ?? queryLogDetailFromMemory(id) ?? (await queryLogDetailFromSupabase(id));
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

async function persistToPrisma(input: PersistConsultationInput): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) {
    return false;
  }

  try {
    await prisma.consultation.create({
      data: {
        id: input.id,
        profileJson: toJson(input.profile),
        symptoms: input.profile.symptoms,
        aiResult: toJson(input.result),
        riskLevel: input.result.riskLevel,
        recommendedSolutionType: input.result.recommendedSolutionType,
        source: input.source,
        recommendationSnapshot: toJson(input.recommendations),
        aiProvider: input.aiLog?.provider ?? null,
        aiModel: input.aiLog?.model ?? null,
        promptVersion: input.aiLog?.promptVersion ?? null,
        rawResponse: input.aiLog?.rawOutput ? toJson(input.aiLog.rawOutput) : undefined,
        metadata: toJson({
          safety: input.safety,
          aiLog: input.aiLog ?? null,
          requestMeta: {
            ipHash: input.ipHash ?? null,
            userAgent: input.userAgent ?? null,
          },
        }),
      },
    });

    return true;
  } catch {
    return false;
  }
}

async function persistToSupabase(input: PersistConsultationInput): Promise<void> {
  try {
    await getSupabase().from("consultations").insert({
      id: input.id,
      profile_json: input.profile,
      symptoms: input.profile.symptoms,
      ai_result: input.result,
      risk_level: input.result.riskLevel,
      ip_hash: input.ipHash ?? null,
      user_agent: input.userAgent ?? "",
      source: input.source,
    });
  } catch {
    // Best-effort persistence only for the MVP.
  }
}

function persistToMemory(input: PersistConsultationInput) {
  if (!isMemoryStoreEnabled()) {
    return;
  }

  getMemoryStore().consultations.set(input.id, {
    id: input.id,
    profileJson: input.profile,
    symptoms: input.profile.symptoms,
    aiResult: input.result,
    riskLevel: input.result.riskLevel,
    recommendedSolutionType: input.result.recommendedSolutionType,
    source: input.source,
    recommendationSnapshot: input.recommendations,
    aiProvider: input.aiLog?.provider ?? null,
    aiModel: input.aiLog?.model ?? null,
    promptVersion: input.aiLog?.promptVersion ?? null,
    rawResponse: input.aiLog?.rawOutput ?? null,
    metadata: {
      safety: input.safety,
      aiLog: input.aiLog ?? null,
      requestMeta: {
        ipHash: input.ipHash ?? null,
        userAgent: input.userAgent ?? null,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function saveConsultationRecord(input: PersistConsultationInput): Promise<void> {
  const saved = await persistToPrisma(input);
  if (!saved) {
    persistToMemory(input);
    await persistToSupabase(input);
  }
}
