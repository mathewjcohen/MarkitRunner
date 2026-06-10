create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  type text not null,
  primary_goal text not null default '',
  success_definition text not null default '',
  content_themes text[] not null default '{}',
  cold_start_notes text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index on public.businesses (user_id);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  label text,
  cadence text not null default 'weekly'
    check (cadence in ('daily', 'weekly', '2x_week', 'monthly')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index on public.channels (business_id);
create index on public.channels (user_id);
