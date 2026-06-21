create table public.rejected_ideas (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  rejected_at timestamptz not null default now()
);

create index on public.rejected_ideas (business_id);

alter table public.rejected_ideas enable row level security;

create policy "Users can read their own rejected ideas"
  on public.rejected_ideas for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rejected ideas"
  on public.rejected_ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own rejected ideas"
  on public.rejected_ideas for delete
  using (auth.uid() = user_id);
