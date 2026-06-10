-- users
alter table public.users enable row level security;
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

-- profiles
alter table public.profiles enable row level security;
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- businesses
alter table public.businesses enable row level security;
create policy "businesses: own rows" on public.businesses
  for all using (auth.uid() = user_id);

-- channels
alter table public.channels enable row level security;
create policy "channels: own rows" on public.channels
  for all using (auth.uid() = user_id);

-- tasks
alter table public.tasks enable row level security;
create policy "tasks: own rows" on public.tasks
  for all using (auth.uid() = user_id);

-- generated_plans
alter table public.generated_plans enable row level security;
create policy "generated_plans: own rows" on public.generated_plans
  for all using (auth.uid() = user_id);

-- metrics_snapshots
alter table public.metrics_snapshots enable row level security;
create policy "metrics_snapshots: own rows" on public.metrics_snapshots
  for all using (auth.uid() = user_id);

-- usage_events
alter table public.usage_events enable row level security;
create policy "usage_events: own rows" on public.usage_events
  for all using (auth.uid() = user_id);
