create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action_type text not null
    check (action_type in ('weekly_plan', 'daily_focus', 'content_prompt', 'onboarding', 'cold_start')),
  business_id uuid references public.businesses(id) on delete set null,
  model_used text not null,
  created_at timestamptz not null default now()
);

create index on public.usage_events (user_id, created_at desc);
