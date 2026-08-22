-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v12 (공고 업종 구분 저장 — 치과/기공소)
-- schema.sql ~ schema_v11.sql 적용 후 이어서 실행하세요.
-- ============================================================

-- 계정 연결 없이(clinic_id/lab_id 둘 다 null) 등록된 공고는 "치과용 폼인지 기공소용 폼인지"를
-- 구분할 방법이 없어서, 관리자 수정 화면에서 모집분야 목록이 잘못 표시되는 문제가 있었음.
-- clinic_id/lab_id와 별개로 org_type을 명시적으로 저장해서 항상 정확히 구분되게 함.
alter table job_posts add column if not exists org_type text check (org_type in ('clinic', 'lab'));

-- 기존 데이터 백필: 계정이 연결돼 있으면 그 계정 종류를 그대로 쓰고,
-- 연결이 없으면 업체명에 "기공소"가 들어가면 lab, 아니면 clinic으로 추정.
update job_posts set org_type = case
  when clinic_id is not null then 'clinic'
  when lab_id is not null then 'lab'
  when org_name ilike '%기공소%' then 'lab'
  else 'clinic'
end
where org_type is null;

alter table job_posts alter column org_type set not null;
alter table job_posts alter column org_type set default 'clinic';
