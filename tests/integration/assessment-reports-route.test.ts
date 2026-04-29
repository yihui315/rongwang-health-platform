import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as consultPost } from "@/app/api/ai/consult/route";
import { POST as signupPost } from "@/app/api/auth/signup/route";
import {
  GET as listReports,
  POST as saveReport,
} from "@/app/api/assessment-reports/route";
import { GET as listAdminReports } from "@/app/api/admin/assessment-reports/route";
import { GET as getReport } from "@/app/api/assessment-reports/[id]/route";
import { saveConsultationRecord } from "@/lib/data/consultations";
import { resetMemoryStore } from "@/lib/data/memory-store";
import type { HealthProfile } from "@/schemas/health";

async function withMemoryService<T>(fn: () => Promise<T>) {
  const keys = [
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RW_ENABLE_MEMORY_AUTH",
    "AUTH_ID_HASH_SALT",
    "ADMIN_AUTH_TOKEN",
    "FEATURE_AI_PROVIDER",
  ];
  const previous: Record<string, string | undefined> = {};
  for (const key of keys) {
    previous[key] = process.env[key];
    delete process.env[key];
  }

  process.env.RW_ENABLE_MEMORY_AUTH = "true";
  process.env.AUTH_ID_HASH_SALT = "assessment-report-test-salt";
  process.env.ADMIN_AUTH_TOKEN = "admin-report-test";
  process.env.FEATURE_AI_PROVIDER = "false";
  resetMemoryStore();

  try {
    return await fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    resetMemoryStore();
  }
}

function jsonRequest(url: string, body: unknown, cookie?: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

function firstCookie(setCookie: string) {
  return setCookie.split(";")[0];
}

const profile: HealthProfile = {
  age: 36,
  gender: "male",
  symptoms: ["fatigue", "poor sleep"],
  duration: "1 to 4 weeks",
  lifestyle: {
    sleep: "often sleeps late",
    alcohol: false,
    smoking: false,
    exercise: "1 to 2 times per week",
  },
  goal: "Improve daytime energy",
  medications: "",
  allergies: "",
};

test("assessment reports require auth and save a consultation snapshot for the current user", async () => {
  await withMemoryService(async () => {
    const anonymous = await saveReport(
      jsonRequest("http://localhost/api/assessment-reports", { consultationId: "missing" }),
    );
    assert.equal(anonymous.status, 401);
    assert.equal((await anonymous.json()).error, "auth_required");

    const signup = await signupPost(
      jsonRequest("http://localhost/api/auth/signup", {
        email: "reports@example.com",
        password: "password-123",
      }),
    );
    const cookie = firstCookie(signup.headers.get("set-cookie") ?? "");
    assert.match(cookie, /^rw_session=/);

    const consult = await consultPost(
      new Request("http://localhost/api/ai/consult", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.66",
          "user-agent": "report-test",
        },
        body: JSON.stringify({ profile }),
      }),
    );
    assert.equal(consult.status, 200);
    const consultation = await consult.json();

    const saved = await saveReport(
      jsonRequest(
        "http://localhost/api/assessment-reports",
        { consultationId: consultation.consultationId },
        cookie,
      ),
    );
    assert.equal(saved.status, 201);
    const savedPayload = await saved.json();
    assert.equal(savedPayload.success, true);
    assert.equal(savedPayload.report.consultationId, consultation.consultationId);

    const list = await listReports(
      new NextRequest("http://localhost/api/assessment-reports", {
        headers: { cookie },
      }),
    );
    const listPayload = await list.json();
    assert.equal(listPayload.reports.length, 1);

    const detail = await getReport(
      new NextRequest(`http://localhost/api/assessment-reports/${savedPayload.report.id}`, {
        headers: { cookie },
      }),
      { params: Promise.resolve({ id: savedPayload.report.id }) },
    );
    assert.equal(detail.status, 200);
    const detailPayload = await detail.json();
    assert.equal(detailPayload.report.profile.age, 36);
  });
});

test("admin can audit saved assessment reports without raw identity leakage", async () => {
  await withMemoryService(async () => {
    const signup = await signupPost(
      jsonRequest("http://localhost/api/auth/signup", {
        email: "private-user@example.com",
        password: "password-123",
      }),
    );
    const cookie = firstCookie(signup.headers.get("set-cookie") ?? "");

    const consult = await consultPost(
      new Request("http://localhost/api/ai/consult", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.88",
          "user-agent": "admin-report-test",
        },
        body: JSON.stringify({ profile }),
      }),
    );
    const consultation = await consult.json();

    await saveReport(
      jsonRequest(
        "http://localhost/api/assessment-reports",
        { consultationId: consultation.consultationId },
        cookie,
      ),
    );

    const unauthorized = await listAdminReports(
      new NextRequest("http://localhost/api/admin/assessment-reports"),
    );
    assert.equal(unauthorized.status, 401);

    const authorized = await listAdminReports(
      new NextRequest("http://localhost/api/admin/assessment-reports", {
        headers: { "x-admin-token": "admin-report-test" },
      }),
    );
    assert.equal(authorized.status, 200);
    const payload = await authorized.json();
    const serialized = JSON.stringify(payload);

    assert.equal(payload.success, true);
    assert.equal(payload.reports.length, 1);
    assert.equal(payload.reports[0].user.emailMasked, "pr***@example.com");
    assert.equal(serialized.includes("private-user@example.com"), false);
    assert.equal(serialized.includes("openid"), false);
    assert.equal(serialized.includes("unionid"), false);
    assert.equal(serialized.includes("providerSubjectHash"), false);
  });
});

test("urgent saved reports suppress product recommendation snapshots", async () => {
  await withMemoryService(async () => {
    const signup = await signupPost(
      jsonRequest("http://localhost/api/auth/signup", {
        email: "urgent@example.com",
        password: "password-123",
      }),
    );
    const cookie = firstCookie(signup.headers.get("set-cookie") ?? "");

    await saveConsultationRecord({
      id: "urgent-consultation",
      profile,
      result: {
        summary: "Urgent red flags require offline care.",
        riskLevel: "urgent",
        possibleFactors: ["red flag symptoms"],
        redFlags: ["chest pain"],
        lifestyleAdvice: ["Seek care first"],
        supplementDirections: [],
        otcDirections: [],
        recommendedSolutionType: "general",
        productRecommendationReason: "Commerce suppressed.",
        disclaimer: "AI output is educational only.",
      },
      safety: {
        riskLevel: "urgent",
        redFlags: ["chest pain"],
        cautionFlags: [],
        commerceAllowed: false,
        clinicianAdvice: ["Seek urgent care."],
      },
      recommendations: [
        {
          id: "product-1",
          productSlug: "msr-nadh-tipsynox",
          name: "Should not show",
          brand: "Rongwang",
          price: 100,
          image: null,
          tagline: "hidden",
          reason: "hidden",
          destinationUrl: "/product-map/msr-nadh-tipsynox",
          isExternal: false,
        },
      ],
      source: "unit-test",
    });

    const saved = await saveReport(
      jsonRequest(
        "http://localhost/api/assessment-reports",
        { consultationId: "urgent-consultation" },
        cookie,
      ),
    );

    assert.equal(saved.status, 201);
    const payload = await saved.json();
    assert.equal(payload.report.riskLevel, "urgent");
    assert.deepEqual(payload.report.recommendations, []);
  });
});
