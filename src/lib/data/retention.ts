const DEFAULT_SENSITIVE_HEALTH_RETENTION_DAYS = 180;

export function getSensitiveHealthRetentionDays() {
  const parsed = Number.parseInt(process.env.SENSITIVE_HEALTH_RETENTION_DAYS ?? "", 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return DEFAULT_SENSITIVE_HEALTH_RETENTION_DAYS;
}

export function getRetentionExpiresAt(from = new Date()) {
  const expiresAt = new Date(from);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + getSensitiveHealthRetentionDays());
  return expiresAt;
}
