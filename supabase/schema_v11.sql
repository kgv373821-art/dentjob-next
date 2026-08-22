-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v11 (계정 없는 공고 대리 등록 허용)
-- schema.sql ~ schema_v10.sql 적용 후 이어서 실행하세요.
-- ============================================================

-- 관리자가 아직 회원가입하지 않은 치과/기공소를 대신해 "계정 연결 없이" 공고를 등록할 수 있도록
-- clinic_id/lab_id가 둘 다 null인 경우도 허용합니다. (기존에는 둘 중 정확히 하나만 허용했음)
alter table job_posts drop constraint if exists chk_owner;
alter table job_posts add constraint chk_owner check (
  not (clinic_id is not null and lab_id is not null)
);
