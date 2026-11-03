-- v14: 면접 제안 (치과·기공소 → 구직자)
-- 원장님·소장님이 인재정보에서 구직자에게 먼저 면접을 제안하고, 구직자가 수락했을 때만 실명·연락처를 공개한다.
-- 같은 김에, 사업자 계정이 구직자 profiles(전화번호 포함)를 통째로 읽을 수 있던 정책을 좁힌다:
-- 이제 자기 공고에 지원한 구직자, 또는 자기 제안을 수락한 구직자만 읽을 수 있다.
-- 인재정보 목록의 가린 이름("김OO")은 seeker_masked_names() 함수로 따로 내려준다.

create table if not exists job_offers (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references seekers(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  org_name text not null,
  job_post_id uuid references job_posts(id) on delete set null,
  message text not null,
  contact_phone text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

-- 같은 업체가 같은 구직자에게 답을 기다리는 제안을 여러 개 보내지 못하게 함
create unique index if not exists job_offers_one_pending
  on job_offers (seeker_id, sender_id) where status = 'pending';
create index if not exists job_offers_sender_idx on job_offers (sender_id, created_at desc);

alter table job_offers enable row level security;

create policy "job_offers_select" on job_offers for select using (
  sender_id = auth.uid()
  or exists (select 1 from seekers s where s.id = job_offers.seeker_id and s.user_id = auth.uid())
  or my_role() = 'admin'
);

create policy "job_offers_insert_employer" on job_offers for insert with check (
  sender_id = auth.uid()
  and status = 'pending'
  and my_role() in ('clinic', 'lab')
);

-- 수락·거절은 respond_job_offer() 함수로만 (구직자가 다른 칸을 못 바꾸게)

create or replace function respond_job_offer(offer_id uuid, accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update job_offers o
     set status = case when accept then 'accepted' else 'declined' end,
         responded_at = now()
   where o.id = offer_id
     and o.status = 'pending'
     and exists (select 1 from seekers s where s.id = o.seeker_id and s.user_id = auth.uid());
  if not found then
    raise exception '이미 답한 제안이거나 내 제안이 아닙니다.';
  end if;
end;
$$;

revoke all on function respond_job_offer(uuid, boolean) from public, anon;
grant execute on function respond_job_offer(uuid, boolean) to authenticated;

-- 사업자가 이 구직자의 profiles 행(실명·전화)을 볼 수 있는가
create or replace function employer_can_see_seeker(seeker_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from applications a
      join seekers s on s.id = a.seeker_id
      join job_posts j on j.id = a.job_post_id
      left join clinics c on c.id = j.clinic_id
      left join labs l on l.id = j.lab_id
     where s.user_id = seeker_user_id
       and (c.user_id = auth.uid() or l.user_id = auth.uid())
  ) or exists (
    select 1
      from job_offers o
      join seekers s on s.id = o.seeker_id
     where s.user_id = seeker_user_id
       and o.sender_id = auth.uid()
       and o.status = 'accepted'
  );
$$;

drop policy if exists "profiles_select_seeker_by_employer" on profiles;
create policy "profiles_select_seeker_by_employer" on profiles for select using (
  role = 'seeker'
  and my_role() in ('clinic', 'lab')
  and employer_can_see_seeker(id)
);

-- 인재정보 목록용 가린 이름 (사업자·관리자만)
create or replace function seeker_masked_names()
returns table (seeker_id uuid, masked_name text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id,
         case when coalesce(p.name, '') = '' then '구직자' else left(p.name, 1) || 'OO' end
    from seekers s
    join profiles p on p.id = s.user_id
   where my_role() in ('clinic', 'lab', 'admin');
$$;

revoke all on function seeker_masked_names() from public, anon;
grant execute on function seeker_masked_names() to authenticated;

-- 보낸 제안 목록 (수락된 제안만 구직자 실명·전화·이메일을 채워서 돌려줌)
create or replace function my_sent_offers()
returns table (
  id uuid,
  seeker_id uuid,
  status text,
  message text,
  job_title text,
  created_at timestamptz,
  responded_at timestamptz,
  masked_name text,
  desired_job text,
  career_years smallint,
  seeker_name text,
  seeker_phone text,
  seeker_email text
)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.seeker_id, o.status, o.message, j.title, o.created_at, o.responded_at,
         case when coalesce(p.name, '') = '' then '구직자' else left(p.name, 1) || 'OO' end,
         s.desired_job::text, s.career_years,
         case when o.status = 'accepted' then p.name::text end,
         case when o.status = 'accepted' then p.phone::text end,
         case when o.status = 'accepted' then u.email::text end
    from job_offers o
    join seekers s on s.id = o.seeker_id
    join profiles p on p.id = s.user_id
    left join auth.users u on u.id = p.id
    left join job_posts j on j.id = o.job_post_id
   where o.sender_id = auth.uid()
   order by o.created_at desc;
$$;

revoke all on function my_sent_offers() from public, anon;
grant execute on function my_sent_offers() to authenticated;
