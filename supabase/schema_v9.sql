-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v9 (모집구분 enum 값 변경)
-- schema.sql ~ schema_v8.sql 적용 후 이어서 실행하세요.
-- ============================================================

-- lab_job_category enum의 '기사모집' 값을 '정직원'으로 이름 변경
-- (코드에서 라벨을 "기사모집" → "정직원"으로 바꾸면서 DB enum도 맞춰야 했음)
alter type lab_job_category rename value '기사모집' to '정직원';

-- lab_specialty enum에 '디자인' 값 추가
-- (코드(LAB_SPECIALTIES)에 "디자인"을 추가할 때 DB enum도 함께 맞춰야 했음)
alter type lab_specialty add value if not exists '디자인';
