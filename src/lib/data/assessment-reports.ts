import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getConsultationLogDetail } from "@/lib/data/consultations";
import { getMemoryStore, isMemoryStoreEnabled } from "@/lib/data/memory-store";
import type { UserSummary } from "@/lib/auth/user-service";

export interface AssessmentReportSummary {
  id: string;
  consultationId: string | null;
  title: string;
  riskLevel: string;
  recommendedSolutionType: string | null;
  createdAt: string;
}

export interface AssessmentReportDetail extends AssessmentReportSummary {
  profile: unknown;
  result: unknown;
  safety: unknown;
  recommendations: unknown[];
  ai: {
    provider?: string | null;
    model?: string | null;
    promptVersion?: string | null;
  };
  disclaimer: string | null;
}

export interface AdminAssessmentReportSummary extends AssessmentReportSummary {
  user: {
    id: string;
    displayName: string | null;
    emailMasked: string | null;
    identityProviders: string[];
  };
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function nowIso() {
  return new Date().toISOString();
}

function reportTitle(riskLevel: string, solutionType?: string | null) {
  const solution = solutionType ? ` · ${solutionType}` : "";
  return `AI 健康评估报告 · ${riskLevel}${solution}`;
}

export function maskEmail(email: string | null | undefined) {
  if (!email) {
    return null;
  }

  const [name, domain] = email.split("@");
  if (!name || !domain) {
    return "***";
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function isUrgentRisk(riskLevel: string) {
  return riskLevel === "urgent" || riskLevel === "high";
}

function mapReport(row: {
  id: string;
  consultationId?: string | null;
  title?: string | null;
  riskLevel: string;
  recommendedSolutionType?: string | null;
  createdAt: Date | string;
}): AssessmentReportSummary {
  return {
    id: row.id,
    consultationId: row.consultationId ?? null,
    title: row.title ?? reportTitle(row.riskLevel, row.recommendedSolutionType),
    riskLevel: row.riskLevel,
    recommendedSolutionType: row.recommendedSolutionType ?? null,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

function mapReportDetail(row: {
  id: string;
  consultationId?: string | null;
  title?: string | null;
  profileJson: unknown;
  aiResult: unknown;
  safetyJson: unknown;
  recommendationsJson?: unknown;
  riskLevel: string;
  recommendedSolutionType?: string | null;
  aiProvider?: string | null;
  aiModel?: string | null;
  promptVersion?: string | null;
  createdAt: Date | string;
}): AssessmentReportDetail {
  const recommendations = Array.isArray(row.recommendationsJson) ? row.recommendationsJson : [];
  const result = row.aiResult && typeof row.aiResult === "object" && !Array.isArray(row.aiResult)
    ? (row.aiResult as Record<string, unknown>)
    : {};
  return {
    ...mapReport(row),
    profile: row.profileJson,
    result,
    safety: row.safetyJson,
    recommendations: isUrgentRisk(row.riskLevel) ? [] : recommendations,
    ai: {
      provider: row.aiProvider ?? null,
      model: row.aiModel ?? null,
      promptVersion: row.promptVersion ?? null,
    },
    disclaimer: typeof result.disclaimer === "string" ? result.disclaimer : null,
  };
}

export async function saveAssessmentReportForUser(
  user: UserSummary,
  consultationId: string,
): Promise<{ ok: boolean; status: number; error?: string; report?: AssessmentReportDetail }> {
  const detail = await getConsultationLogDetail(consultationId);
  if (!detail?.profile || !detail.result || !detail.safety) {
    return { ok: false, status: 404, error: "consultation_not_found" };
  }

  const recommendations = isUrgentRisk(detail.riskLevel) ? [] : detail.recommendations;
  const title = reportTitle(detail.riskLevel, detail.result.recommendedSolutionType);
  const prisma = getPrisma();

  if (prisma) {
    try {
      const existing = await prisma.assessmentReport.findFirst({
        where: { userAccountId: user.id, consultationId },
      });
      if (existing) {
        const report = await prisma.assessmentReport.findUnique({
          where: { id: existing.id },
        });
        return report
          ? { ok: true, status: 200, report: mapReportDetail(report) }
          : { ok: false, status: 404, error: "report_not_found" };
      }

      const profile = await prisma.userHealthProfile.create({
        data: {
          userAccountId: user.id,
          profileJson: toJson(detail.profile),
          consentVersion: "assessment-save-v1",
          source: "ai-consult",
        },
      });

      const report = await prisma.assessmentReport.create({
        data: {
          userAccountId: user.id,
          consultationId,
          healthProfileId: profile.id,
          title,
          profileJson: toJson(detail.profile),
          aiResult: toJson(detail.result),
          safetyJson: toJson(detail.safety),
          recommendationsJson: toJson(recommendations),
          riskLevel: detail.riskLevel,
          recommendedSolutionType: detail.result.recommendedSolutionType,
          aiProvider: detail.aiLog?.provider ?? null,
          aiModel: detail.aiLog?.model ?? null,
          promptVersion: detail.aiLog?.promptVersion ?? null,
          source: "ai-consult",
          metadata: toJson({
            savedFrom: "assessment-result",
            aiStatus: detail.aiLog?.status ?? null,
          }),
        },
      });

      return { ok: true, status: 201, report: mapReportDetail(report) };
    } catch {
      return { ok: false, status: 503, error: "assessment_report_store_unavailable" };
    }
  }

  if (!isMemoryStoreEnabled()) {
    return { ok: false, status: 503, error: "assessment_report_store_unavailable" };
  }

  const store = getMemoryStore();
  const duplicate = Array.from(store.assessmentReports.values()).find(
    (row) => row.userAccountId === user.id && row.consultationId === consultationId,
  );
  if (duplicate) {
    return { ok: true, status: 200, report: mapReportDetail(duplicate as never) };
  }

  const profileId = `profile_${store.healthProfiles.size + 1}`;
  const reportId = `report_${store.assessmentReports.size + 1}`;
  store.healthProfiles.set(profileId, {
    id: profileId,
    userAccountId: user.id,
    profileJson: detail.profile,
    consentVersion: "assessment-save-v1",
    source: "ai-consult",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  const row = {
    id: reportId,
    userAccountId: user.id,
    consultationId,
    healthProfileId: profileId,
    title,
    profileJson: detail.profile,
    aiResult: detail.result,
    safetyJson: detail.safety,
    recommendationsJson: recommendations,
    riskLevel: detail.riskLevel,
    recommendedSolutionType: detail.result.recommendedSolutionType,
    aiProvider: detail.aiLog?.provider ?? null,
    aiModel: detail.aiLog?.model ?? null,
    promptVersion: detail.aiLog?.promptVersion ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.assessmentReports.set(reportId, row);
  return { ok: true, status: 201, report: mapReportDetail(row) };
}

export async function listAssessmentReportsForUser(user: UserSummary): Promise<AssessmentReportSummary[]> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.assessmentReport.findMany({
        where: { userAccountId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return rows.map(mapReport);
    } catch {
      return [];
    }
  }

  if (!isMemoryStoreEnabled()) {
    return [];
  }

  return Array.from(getMemoryStore().assessmentReports.values())
    .filter((row) => row.userAccountId === user.id)
    .map((row) => mapReport(row as never))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAssessmentReportForUser(
  user: UserSummary,
  id: string,
): Promise<AssessmentReportDetail | null> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const row = await prisma.assessmentReport.findFirst({
        where: { id, userAccountId: user.id },
      });
      return row ? mapReportDetail(row) : null;
    } catch {
      return null;
    }
  }

  if (!isMemoryStoreEnabled()) {
    return null;
  }

  const row = getMemoryStore().assessmentReports.get(id);
  if (!row || row.userAccountId !== user.id) {
    return null;
  }

  return mapReportDetail(row as never);
}

export async function listAssessmentReportsForAdmin(): Promise<AdminAssessmentReportSummary[]> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.assessmentReport.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          userAccount: {
            include: {
              identities: {
                select: { provider: true },
              },
            },
          },
        },
      });

      return rows.map((row) => ({
        ...mapReport(row),
        user: {
          id: row.userAccount.id,
          displayName: row.userAccount.displayName,
          emailMasked: maskEmail(row.userAccount.email),
          identityProviders: Array.from(
            new Set(row.userAccount.identities.map((identity) => identity.provider)),
          ),
        },
      }));
    } catch {
      return [];
    }
  }

  if (!isMemoryStoreEnabled()) {
    return [];
  }

  const store = getMemoryStore();
  return Array.from(store.assessmentReports.values())
    .map((row) => {
      const account = store.accounts.get(String(row.userAccountId));
      const identities = Array.from(store.identities.values())
        .filter((identity) => identity.userAccountId === row.userAccountId)
        .map((identity) => String(identity.provider ?? ""))
        .filter(Boolean);

      return {
        ...mapReport(row as never),
        user: {
          id: String(row.userAccountId),
          displayName: typeof account?.displayName === "string" ? account.displayName : null,
          emailMasked: typeof account?.email === "string" ? maskEmail(account.email) : null,
          identityProviders: Array.from(new Set(identities)),
        },
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
