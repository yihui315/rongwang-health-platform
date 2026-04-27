import { getRedis } from "@/lib/redis";

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  source: "redis" | "memory";
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __rongwangRateLimit?: Map<string, Bucket>;
};

const buckets = globalForRateLimit.__rongwangRateLimit ?? new Map<string, Bucket>();
globalForRateLimit.__rongwangRateLimit = buckets;

function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const nextBucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, nextBucket);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: nextBucket.resetAt,
      source: "memory",
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      source: "memory",
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: Math.max(limit - bucket.count, 0),
    resetAt: bucket.resetAt,
    source: "memory",
  };
}

async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    let ttl = await redis.ttl(key);
    if (ttl < 0) {
      await redis.expire(key, windowSeconds);
      ttl = windowSeconds;
    }

    const resetAt = Date.now() + Math.max(ttl, 1) * 1000;

    return {
      allowed: count <= limit,
      remaining: Math.max(limit - count, 0),
      resetAt,
      source: "redis",
    };
  } catch (error) {
    console.warn("[rate-limit] Redis unavailable, using memory fallback", error);
    return null;
  }
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
) {
  return (
    (await checkRedisRateLimit(key, limit, windowMs)) ??
    checkMemoryRateLimit(key, limit, windowMs)
  );
}
