-- ============================================================
-- Job2804 덴트잡 서울경기 — 스키마 v2 (차별화 기능 확장)
-- schema.sql 적용 후, Supabase SQL Editor에서 이어서 실행하세요.
-- ============================================================

-- ---------- 기공 전문분야 필터 확장 (치과기공 특화) ----------
-- 요청하신 8개 분야를 명시적으로 추가합니다. 기존 값은 하위호환을 위해 유지합니다.
alter type lab_specialty add value if not exists 'CAD/CAM';
alter type lab_specialty add value if not exists '지르코니아';
alter type lab_specialty add value if not exists '포세린';
alter type lab_specialty add value if not exists '덴처';
alter type lab_specialty add value if not exists '교정';
alter type lab_specialty add value if not exists '임플란트';
alter type lab_specialty add value if not exists '밀링센터';
alter type lab_specialty add value if not exists '외주 의뢰';

-- ---------- 수익 모델 확장: 상단 고정 / 기업 페이지 광고 ----------
alter type product_code add value if not exists 'pinned_post';
alter type product_code add value if not exists 'company_page_ad';

alter table job_posts add column if not exists is_pinned boolean not null default false;
create index if not exists idx_jobposts_pinned on job_posts(is_pinned) where is_pinned = true;

-- 기업 페이지 광고 여부 (치과/기공소 소개 페이지 상단 강조)
alter table clinics add column if not exists is_page_ad boolean not null default false;
alter table labs add column if not exists is_page_ad boolean not null default false;

-- ---------- 지도 기반 검색용 좌표 ----------
alter table clinics add column if not exists lat double precision;
alter table clinics add column if not exists lng double precision;
alter table labs add column if not exists lat double precision;
alter table labs add column if not exists lng double precision;

-- ============================================================
-- 리뷰 (병원 리뷰 / 기공소 리뷰)
-- ============================================================
create table if not exists clinic_reviews (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  content text not null,
  created_at timestamptz not null default now(),
  unique(clinic_id, author_id)
);

create table if not exists lab_reviews (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references labs(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  content text not null,
  created_at timestamptz not null default now(),
  unique(lab_id, author_id)
);

alter table clinic_reviews enable row level security;
alter table lab_reviews enable row level security;

create policy "clinic_reviews_select_all" on clinic_reviews for select using (true);
create policy "clinic_reviews_insert_own" on clinic_reviews for insert with check (author_id = auth.uid());
create policy "clinic_reviews_update_own" on clinic_reviews for update using (author_id = auth.uid());
create policy "clinic_reviews_delete_own" on clinic_reviews for delete using (author_id = auth.uid() or my_role() = 'admin');

create policy "lab_reviews_select_all" on lab_reviews for select using (true);
create policy "lab_reviews_insert_own" on lab_reviews for insert with check (author_id = auth.uid());
create policy "lab_reviews_update_own" on lab_reviews for update using (author_id = auth.uid());
create policy "lab_reviews_delete_own" on lab_reviews for delete using (author_id = auth.uid() or my_role() = 'admin');

-- ============================================================
-- 즐겨찾기
-- ============================================================
create type favorite_target as enum ('job_post', 'clinic', 'lab', 'seeker');

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type favorite_target not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, target_type, target_id)
);

alter table favorites enable row level security;
create policy "favorites_all_own" on favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- 실시간 채팅 (지원 건 단위 1:1 채팅방)
-- ============================================================
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references applications(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  content text not null,
  created_at timestamptz not null default now()
);

alter table conversations enable row level security;
alter table messages enable row level security;

create or replace function is_conversation_participant(conv_id uuid) returns boolean as $$
  select exists (
    select 1 from conversations c
    join applications a on a.id = c.application_id
    left join seekers s on s.id = a.seeker_id
    left join job_posts jp on jp.id = a.job_post_id
    left join clinics cl on cl.id = jp.clinic_id
    left join labs l on l.id = jp.lab_id
    where c.id = conv_id
      and (s.user_id = auth.uid() or cl.user_id = auth.uid() or l.user_id = auth.uid())
  );
$$ language sql stable security definer;

create policy "conversations_select_participant" on conversations for select using (is_conversation_participant(id) or my_role() = 'admin');
create policy "conversations_insert_participant" on conversations for insert with check (
  exists (
    select 1 from applications a
    left join seekers s on s.id = a.seeker_id
    left join job_posts jp on jp.id = a.job_post_id
    left join clinics cl on cl.id = jp.clinic_id
    left join labs l on l.id = jp.lab_id
    where a.id = conversations.application_id
      and (s.user_id = auth.uid() or cl.user_id = auth.uid() or l.user_id = auth.uid())
  )
);

create policy "messages_select_participant" on messages for select using (is_conversation_participant(conversation_id) or my_role() = 'admin');
create policy "messages_insert_participant" on messages for insert with check (
  sender_id = auth.uid() and is_conversation_participant(conversation_id)
);

-- Supabase Realtime이 messages 테이블 변경을 구독할 수 있도록 등록
alter publication supabase_realtime add table messages;

-- ============================================================
-- 커뮤니티 (자유게시판 / 질문게시판 / 구인후기 / 병원후기 / 기공노하우 / 중고장비)
-- ============================================================
create type board_type as enum ('free', 'question', 'job_review', 'clinic_review', 'lab_tips', 'used_equipment');

create table if not exists board_posts (
  id uuid primary key default gen_random_uuid(),
  board board_type not null,
  author_id uuid not null references profiles(id) on delete cascade,
  title varchar(200) not null,
  content text not null,
  price int,                      -- 중고장비 게시판에서만 사용
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_boardposts_board on board_posts(board);

create table if not exists board_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references board_posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table board_posts enable row level security;
alter table board_comments enable row level security;

create policy "board_posts_select_all" on board_posts for select using (true);
create policy "board_posts_insert_own" on board_posts for insert with check (author_id = auth.uid());
create policy "board_posts_update_own" on board_posts for update using (author_id = auth.uid() or my_role() = 'admin');
create policy "board_posts_delete_own" on board_posts for delete using (author_id = auth.uid() or my_role() = 'admin');

create policy "board_comments_select_all" on board_comments for select using (true);
create policy "board_comments_insert_own" on board_comments for insert with check (author_id = auth.uid());
create policy "board_comments_delete_own" on board_comments for delete using (author_id = auth.uid() or my_role() = 'admin');

create or replace function increment_board_view(post_id uuid) returns void as $$
  update board_posts set view_count = view_count + 1 where id = post_id;
$$ language sql security definer;
grant execute on function increment_board_view(uuid) to anon, authenticated;
