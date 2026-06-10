create table if not exists public.metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  metric_key text not null,
  metric_label text not null,
  metric_category text not null
    check (metric_category in ('app', 'content', 'community', 'sales', 'custom')),
  value numeric not null,
  recorded_at timestamptz not null default now()
);

create index on public.metrics_snapshots (business_id, metric_key, recorded_at desc);
