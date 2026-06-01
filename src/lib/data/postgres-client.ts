import { Pool } from 'pg';

import { getDatabaseUrl } from '@/src/lib/db';

let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  pool ??= new Pool({
    connectionString: getDatabaseUrl(),
  });
  return pool;
}
