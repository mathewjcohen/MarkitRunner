alter table public.channels
  add column if not exists platform_notes text;

alter table public.tasks
  add column if not exists replaced_at timestamptz;
