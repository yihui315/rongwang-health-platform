export function getDatabaseUrl() {
  return process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rongwang';
}
