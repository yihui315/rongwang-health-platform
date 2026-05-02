/**
 * Supabase client — server + browser factories
 *
 * Install:
 *   npm install @supabase/supabase-js @supabase/ssr
 *
 * ENV (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=
 *   SUPABASE_SERVICE_ROLE_KEY=   (server only, for admin routes)
 *
 * Usage:
 *   // In a server component / route handler:
 *   import { getSupabaseServer } from '@/lib/supabase';
 *   const supabase = getSupabaseServer();
 *
 *   // In a client component:
 *   import { getSupabaseBrowser } from '@/lib/supabase';
 *   const supabase = getSupabaseBrowser();
 *
 * If env vars are missing the factory returns a harmless stub so
 * `next build` succeeds before real keys are provisioned.
 */

import type { PlanSlug } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Row type definitions                                                       */
/* -------------------------------------------------------------------------- */

export interface HealthProfileRow {
  id: string;
  user_id: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  goals: string[];
  conditions: string[];
  allergies: string[];
  lifestyle: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface QuizResultRow {
  id: string;
  user_id: string | null;
  answers: Array<{ questionId: number; answer: string }>;
  recommendations: PlanSlug[];
  ai_summary: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  items: Array<{ slug: string; name: string; price: number; quantity: number }>;
  total: number;
  customer: Record<string, string>;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_slug: PlanSlug;
  tier: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled';
  next_delivery: string;
  started_at: string;
}

export interface HealthMetricRow {
  id: string;
  user_id: string;
  metric: 'energy' | 'sleep' | 'stress' | 'immunity';
  value: number;
  recorded_at: string;
}

export interface Database {
  public: {
    Tables: {
      health_profiles: { Row: HealthProfileRow; Insert: Partial<HealthProfileRow>; Update: Partial<HealthProfileRow> };
      quiz_results: { Row: QuizResultRow; Insert: Partial<QuizResultRow>; Update: Partial<QuizResultRow> };
      orders: { Row: OrderRow; Insert: Partial<OrderRow>; Update: Partial<OrderRow> };
      subscriptions: { Row: SubscriptionRow; Insert: Partial<SubscriptionRow>; Update: Partial<SubscriptionRow> };
      health_metrics: { Row: HealthMetricRow; Insert: Partial<HealthMetricRow>; Update: Partial<HealthMetricRow> };
    };
  };
}

/* -------------------------------------------------------------------------- */
/*  SQL schema — paste into Supabase SQL editor on project bootstrap.          */
/* -------------------------------------------------------------------------- */

export const SUPABASE_SCHEMA_SQL = /* sql */ `
-- 荣旺商城 Supabase schema v1
create extension if not exists "uuid-ossp";

create table if not exists public.health_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  age int,
  gender text check (gender in ('male','female','other')),
  goals text[] default '{}',
  conditions text[] default '{}',
  allergies text[] default '{}',
  lifestyle jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  answers jsonb not null,
  recommendations text[] not null,
  ai_summary text,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null,
  total numeric(10,2) not null,
  customer jsonb not null,
  status text default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_slug text not null,
  tier text not null check (tier in ('monthly','quarterly','yearly')),
  status text default 'active' check (status in ('active','paused','cancelled')),
  next_delivery date,
  started_at timestamptz default now()
);

create table if not exists public.health_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  metric text check (metric in ('energy','sleep','stress','immunity')),
  value int check (value between 0 and 100),
  recorded_at timestamptz default now()
);

create table if not exists public.family_members (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  relation text,
  age int,
  plan_slug text,
  created_at timestamptz default now()
);

-- RLS
alter table public.health_profiles enable row level security;
alter table public.quiz_results enable row level security;
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;
alter table public.health_metrics enable row level security;
alter table public.family_members enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='health_profiles' and policyname='own health_profiles') then
    create policy "own health_profiles" on public.health_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='quiz_results' and policyname='own quiz_results') then
    create policy "own quiz_results" on public.quiz_results for all using (auth.uid() = user_id or user_id is null) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='orders' and policyname='own orders') then
    create policy "own orders" on public.orders for all using (auth.uid() = user_id or user_id is null) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='subscriptions' and policyname='own subscriptions') then
    create policy "own subscriptions" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='health_metrics' and policyname='own health_metrics') then
    create policy "own health_metrics" on public.health_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='family_members' and policyname='own family_members') then
    create policy "own family_members" on public.family_members for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
  end if;
end $$;
`;

/* -------------------------------------------------------------------------- */
/*  Lazy-loaded real client — falls back to stub if package missing            */
/* -------------------------------------------------------------------------- */

// Minimal shape we actually use across the app. Keeps call-sites typed.
export interface MinimalClient {
  isStub: boolean;
  from: (table: string) => {
    select: (cols?: string) => Promise<{ data: unknown[] | null; error: Error | null }>;
    insert: (row: unknown) => Promise<{ data: unknown | null; error: Error | null }>;
    update: (row: unknown) => Promise<{ data: unknown | null; error: Error | null }>;
    delete: () => Promise<{ data: unknown | null; error: Error | null }>;
  };
  auth?: {
    signUp: (creds: { email: string; password: string }) => Promise<{ data: unknown; error: Error | null }>;
    signInWithPassword: (creds: { email: string; password: string }) => Promise<{ data: unknown; error: Error | null }>;
    getUser?: (jwt?: string) => Promise<{ data: { user: unknown | null }; error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
  };
}

const stubClient: MinimalClient = {
  isStub: true,
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
  auth: {
    signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
    getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
  },
};

let cachedServer: MinimalClient | null = null;
let cachedBrowser: MinimalClient | null = null;

/**
 * Server-side Supabase client (uses service role when available).
 * Call inside route handlers, server actions, or server components.
 */
export function getSupabaseServer(): MinimalClient {
  if (cachedServer) return cachedServer;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    cachedServer = stubClient;
    return cachedServer;
  }

  try {
    // Dynamic require — package may not be installed yet in some envs.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js');
    cachedServer = createClient(url, key, {
      auth: { persistSession: false },
    }) as unknown as MinimalClient;
    cachedServer.isStub = false;
  } catch {
    cachedServer = stubClient;
  }
  return cachedServer;
}

/**
 * Browser Supabase client (anon key only, session persists via cookies).
 */
export function getSupabaseBrowser(): MinimalClient {
  if (cachedBrowser) return cachedBrowser;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    cachedBrowser = stubClient;
    return cachedBrowser;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js');
    cachedBrowser = createClient(url, key) as unknown as MinimalClient;
    cachedBrowser.isStub = false;
  } catch {
    cachedBrowser = stubClient;
  }
  return cachedBrowser;
}

// Backwards-compat alias (previous callers used getSupabase)
export const getSupabase = getSupabaseServer;
