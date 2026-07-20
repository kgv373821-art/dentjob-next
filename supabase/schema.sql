-- ============================================================
-- Job2804 덴트잡 서울경기 — Supabase 스키마 (RLS 포함)
-- Supabase SQL Editor에 그대로 붙여넣어 실행하세요.
-- ============================================================

-- ---------- ENUM TYPES ----------
create type user_role as enum ('clinic', 'lab', 'seeker', 'admin');

create type job_type as enum (
  '치과의사','치과위생사','치과조무사','치과기공사','상담실장','데스크','CAD/CAM','기공소 직원'
);

create type lab_specialty as enum (
  '보철 기공','임플란트 기공','교정장치 기공','CAD/CAM 디자인','심미보철(지르코니아)','총의치 기공'
);

create type lab_job_category as enum ('기사모집', '아르바이트모집', '외주모집');
create type post_status as enum ('draft', 'pending', 'approved', 'rejected', 'closed');
create type application_status as enum ('applied', 'reviewing', 'interview', 'passed', 'failed', 'withdrawn');
create type product_code as enum ('general_post','premium_post','main_exposure','urgent_post','banner_ad','talent_recommend');
create type payment_status as enum ('pending', 'paid', 'failed', 'canceled', 'refunded');
create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- ---------- PROFILES (auth.users 확장) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'seeker',
  name varchar(100) not null,
  phone varchar(20),
  created_at timestamptz not null default now()
);

-- 회원가입 시 auth.users -> profiles 자동 생성 (role/name은 signUp의 options.data로 전달)
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, role, name, phone)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'seeker'),
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- CLINICS ----------
create table clinics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  clinic_name varchar(150) not null,
  region_main varchar(30) not null,
  address varchar(255),
  intro text,
  photo_url text,
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- ---------- LABS (기공소) — 치과기공사 채용 축 강화를 위해 1급 엔티티로 분리 ----------
create table labs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lab_name varchar(150) not null,
  region_main varchar(30) not null,
  address varchar(255),
  specialties lab_specialty[] not null default '{}',
  has_cadcam boolean not null default false,
  intro text,
  photo_url text,
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- ---------- SEEKERS ----------
create table seekers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  desired_job job_type,
  lab_specialty lab_specialty,
  career_years smallint not null default 0,
  desired_region varchar(30),
  desired_pay_min int,
  certifications text,
  self_intro text,
  portfolio_url text,
  photo_url text,
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- ---------- JOB POSTS ----------
create table job_posts (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  lab_id uuid references labs(id) on delete cascade,
  job_type job_type not null,
  lab_specialty lab_specialty,
  lab_category lab_job_category,
  title varchar(200) not null,
  region varchar(30) not null,
  pay_min int not null,
  pay_note varchar(100),
  work_hours varchar(60),
  welfare text[] not null default '{}',
  description text,
  status post_status not null default 'pending',
  is_urgent boolean not null default false,
  is_main_exposed boolean not null default false,
  view_count int not null default 0,
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_owner check (
    (clinic_id is not null and lab_id is null) or (clinic_id is null and lab_id is not null)
  )
);
create index idx_jobposts_region on job_posts(region);
create index idx_jobposts_jobtype on job_posts(job_type);
create index idx_jobposts_status on job_posts(status);

-- ---------- APPLICATIONS ----------
create table applications (
  id uuid primary key default gen_random_uuid(),
  job_post_id uuid not null references job_posts(id) on delete cascade,
  seeker_id uuid not null references seekers(id) on delete cascade,
  status application_status not null default 'applied',
  message text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_post_id, seeker_id)
);

-- ---------- INTERVIEWS ----------
create table interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  scheduled_at timestamptz not null,
  location varchar(255),
  memo text,
  created_at timestamptz not null default now()
);

-- ---------- PAYMENTS ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  job_post_id uuid references job_posts(id) on delete set null,
  product_code product_code not null,
  amount int not null,
  toss_order_id varchar(64) not null unique,
  toss_payment_key varchar(200),
  status payment_status not null default 'pending',
  raw_response jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ---------- BANNER ADS ----------
