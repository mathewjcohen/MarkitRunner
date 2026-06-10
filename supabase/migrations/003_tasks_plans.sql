create table if not exists public.generated_plans (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  week_start date not null,
  plan_json jsonb not null,
  generated_at timestamptz not null default now(),
  model_used text not null
);

create index on public.generated_plans (business_id, week_start);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid references public.generated_plans(id) on delete set null,
  title text not null,
  description text,
  scheduled_date date not null,
  completed_at timestamptz,
  deferred_count integer not null default 0,
  ai_prompt_angle text,
  ai_prompt_opening text,
  ai_prompt_generated_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.tasks (user_id, scheduled_date);
create index on public.tasks (business_id);
