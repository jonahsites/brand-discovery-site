-- Kindred initial schema. Auth users live in auth.users (Supabase built-in);
-- this file only creates the shopper profile and its tables that hang off the user id.
-- Run in the Supabase SQL editor, or via `supabase db push` after linking the project.

create extension if not exists "pgcrypto";

-- Profiles: one row per auth.users row. Populated by a trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null unique,
  provider text not null default 'email',
  onboarded boolean not null default false,
  referral_code text unique,
  referred_by text,
  points_balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Onboarding: one row per style tag the shopper picked.
create table if not exists public.style_tags (
  user_id uuid references public.profiles on delete cascade,
  tag text not null,
  primary key (user_id, tag)
);

-- Sizes: one row per shopper.
create table if not exists public.sizes (
  user_id uuid primary key references public.profiles on delete cascade,
  tops text,
  waist text,
  shoe text
);

-- Follows and saves: the two lists that drive the Following feed and Saved tab.
create table if not exists public.follows (
  user_id uuid references public.profiles on delete cascade,
  brand_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, brand_slug)
);
create table if not exists public.saves (
  user_id uuid references public.profiles on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

-- Row Level Security: a user only sees and edits their own rows.
alter table public.profiles enable row level security;
alter table public.style_tags enable row level security;
alter table public.sizes enable row level security;
alter table public.follows enable row level security;
alter table public.saves enable row level security;

drop policy if exists "read own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own style_tags" on public.style_tags;
create policy "own style_tags" on public.style_tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sizes" on public.sizes;
create policy "own sizes" on public.sizes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own follows" on public.follows;
create policy "own follows" on public.follows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own saves" on public.saves;
create policy "own saves" on public.saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- On sign-up: mirror the auth row into public.profiles.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, provider, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    regexp_replace(lower(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))), '[^a-z0-9]+', '-', 'g')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
