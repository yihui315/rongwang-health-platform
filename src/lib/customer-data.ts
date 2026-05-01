import { getSupabase } from '@/lib/supabase';

interface CustomerRowsResult {
  data: unknown[] | null;
  error: Error | null;
}

type FilterableSelect = PromiseLike<CustomerRowsResult> & {
  eq?: (column: string, value: string) => PromiseLike<CustomerRowsResult>;
};

function belongsToCustomer(row: unknown, userId: string) {
  return Boolean(
    row &&
      typeof row === 'object' &&
      (row as Record<string, unknown>).user_id === userId,
  );
}

export async function selectRowsByCustomerId(table: string, userId: string) {
  const query = getSupabase().from(table).select('*') as unknown as FilterableSelect;

  if (typeof query.eq === 'function') {
    return query.eq('user_id', userId);
  }

  const result = await query;
  return {
    ...result,
    data: (result.data ?? []).filter((row) => belongsToCustomer(row, userId)),
  };
}
