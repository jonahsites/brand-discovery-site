-- Kindred production polish:
--  1. Orders carry a shipping address (JSONB, per-order snapshot).
--  2. Profiles get a role column so we can gate admin-only writes.
--  3. Products get is_deleted so brand owners soft-delete their own catalogue
--     without needing the racy `removed_products` table (which we keep for old
--     rows but no longer write to).
--  4. Site_config writes are limited to admin profiles.
--  5. Reviews.insert requires an existing order_items row for the same buyer
--     and product — no more anonymous "verified buyer" claims.

-- ---------------- orders.shipping_address ----------------
alter table public.orders add column if not exists shipping_address jsonb;

-- ---------------- profiles.role --------------------------
alter table public.profiles add column if not exists role text not null default 'shopper';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles add constraint profiles_role_check check (role in ('shopper','brand','admin'));
  end if;
end $$;
create index if not exists idx_profiles_role on public.profiles(role) where role <> 'shopper';

-- ---------------- products.is_deleted --------------------
alter table public.products add column if not exists is_deleted boolean not null default false;
create index if not exists idx_products_active on public.products(brand_slug) where is_deleted = false;

-- Replace the read-all policy with one that hides soft-deleted rows for
-- everyone except the owning brand (so the brand can still un-delete).
drop policy if exists "products read all" on public.products;
create policy "products read active or owner" on public.products for select using (
  is_deleted = false
  or exists (select 1 from public.brands b where b.slug = products.brand_slug and b.owner_id = auth.uid())
);

-- ---------------- site_config admin-only writes -----------
drop policy if exists "site_config write auth" on public.site_config;
drop policy if exists "site_config write admin" on public.site_config;
create policy "site_config write admin" on public.site_config for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------- reviews: real buyers only ---------------
drop policy if exists "reviews insert self" on public.reviews;
drop policy if exists "reviews insert verified buyer" on public.reviews;
create policy "reviews insert verified buyer" on public.reviews for insert with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_slug = reviews.product_slug
      and o.buyer_id = auth.uid()
  )
);

-- ---------------- removed_products: neutralize -----------
-- Old rows may exist; keep the table for backwards compatibility but stop
-- accepting writes so nobody can weaponize the loose "auth.uid() is not null"
-- policy that shipped in 0002.
drop policy if exists "removed insert auth" on public.removed_products;
drop policy if exists "removed delete self" on public.removed_products;
create policy "removed insert none" on public.removed_products for insert with check (false);
create policy "removed delete none" on public.removed_products for delete using (false);
