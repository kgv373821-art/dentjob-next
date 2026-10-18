-- v13: 관리자 회원 관리 페이지(/admin/members)용 회원 명단 함수
-- 이메일은 auth.users에만 있어서 security definer 함수로 꺼내되, 관리자가 아니면 아무것도 돌려주지 않음.
create or replace function admin_members()
returns table (
  id uuid,
  role text,
  name text,
  phone text,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  org_name text,
  org_region text,
  org_address text,
  seeker_id uuid,
  desired_job text,
  lab_specialty text,
  career_years smallint,
  desired_region text,
  desired_pay_min integer,
  certifications text,
  self_intro text,
  portfolio_url text,
  resume_updated_at timestamptz,
  post_count bigint,
  application_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.role::text,
    p.name::text,
    p.phone::text,
    u.email::text,
    p.created_at,
    u.last_sign_in_at,
    coalesce(c.clinic_name, l.lab_name)::text,
    coalesce(c.region_main, l.region_main)::text,
    coalesce(c.address, l.address)::text,
    s.id,
    s.desired_job::text,
    s.lab_specialty::text,
    s.career_years,
    s.desired_region::text,
    s.desired_pay_min,
    s.certifications,
    s.self_intro,
    s.portfolio_url,
    s.updated_at,
    (select count(*) from job_posts j where (c.id is not null and j.clinic_id = c.id) or (l.id is not null and j.lab_id = l.id)),
    (select count(*) from applications a where s.id is not null and a.seeker_id = s.id)
  from profiles p
  left join auth.users u on u.id = p.id
  left join clinics c on c.user_id = p.id
  left join labs l on l.user_id = p.id
  left join seekers s on s.user_id = p.id
  where my_role() = 'admin'
  order by p.created_at desc;
$$;

revoke all on function admin_members() from public, anon;
grant execute on function admin_members() to authenticated;