create table banner_ads (
  id uuid primary key default gen_random_uuid(),
  advertiser varchar(150) not null,
  slot varchar(50) not null,
  image_url text,
  link_url text,
  starts_at date not null,
  ends_at date not null,
  payment_id uuid references payments(id),
  created_at timestamptz not null default now()
);

-- ---------- SMS LOGS ----------
create table sms_logs (
  id uuid primary key default gen_random_uuid(),
  target_group varchar(50) not null,
  recipient_count int not null default 0,
  content text not null,
  sent_by uuid references profiles(id),
  provider varchar(20) not null default 'ncp_sens',
  provider_response jsonb,
  created_at timestamptz not null default now()
);

-- ---------- REPORTS ----------
create table reports (
  id uuid primary key default gen_random_uuid(),
  target_type varchar(20) not null,
  target_id uuid not null,
  reason text not null,
  reporter_id uuid references profiles(id),
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

-- ---------- NOTICES ----------
create table notices (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------- 치과기공사 전문관 뷰 ----------
create view v_lab_job_posts as
select jp.*, l.lab_name, l.region_main as lab_region, l.specialties as lab_specialties, l.has_cadcam
from job_posts jp
join labs l on l.id = jp.lab_id
where jp.status = 'approved';

-- ---------- updated_at 자동 갱신 ----------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_seekers_updated before update on seekers for each row execute function set_updated_at();
create trigger trg_jobposts_updated before update on job_posts for each row execute function set_updated_at();
create trigger trg_applications_updated before update on applications for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table clinics enable row level security;
alter table labs enable row level security;
alter table seekers enable row level security;
alter table job_posts enable row level security;
alter table applications enable row level security;
alter table interviews enable row level security;
alter table payments enable row level security;
alter table banner_ads enable row level security;
alter table sms_logs enable row level security;
alter table reports enable row level security;
alter table notices enable row level security;

-- 헬퍼: 현재 로그인한 사용자의 role
create or replace function my_role() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- profiles: 본인 조회/수정, 관리자는 전체
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or my_role() = 'admin');
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- clinics: 전체 공개 조회, 소유자만 수정/삽입
create policy "clinics_select_all" on clinics for select using (true);
create policy "clinics_insert_own" on clinics for insert with check (user_id = auth.uid());
create policy "clinics_update_own" on clinics for update using (user_id = auth.uid());

-- labs: 전체 공개 조회, 소유자만 수정/삽입 (치과기공사 검색을 위해 공개 조회 필수)
create policy "labs_select_all" on labs for select using (true);
create policy "labs_insert_own" on labs for insert with check (user_id = auth.uid());
create policy "labs_update_own" on labs for update using (user_id = auth.uid());

-- seekers: 전체 공개 조회(치과/기공소가 인재 검색), 본인만 수정
create policy "seekers_select_all" on seekers for select using (true);
create policy "seekers_insert_own" on seekers for insert with check (user_id = auth.uid());
create policy "seekers_update_own" on seekers for update using (user_id = auth.uid());

-- job_posts: 승인된 공고는 전체 공개, 작성자/관리자는 본인 것 전체 조회 가능
create policy "jobposts_select_approved" on job_posts for select
  using (
    status = 'approved'
    or my_role() = 'admin'
    or exists (select 1 from clinics c where c.id = job_posts.clinic_id and c.user_id = auth.uid())
    or exists (select 1 from labs l where l.id = job_posts.lab_id and l.user_id = auth.uid())
  );
create policy "jobposts_insert_owner" on job_posts for insert
  with check (
    exists (select 1 from clinics c where c.id = job_posts.clinic_id and c.user_id = auth.uid())
    or exists (select 1 from labs l where l.id = job_posts.lab_id and l.user_id = auth.uid())
  );
create policy "jobposts_update_owner_or_admin" on job_posts for update
  using (
    my_role() = 'admin'
    or exists (select 1 from clinics c where c.id = job_posts.clinic_id and c.user_id = auth.uid())
    or exists (select 1 from labs l where l.id = job_posts.lab_id and l.user_id = auth.uid())
  );
create policy "jobposts_delete_owner_or_admin" on job_posts for delete
  using (
    my_role() = 'admin'
    or exists (select 1 from clinics c where c.id = job_posts.clinic_id and c.user_id = auth.uid())
    or exists (select 1 from labs l where l.id = job_posts.lab_id and l.user_id = auth.uid())
  );

-- applications: 지원자 본인, 공고 소유자, 관리자만 조회
create policy "applications_select" on applications for select
  using (
    my_role() = 'admin'
    or exists (select 1 from seekers s where s.id = applications.seeker_id and s.user_id = auth.uid())
    or exists (
      select 1 from job_posts jp
      left join clinics c on c.id = jp.clinic_id
      left join labs l on l.id = jp.lab_id
      where jp.id = applications.job_post_id and (c.user_id = auth.uid() or l.user_id = auth.uid())
    )
  );
create policy "applications_insert_seeker" on applications for insert
  with check (exists (select 1 from seekers s where s.id = applications.seeker_id and s.user_id = auth.uid()));
create policy "applications_update_owner" on applications for update
  using (
    my_role() = 'admin'
    or exists (
      select 1 from job_posts jp
      left join clinics c on c.id = jp.clinic_id
      left join labs l on l.id = jp.lab_id
      where jp.id = applications.job_post_id and (c.user_id = auth.uid() or l.user_id = auth.uid())
    )
  );

-- interviews: 지원 관련 당사자만
create policy "interviews_select" on interviews for select
  using (
    my_role() = 'admin'
    or exists (
      select 1 from applications a
      join seekers s on s.id = a.seeker_id
      where a.id = interviews.application_id and s.user_id = auth.uid()
    )
    or exists (
      select 1 from applications a
      join job_posts jp on jp.id = a.job_post_id
      left join clinics c on c.id = jp.clinic_id
      left join labs l on l.id = jp.lab_id
      where a.id = interviews.application_id and (c.user_id = auth.uid() or l.user_id = auth.uid())
    )
  );
create policy "interviews_insert_owner" on interviews for insert
  with check (
    exists (
      select 1 from applications a
      join job_posts jp on jp.id = a.job_post_id
      left join clinics c on c.id = jp.clinic_id
      left join labs l on l.id = jp.lab_id
      where a.id = interviews.application_id and (c.user_id = auth.uid() or l.user_id = auth.uid())
    )
  );

-- payments: 본인 것만
create policy "payments_select_own" on payments for select using (user_id = auth.uid() or my_role() = 'admin');
create policy "payments_insert_own" on payments for insert with check (user_id = auth.uid());

-- banner_ads, notices: 전체 공개 조회, 관리자만 작성
create policy "ads_select_all" on banner_ads for select using (true);
create policy "ads_admin_write" on banner_ads for insert with check (my_role() = 'admin');
create policy "notices_select_all" on notices for select using (true);
create policy "notices_admin_write" on notices for insert with check (my_role() = 'admin');

-- reports: 작성자 본인 + 관리자
create policy "reports_insert_own" on reports for insert with check (reporter_id = auth.uid());
create policy "reports_select_admin" on reports for select using (my_role() = 'admin' or reporter_id = auth.uid());
create policy "reports_update_admin" on reports for update using (my_role() = 'admin');

-- sms_logs: 관리자만
create policy "sms_admin_only" on sms_logs for all using (my_role() = 'admin');

-- ---------- 치과기공사 전문관 조회 함수 (RLS 우회 없이 안전하게 집계) ----------
create or replace function lab_job_stats() returns table(lab_posts bigint, clinic_posts bigint) as $$
  select
    count(*) filter (where lab_id is not null) as lab_posts,
    count(*) filter (where clinic_id is not null) as clinic_posts
  from job_posts where status = 'approved';
$$ language sql stable;

-- ---------- 조회수 증가 (공개 공고 상세페이지 방문 시 익명 사용자도 호출 가능해야 하므로 security definer) ----------
create or replace function increment_view_count(post_id uuid) returns void as $$
  update job_posts set view_count = view_count + 1 where id = post_id and status = 'approved';
$$ language sql security definer;

grant execute on function increment_view_count(uuid) to anon, authenticated;
grant execute on function lab_job_stats() to authenticated;
