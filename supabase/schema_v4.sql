-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v4 (광고 관리)
-- schema.sql, schema_v2.sql, schema_v3.sql 적용 후 이어서 실행하세요.
-- ============================================================

do $$ begin
  create type ad_position as enum ('main_top', 'main_mid', 'main_bottom', 'sidebar');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ad_type as enum ('image', 'youtube', 'game', 'blog');
exception when duplicate_object then null; end $$;

create table if not exists ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image text,
  link text not null,
  position ad_position not null default 'main_top',
  type ad_type not null default 'image',
  start_date date,
  end_date date,
  priority integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_ads_position_active on ads(position, active);

alter table ads enable row level security;

create policy "ads_select_all" on ads for select using (true);
create policy "ads_admin_insert" on ads for insert with check (my_role() = 'admin');
create policy "ads_admin_update" on ads for update using (my_role() = 'admin');
create policy "ads_admin_delete" on ads for delete using (my_role() = 'admin');

-- 광고 이미지를 담을 공개 버킷 (업로드/삭제는 관리자만)
insert into storage.buckets (id, name, public)
values ('ad-images', 'ad-images', true)
on conflict (id) do nothing;

create policy "ad_images_public_select" on storage.objects
  for select using (bucket_id = 'ad-images');

create policy "ad_images_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'ad-images' and my_role() = 'admin');

create policy "ad_images_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'ad-images' and my_role() = 'admin');

create policy "ad_images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'ad-images' and my_role() = 'admin');
