create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  tier text not null default 'trial' check (tier in ('trial', 'maker', 'studio')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text
);

create table if not exists public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
  display_name text,
  ai_actions_used integer not null default 0,
  ai_actions_reset_at timestamptz,
  onboarding_complete boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, tier, trial_started_at, trial_ends_at)
  values (
    new.id,
    new.email,
    'trial',
    now(),
    now() + interval '90 days'
  );
  insert into public.profiles (id, ai_actions_reset_at)
  values (new.id, date_trunc('month', now()) + interval '1 month');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
