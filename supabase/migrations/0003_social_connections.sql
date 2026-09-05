-- Social account connections (Instagram / TikTok) per brand owner + extends posts
-- so imported social posts land in the same table the brand's Posts tab reads.
-- Access tokens are only readable by the brand owner (RLS below). Server routes
-- run with the user's session (RLS) or a service role from Vercel env — never
-- expose the tokens client-side.

-- ============================================================================
-- SOCIAL CONNECTIONS
-- ============================================================================
create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.brands(slug) on delete cascade,
  provider text not null check (provider in ('instagram','tiktok')),
  external_user_id text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  username text,
  scope text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (brand_slug, provider)
);
create index if not exists idx_social_connections_brand on public.social_connections(brand_slug);

alter table public.social_connections enable row level security;

-- Brand owner can see/modify only their own connection rows. No public read.
drop policy if exists "social_connections select owner" on public.social_connections;
create policy "social_connections select owner" on public.social_connections for select using (
  exists (select 1 from public.brands b where b.slug = social_connections.brand_slug and b.owner_id = auth.uid())
);
drop policy if exists "social_connections insert owner" on public.social_connections;
create policy "social_connections insert owner" on public.social_connections for insert with check (
  exists (select 1 from public.brands b where b.slug = social_connections.brand_slug and b.owner_id = auth.uid())
);
drop policy if exists "social_connections update owner" on public.social_connections;
create policy "social_connections update owner" on public.social_connections for update using (
  exists (select 1 from public.brands b where b.slug = social_connections.brand_slug and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.brands b where b.slug = social_connections.brand_slug and b.owner_id = auth.uid())
);
drop policy if exists "social_connections delete owner" on public.social_connections;
create policy "social_connections delete owner" on public.social_connections for delete using (
  exists (select 1 from public.brands b where b.slug = social_connections.brand_slug and b.owner_id = auth.uid())
);

-- ============================================================================
-- EXTEND posts: source + external identity + video url
-- ============================================================================
alter table public.posts add column if not exists source text not null default 'kindred';
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'posts_source_check'
  ) then
    alter table public.posts add constraint posts_source_check check (source in ('kindred','instagram','tiktok'));
  end if;
end $$;

alter table public.posts add column if not exists external_id text;
alter table public.posts add column if not exists external_url text;
alter table public.posts add column if not exists video_url text;

-- Idempotent import: (brand, source, external_id) is unique when external_id is set.
create unique index if not exists idx_posts_external
  on public.posts(brand_slug, source, external_id)
  where external_id is not null;

create index if not exists idx_posts_brand_source on public.posts(brand_slug, source);
