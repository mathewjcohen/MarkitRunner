alter table public.businesses add column if not exists archived_at timestamptz;
create index if not exists businesses_archived_at_idx on public.businesses (user_id, archived_at) where archived_at is not null;
