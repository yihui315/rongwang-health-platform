export type DataBackend = 'json' | 'postgres';

type EnvLike = Record<string, string | undefined>;

export function resolveDataBackend(env: EnvLike = process.env): DataBackend {
  const configured = env.RONGWANG_DATA_BACKEND?.trim().toLowerCase();

  if (!configured) {
    return env.NODE_ENV === 'production' ? 'postgres' : 'json';
  }

  if (configured === 'json' || configured === 'postgres') {
    return configured;
  }

  throw new Error('RONGWANG_DATA_BACKEND must be either "json" or "postgres"');
}

export function sensitiveHealthRetentionDays(env: EnvLike = process.env): number {
  const rawValue = env.SENSITIVE_HEALTH_RETENTION_DAYS?.trim() || '180';
  const days = Number(rawValue);

  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    throw new Error('Sensitive health retention must be an integer between 1 and 3650 days');
  }

  return days;
}

export function retentionExpiresAt(createdAt: Date = new Date(), env: EnvLike = process.env): string {
  const expiresAt = new Date(createdAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + sensitiveHealthRetentionDays(env));
  return expiresAt.toISOString();
}
