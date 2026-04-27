type RedisRestResponse<T> = {
  result?: T;
  error?: string;
};

export interface RedisRestClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
}

type RedisConfig = {
  url: string;
  token: string;
};

const globalForRedis = globalThis as typeof globalThis & {
  __rongwangRedisClient?: RedisRestClient | null;
  __rongwangRedisConfigKey?: string;
};

function normalizeRestUrl(value: string | undefined) {
  if (!value || !/^https?:\/\//i.test(value)) {
    return undefined;
  }

  return value.replace(/\/+$/, "");
}

function getRedisConfig(): RedisConfig | null {
  const url = normalizeRestUrl(
    process.env.UPSTASH_REDIS_REST_URL ||
      process.env.REDIS_REST_URL ||
      process.env.REDIS_URL,
  );
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_REST_TOKEN ||
    process.env.REDIS_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

class FetchRedisRestClient implements RedisRestClient {
  constructor(private readonly config: RedisConfig) {}

  private async command<T>(parts: string[]): Promise<T> {
    const path = parts.map((part) => encodeURIComponent(part)).join("/");
    const response = await fetch(`${this.config.url}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Redis REST command failed with ${response.status}`);
    }

    const payload = (await response.json()) as RedisRestResponse<T>;
    if (payload.error) {
      throw new Error(payload.error);
    }

    return payload.result as T;
  }

  async incr(key: string) {
    const value = await this.command<number | string>(["INCR", key]);
    return Number(value);
  }

  async expire(key: string, seconds: number) {
    const value = await this.command<number | string>([
      "EXPIRE",
      key,
      String(seconds),
    ]);
    return Number(value) === 1;
  }

  async ttl(key: string) {
    const value = await this.command<number | string>(["TTL", key]);
    return Number(value);
  }
}

export function getRedis(): RedisRestClient | null {
  const config = getRedisConfig();
  if (!config) {
    globalForRedis.__rongwangRedisClient = null;
    globalForRedis.__rongwangRedisConfigKey = undefined;
    return null;
  }

  const configKey = `${config.url}:${config.token.slice(0, 8)}`;
  if (
    !globalForRedis.__rongwangRedisClient ||
    globalForRedis.__rongwangRedisConfigKey !== configKey
  ) {
    globalForRedis.__rongwangRedisClient = new FetchRedisRestClient(config);
    globalForRedis.__rongwangRedisConfigKey = configKey;
  }

  return globalForRedis.__rongwangRedisClient;
}
