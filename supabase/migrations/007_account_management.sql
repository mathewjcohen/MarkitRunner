alter table public.users add column if not exists deletion_scheduled_at timestamptz;
