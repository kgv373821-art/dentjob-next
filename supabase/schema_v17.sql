-- v17: 대리등록 자동 프로그램용 등록 창구 (E:\클로드\덴트잡_자동등록\run.mjs)
-- app_secrets 표에 'proxy_register' 비밀열쇠의 sha256을 넣어 두고(값은 저장소에 두지 않음),
-- proxy_register(p_secret, p_posts jsonb, p_dry_run) 가 열쇠 확인 → 살아 있는 같은 업체·이끌림 제외 → 3일 노출로 insert.
-- 실제 적용본은 Supabase 마이그레이션 proxy_register_rpc 참고.
create table if not exists public.app_secrets (name text primary key, sha256 text not null, created_at timestamptz default now());
alter table public.app_secrets enable row level security;
