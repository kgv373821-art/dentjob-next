-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v6 (채용 상세정보 필드)
-- schema.sql ~ schema_v5.sql 적용 후 이어서 실행하세요.
-- 아래 컬럼은 2026-08-03 다른 세션에서 Supabase에 이미 직접 적용되어 있었고,
-- 이 파일은 저장소 기록용으로 추가합니다 (재실행해도 안전 — if not exists).
-- ============================================================

alter table job_posts add column if not exists duties text;
alter table job_posts add column if not exists employment_type varchar;
alter table job_posts add column if not exists headcount varchar;
alter table job_posts add column if not exists education_level varchar;
alter table job_posts add column if not exists career_requirement varchar;
alter table job_posts add column if not exists recruit_start_date date;
alter table job_posts add column if not exists recruit_end_date date;
alter table job_posts add column if not exists application_method varchar;
alter table job_posts add column if not exists application_email varchar;
alter table job_posts add column if not exists required_documents varchar;
alter table job_posts add column if not exists work_address varchar;
alter table job_posts add column if not exists nearby_station varchar;
