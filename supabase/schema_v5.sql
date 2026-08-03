-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v5 (공고 자동 만료)
-- schema.sql ~ schema_v4.sql 적용 후 이어서 실행하세요.
-- ============================================================

alter table job_posts add column if not exists expires_at timestamptz;

create index if not exists idx_jobposts_expires_at on job_posts(expires_at);
