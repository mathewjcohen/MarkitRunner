-- 0=Sunday, 1=Monday, ..., 6=Saturday; default Monday
alter table public.profiles
  add column if not exists week_start_day smallint not null default 1;
