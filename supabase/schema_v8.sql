-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v8 (기공소 채용공고 연락처 필드)
-- schema.sql ~ schema_v7.sql 적용 후 이어서 실행하세요.
-- ============================================================

alter table job_posts add column if not exists homepage_url varchar;
alter table job_posts add column if not exists hr_contact_name varchar;
alter table job_posts add column if not exists hr_contact_phone varchar;
alter table job_posts add column if not exists contact_email varchar;
