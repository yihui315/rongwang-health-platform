import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var __rongwangPgPool: Pool | undefined;
}

export function getDatabaseUrl(): string | null {
  return process.env.DATABASE_URL || null;
}

export function shouldUsePostgresRepository(): boolean {
  if (process.env.RONGWANG_REPOSITORY === "mock") return false;
  if (process.env.RONGWANG_REPOSITORY === "postgres") return true;
  return Boolean(process.env.DATABASE_URL);
}

export function getPgPool(): Pool {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    throw new Error("DATABASE_URL is required when PostgreSQL repository is enabled");
  }

  globalThis.__rongwangPgPool ??= new Pool({ connectionString });
  return globalThis.__rongwangPgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = []
): Promise<QueryResult<T>> {
  return getPgPool().query<T>(text, values);
}

export type TransactionClient = Pick<PoolClient, "query">;

export async function withTransaction<T>(fn: (client: TransactionClient) => Promise<T>): Promise<T> {
  const client = await getPgPool().connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
