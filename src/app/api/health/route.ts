import { NextResponse } from "next/server";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { getGeoFlowAutomationStatus } from "@/lib/marketing/geoflow";
import { logApiEvent } from "@/lib/observability";

export const dynamic = "force-dynamic";

function hasAiProvider() {
  if (process.env.AI_PROVIDER === "deepseek") {
    return Boolean(process.env.DEEPSEEK_API_KEY);
  }

  return Boolean(process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY);
}

function hasCmsProvider() {
  return Boolean(process.env.GEOFLOW_API_URL && process.env.GEOFLOW_API_TOKEN);
}

function getAiProviderName() {
  if (process.env.AI_PROVIDER) {
    return process.env.AI_PROVIDER;
  }
  if (process.env.DEEPSEEK_API_KEY) {
    return "deepseek";
  }
  return "openai";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const deep = url.searchParams.get("deep") === "1";
  const redis = getRedis();
  const geoFlow = getGeoFlowAutomationStatus();
  const checks = {
    databaseConfigured: hasDatabaseUrl(),
    redisConfigured: Boolean(redis),
    aiConfigured: hasAiProvider(),
    cmsConfigured: hasCmsProvider(),
  };

  let databaseReachable: boolean | undefined;
  let redisReachable: boolean | undefined;

  if (deep && checks.databaseConfigured) {
    try {
      const prisma = getPrisma();
      if (!prisma) {
        databaseReachable = false;
      } else {
        await prisma.$queryRaw`SELECT 1`;
        databaseReachable = true;
      }
    } catch {
      databaseReachable = false;
    }
  }

  if (deep && redis) {
    try {
      const key = `health:${Date.now()}`;
      await redis.incr(key);
      await redis.expire(key, 30);
      redisReachable = true;
    } catch {
      redisReachable = false;
    }
  }

  const readiness = {
    database: {
      configured: checks.databaseConfigured,
      reachable: databaseReachable,
    },
    redis: {
      configured: checks.redisConfigured,
      reachable: redisReachable,
    },
    ai: {
      provider: getAiProviderName(),
      configured: checks.aiConfigured,
    },
    geoFlow,
  };

  logApiEvent("api.health.checked", {
    deep,
    databaseConfigured: checks.databaseConfigured,
    redisConfigured: checks.redisConfigured,
    aiConfigured: checks.aiConfigured,
    geoFlowConfigured: geoFlow.configured,
  });

  return NextResponse.json(
    {
      ok: true,
      service: "rongwang-health-platform",
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      checks,
      readiness,
      databaseReachable,
      redisReachable,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
