-- Kindred brand-customization schema. Adds the knobs a brand can now turn on
-- their own page: a second accent color for gradients, a cover video, a
-- background pattern, one of four hero layouts, and a longer serif motto
-- distinct from the one-liner tagline.

alter table public.brands add column if not exists accent_2 text;
alter table public.brands add column if not exists cover_video text;
alter table public.brands add column if not exists pattern text not null default 'none';
alter table public.brands add column if not exists hero_style text not null default 'cover';
alter table public.brands add column if not exists motto text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'brands_pattern_check') then
    alter table public.brands add constraint brands_pattern_check
      check (pattern in ('none','grid','dot','arch','wave','grain'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'brands_hero_style_check') then
    alter table public.brands add constraint brands_hero_style_check
      check (hero_style in ('cover','portrait','split','story-first'));
  end if;
end $$;
