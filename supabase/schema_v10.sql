-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v10 (관리자 대리 공고 등록)
-- schema.sql ~ schema_v9.sql 적용 후 이어서 실행하세요.
-- ============================================================

-- 관리자가 치과/기공소를 대신해 공고를 등록할 수 있도록 insert 정책에 admin 허용을 추가합니다.
drop policy if exists "jobposts_insert_owner" on job_posts;
create policy "jobposts_insert_owner" on job_posts for insert
  with check (
    my_role() = 'admin'
    or exists (select 1 from clinics c where c.id = job_posts.clinic_id and c.user_id = auth.uid())
    or exists (select 1 from labs l where l.id = job_posts.lab_id and l.user_id = auth.uid())
  );
