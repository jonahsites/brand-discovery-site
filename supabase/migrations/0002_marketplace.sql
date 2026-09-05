-- Kindred marketplace tables. Moves every shared-state field out of localStorage into Postgres.
-- Per-viewer state (bag, ship options, redeem, recent, session, promo/gift codes typed into the
-- bag) stays in localStorage; everything below is what one person creates and another sees.

-- ============================================================================
-- BRANDS
-- ============================================================================
create table if not exists public.brands (
  slug text primary key,
  owner_id uuid references auth.users on delete set null,
  name text not null,
  init text not null,
  city text not null default '',
  country text not null default '',
  tagline text not null default '',
  items integer not null default 0,
  followers integer not null default 0,
  verified boolean not null default false,
  tint text not null default '#EAEAE4',
  ink text not null default '#0F1113',
  founded integer,
  website text,
  story text,
  styles jsonb not null default '[]'::jsonb,
  moods jsonb not null default '[]'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  materials jsonb not null default '[]'::jsonb,
  values jsonb not null default '[]'::jsonb,
  made_in text not null default '',
  batch text not null default 'small',
  gender jsonb not null default '[]'::jsonb,
  price_min integer not null default 0,
  price_max integer not null default 0,
  size_min text not null default 'S',
  size_max text not null default 'XL',
  ships_to jsonb not null default '[]'::jsonb,
  ships_from text not null default '',
  logo text,
  cover text,
  verification text,
  accent text,
  bg text,
  headline_font text,
  intro text,
  quote text,
  quote_by text,
  plan text,
  created_at timestamptz not null default now()
);
create index if not exists idx_brands_owner on public.brands(owner_id);

alter table public.brands enable row level security;
drop policy if exists "brands read all" on public.brands;
create policy "brands read all" on public.brands for select using (true);
drop policy if exists "brands insert self" on public.brands;
create policy "brands insert self" on public.brands for insert with check (auth.uid() = owner_id);
drop policy if exists "brands update owner" on public.brands;
create policy "brands update owner" on public.brands for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "brands delete owner" on public.brands;
create policy "brands delete owner" on public.brands for delete using (auth.uid() = owner_id);

-- Profile knows which brand this user owns (nullable, one per user).
alter table public.profiles add column if not exists brand_slug text references public.brands(slug) on delete set null;

-- ============================================================================
-- PRODUCTS + soft-delete list of seed products that a brand-owner removed
-- ============================================================================
create table if not exists public.products (
  slug text primary key,
  brand_slug text not null references public.brands(slug) on delete cascade,
  name text not null,
  price integer not null,
  compare_at integer,
  tag text,
  tag_bg text,
  tag_fg text,
  category text not null default '',
  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  materials jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  stock integer,
  description text,
  image text,
  images jsonb not null default '[]'::jsonb,
  preorder timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_products_brand on public.products(brand_slug);
create index if not exists idx_products_category on public.products(category);
alter table public.products enable row level security;
drop policy if exists "products read all" on public.products;
create policy "products read all" on public.products for select using (true);
drop policy if exists "products write owner" on public.products;
create policy "products write owner" on public.products for all
  using (exists (select 1 from public.brands b where b.slug = products.brand_slug and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.slug = products.brand_slug and b.owner_id = auth.uid()));

create table if not exists public.removed_products (
  product_slug text primary key,
  removed_by uuid references auth.users on delete set null,
  removed_at timestamptz not null default now()
);
alter table public.removed_products enable row level security;
drop policy if exists "removed read all" on public.removed_products;
create policy "removed read all" on public.removed_products for select using (true);
drop policy if exists "removed insert auth" on public.removed_products;
create policy "removed insert auth" on public.removed_products for insert with check (auth.uid() is not null);
drop policy if exists "removed delete self" on public.removed_products;
create policy "removed delete self" on public.removed_products for delete using (removed_by = auth.uid());

-- ============================================================================
-- ORDERS
-- ============================================================================
create table if not exists public.orders (
  id text primary key,
  buyer_id uuid references auth.users on delete set null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  credit numeric(10,2),
  gift numeric(10,2),
  promo_code text,
  gift_code text,
  status text not null default 'Placed',
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_orders_buyer on public.orders(buyer_id, placed_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_slug text not null,
  name text not null,
  brand_slug text not null,
  variant text not null default '',
  qty integer not null,
  unit numeric(10,2) not null
);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_brand on public.order_items(brand_slug);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "orders read buyer or brand" on public.orders;
create policy "orders read buyer or brand" on public.orders for select using (
  buyer_id = auth.uid()
  or exists (
    select 1 from public.order_items oi
    join public.brands b on b.slug = oi.brand_slug
    where oi.order_id = orders.id and b.owner_id = auth.uid()
  )
);
drop policy if exists "orders insert buyer" on public.orders;
create policy "orders insert buyer" on public.orders for insert with check (buyer_id = auth.uid());
drop policy if exists "orders update brand" on public.orders;
create policy "orders update brand" on public.orders for update using (
  exists (
    select 1 from public.order_items oi
    join public.brands b on b.slug = oi.brand_slug
    where oi.order_id = orders.id and b.owner_id = auth.uid()
  )
);

drop policy if exists "order_items read via order" on public.order_items;
create policy "order_items read via order" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and (
    o.buyer_id = auth.uid()
    or exists (select 1 from public.brands b where b.slug = order_items.brand_slug and b.owner_id = auth.uid())
  ))
);
drop policy if exists "order_items insert buyer" on public.order_items;
create policy "order_items insert buyer" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_items.order_id and o.buyer_id = auth.uid())
);

