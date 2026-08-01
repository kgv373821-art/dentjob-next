-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v3 (공고 사진 첨부)
-- schema.sql, schema_v2.sql 적용 후 이어서 실행하세요.
-- ============================================================

alter table job_posts add column if not exists image_urls text[] not null default '{}';

-- 채용공고 사진을 담을 공개 버킷
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true)
on conflict (id) do nothing;

create policy "job_photos_public_select" on storage.objects
  for select using (bucket_id = 'job-photos');

create policy "job_photos_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'job-photos');

create policy "job_photos_owner_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'job-photos' and owner = auth.uid());