-- ============================================================================
-- THREADS / MESSAGES
-- ============================================================================
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.brands(slug) on delete cascade,
  shopper_id uuid references auth.users on delete cascade,
  shopper_name text not null default '',
  created_at timestamptz not null default now(),
  unique (brand_slug, shopper_id)
);
create index if not exists idx_threads_brand on public.threads(brand_slug);
create index if not exists idx_threads_shopper on public.threads(shopper_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  from_role text not null check (from_role in ('shopper','brand')),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_thread on public.messages(thread_id, created_at);

alter table public.threads enable row level security;
alter table public.messages enable row level security;

drop policy if exists "threads read participants" on public.threads;
create policy "threads read participants" on public.threads for select using (
  shopper_id = auth.uid()
  or exists (select 1 from public.brands b where b.slug = threads.brand_slug and b.owner_id = auth.uid())
);
drop policy if exists "threads insert participant" on public.threads;
create policy "threads insert participant" on public.threads for insert with check (
  shopper_id = auth.uid()
  or exists (select 1 from public.brands b where b.slug = threads.brand_slug and b.owner_id = auth.uid())
);

drop policy if exists "messages read via thread" on public.messages;
create policy "messages read via thread" on public.messages for select using (
  exists (select 1 from public.threads t where t.id = messages.thread_id and (
    t.shopper_id = auth.uid() or exists (select 1 from public.brands b where b.slug = t.brand_slug and b.owner_id = auth.uid())
  ))
);
drop policy if exists "messages insert via thread" on public.messages;
create policy "messages insert via thread" on public.messages for insert with check (
  exists (select 1 from public.threads t where t.id = messages.thread_id and (
    t.shopper_id = auth.uid() or exists (select 1 from public.brands b where b.slug = t.brand_slug and b.owner_id = auth.uid())
  ))
);

-- ============================================================================
-- REVIEWS
-- ============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  author_id uuid references auth.users on delete set null,
  author_name text not null,
  init text not null default '',
  tint text not null default '#EAEAE4',
  stars integer not null check (stars between 1 and 5),
  fit integer not null check (fit between 1 and 3),
  body text not null default '',
  size text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_reviews_product on public.reviews(product_slug, created_at desc);
alter table public.reviews enable row level security;
drop policy if exists "reviews read all" on public.reviews;
create policy "reviews read all" on public.reviews for select using (true);
drop policy if exists "reviews insert self" on public.reviews;
create policy "reviews insert self" on public.reviews for insert with check (auth.uid() = author_id);
drop policy if exists "reviews delete self" on public.reviews;
create policy "reviews delete self" on public.reviews for delete using (auth.uid() = author_id);

-- ============================================================================
-- POSTS + LIKES
-- ============================================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.brands(slug) on delete cascade,
  caption text not null default '',
  image text,
  products jsonb not null default '[]'::jsonb,
  likes integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_posts_brand on public.posts(brand_slug, created_at desc);
alter table public.posts enable row level security;
drop policy if exists "posts read all" on public.posts;
create policy "posts read all" on public.posts for select using (true);
drop policy if exists "posts write owner" on public.posts;
create policy "posts write owner" on public.posts for all
  using (exists (select 1 from public.brands b where b.slug = posts.brand_slug and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.slug = posts.brand_slug and b.owner_id = auth.uid()));

create table if not exists public.post_likes (
  user_id uuid references auth.users on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
alter table public.post_likes enable row level security;
drop policy if exists "post_likes read all" on public.post_likes;
create policy "post_likes read all" on public.post_likes for select using (true);
drop policy if exists "post_likes write self" on public.post_likes;
create policy "post_likes write self" on public.post_likes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- LOOKBOOKS + FRAMES
-- ============================================================================
create table if not exists public.lookbooks (
  slug text primary key,
  brand_slug text not null references public.brands(slug) on delete cascade,
  title text not null,
  season text not null default '',
  blurb text not null default '',
  bg text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_lookbooks_brand on public.lookbooks(brand_slug);
alter table public.lookbooks enable row level security;
drop policy if exists "lookbooks read all" on public.lookbooks;
create policy "lookbooks read all" on public.lookbooks for select using (true);
drop policy if exists "lookbooks write owner" on public.lookbooks;
create policy "lookbooks write owner" on public.lookbooks for all
  using (exists (select 1 from public.brands b where b.slug = lookbooks.brand_slug and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.slug = lookbooks.brand_slug and b.owner_id = auth.uid()));

create table if not exists public.lookbook_frames (
  id uuid primary key default gen_random_uuid(),
  lookbook_slug text not null references public.lookbooks(slug) on delete cascade,
  position integer not null default 0,
  image text,
  h integer not null default 400,
  bg text,
  product_slug text,
  x numeric,
  y numeric,
  label text,
  created_at timestamptz not null default now()
);
create index if not exists idx_lookbook_frames_lookbook on public.lookbook_frames(lookbook_slug, position);
alter table public.lookbook_frames enable row level security;
drop policy if exists "lookbook_frames read all" on public.lookbook_frames;
create policy "lookbook_frames read all" on public.lookbook_frames for select using (true);
drop policy if exists "lookbook_frames write owner" on public.lookbook_frames;
create policy "lookbook_frames write owner" on public.lookbook_frames for all
  using (exists (select 1 from public.lookbooks l join public.brands b on b.slug = l.brand_slug where l.slug = lookbook_frames.lookbook_slug and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.lookbooks l join public.brands b on b.slug = l.brand_slug where l.slug = lookbook_frames.lookbook_slug and b.owner_id = auth.uid()));

-- ============================================================================
-- DROPS
-- ============================================================================
create table if not exists public.drops (
  id text primary key,
  brand_slug text not null references public.brands(slug) on delete cascade,
  title text not null,
  at_time timestamptz not null,
  pieces integer not null default 0,
  blurb text not null default '',
  products jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_drops_brand on public.drops(brand_slug);
create index if not exists idx_drops_at on public.drops(at_time);
alter table public.drops enable row level security;
drop policy if exists "drops read all" on public.drops;
create policy "drops read all" on public.drops for select using (true);
drop policy if exists "drops write owner" on public.drops;
create policy "drops write owner" on public.drops for all
  using (exists (select 1 from public.brands b where b.slug = drops.brand_slug and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.slug = drops.brand_slug and b.owner_id = auth.uid()));

-- ============================================================================
-- PROMOS
-- ============================================================================
create table if not exists public.promos (
  id text primary key,
  brand_slug text not null references public.brands(slug) on delete cascade,
  code text not null,
  pct integer not null,
  label text not null default '',
  scope text not null default 'all' check (scope in ('all','products')),
  products jsonb not null default '[]'::jsonb,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_promos_brand on public.promos(brand_slug);
create index if not exists idx_promos_code on public.promos(code);
alter table public.promos enable row level security;
drop policy if exists "promos read all" on public.promos;
create policy "promos read all" on public.promos for select using (true);
drop policy if exists "promos write owner" on public.promos;
create policy "promos write owner" on public.promos for all
  using (exists (select 1 from public.brands b where b.slug = promos.brand_slug and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.slug = promos.brand_slug and b.owner_id = auth.uid()));

-- ============================================================================
-- WAITLIST / PRICE ALERTS / DROP NOTIFIES
-- ============================================================================
create table if not exists public.waitlist (
  user_id uuid references auth.users on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);
alter table public.waitlist enable row level security;
drop policy if exists "own waitlist" on public.waitlist;
create policy "own waitlist" on public.waitlist for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.price_alerts (
  user_id uuid references auth.users on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);
alter table public.price_alerts enable row level security;
drop policy if exists "own price_alerts" on public.price_alerts;
create policy "own price_alerts" on public.price_alerts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.drop_notifies (
  user_id uuid references auth.users on delete cascade,
  drop_id text references public.drops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, drop_id)
);
alter table public.drop_notifies enable row level security;
drop policy if exists "own drop_notifies" on public.drop_notifies;
create policy "own drop_notifies" on public.drop_notifies for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- GIFT CARDS (code lookup via security-definer RPC)
-- ============================================================================
create table if not exists public.gift_cards (
  code text primary key,
  amount numeric(10,2) not null,
  balance numeric(10,2) not null,
  to_name text not null default '',
  from_name text not null default '',
  note text,
  buyer_id uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_gift_cards_buyer on public.gift_cards(buyer_id);
alter table public.gift_cards enable row level security;
drop policy if exists "gift_cards read buyer" on public.gift_cards;
create policy "gift_cards read buyer" on public.gift_cards for select using (buyer_id = auth.uid());
drop policy if exists "gift_cards insert buyer" on public.gift_cards;
create policy "gift_cards insert buyer" on public.gift_cards for insert with check (buyer_id = auth.uid());

-- Redeem-by-code is a security-definer RPC so anyone with the code can look it up and decrement
-- its balance without needing SELECT on the whole table.
create or replace function public.gift_card_lookup(p_code text)
returns table(code text, amount numeric, balance numeric, to_name text, from_name text, note text, created_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  return query select g.code, g.amount, g.balance, g.to_name, g.from_name, g.note, g.created_at
    from public.gift_cards g where g.code = p_code;
end; $$;

create or replace function public.gift_card_debit(p_code text, p_amount numeric)
returns numeric
language plpgsql security definer set search_path = public, pg_temp as $$
declare new_balance numeric;
begin
  if auth.uid() is null then raise exception 'auth required'; end if;
  update public.gift_cards set balance = greatest(0, round((balance - p_amount)::numeric, 2))
    where code = p_code returning balance into new_balance;
  return new_balance;
end; $$;

revoke execute on function public.gift_card_lookup(text) from public;
grant execute on function public.gift_card_lookup(text) to anon, authenticated;
revoke execute on function public.gift_card_debit(text, numeric) from public, anon;
grant execute on function public.gift_card_debit(text, numeric) to authenticated;

-- ============================================================================
-- VIEWS (per-brand and per-product counters, aggregated by day)
-- ============================================================================
create table if not exists public.subject_views (
  subject_type text not null check (subject_type in ('brand','product')),
  subject_id text not null,
  day date not null default (now() at time zone 'utc')::date,
  count integer not null default 0,
  primary key (subject_type, subject_id, day)
);
create index if not exists idx_subject_views_subject on public.subject_views(subject_type, subject_id);
alter table public.subject_views enable row level security;
drop policy if exists "views read all" on public.subject_views;
create policy "views read all" on public.subject_views for select using (true);

create or replace function public.increment_view(p_type text, p_id text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.subject_views (subject_type, subject_id, day, count)
  values (p_type, p_id, (now() at time zone 'utc')::date, 1)
  on conflict (subject_type, subject_id, day)
  do update set count = public.subject_views.count + 1;
end; $$;
revoke execute on function public.increment_view(text, text) from public;
grant execute on function public.increment_view(text, text) to anon, authenticated;

-- ============================================================================
-- SITE CONFIG (featured brand, etc.)
-- ============================================================================
create table if not exists public.site_config (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_config enable row level security;
drop policy if exists "site_config read all" on public.site_config;
create policy "site_config read all" on public.site_config for select using (true);
drop policy if exists "site_config write auth" on public.site_config;
-- Any authenticated user can flip the featured brand (brand-owners use this from their dashboard).
create policy "site_config write auth" on public.site_config for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ============================================================================
-- Realtime: enable for the tables the client subscribes to.
-- ============================================================================
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'threads') then
    alter publication supabase_realtime add table public.threads, public.messages, public.orders, public.order_items, public.posts, public.drops, public.brands, public.products;
  end if;
end $$;
