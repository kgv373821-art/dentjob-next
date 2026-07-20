# Job2804 덴트잡 서울경기 — Next.js + Supabase

기존 정적 HTML 프로토타입을 **Next.js 16 (App Router) + Supabase + Tailwind CSS v4**로 전환한 실서비스용 코드베이스입니다.
로컬에서 `npm run build` / `npm run lint`까지 통과하는 것을 확인했습니다. **Supabase 프로젝트 생성과 Vercel 배포는 사용자 본인 계정으로 진행해야 하는 단계**라 이 환경에서 대신 실행해드릴 수 없었고, 아래에 그대로 따라 하면 되는 순서로 정리했습니다.

## 1. Supabase 프로젝트 연결

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. 프로젝트 대시보드 → **SQL Editor** → `supabase/schema.sql` 전체 내용을 붙여넣고 실행
   - `profiles`, `clinics`, `labs`, `seekers`, `job_posts`, `applications` 등 전체 테이블 + **Row Level Security 정책**이 함께 생성됩니다.
   - 치과기공사/기공소 축은 `labs`, `lab_specialty`, `lab_category`로 분리되어 있고, `lab_job_stats()` 함수로 관리자 페이지에서 비중을 바로 확인합니다.
3. 프로젝트 설정 → **API** 에서 `Project URL`, `anon public key` 확인
4. `.env.local.example`을 `.env.local`로 복사 후 값 채우기

```bash
cp .env.local.example .env.local
npm install
npm run dev   # http://localhost:3000
```

### 회원가입 동작 방식
Supabase Auth(`auth.signUp`)로 계정을 만들면 `handle_new_user()` 트리거가 `profiles` 테이블에 역할(role)과 이름을 자동 기록합니다. 이후 서버 액션(`src/lib/actions/auth.ts`)이 역할에 따라 `clinics` / `labs` / `seekers` 테이블에 프로필을 추가로 생성합니다.

> 관리자 계정은 Supabase Table Editor에서 `profiles.role`을 `admin`으로 직접 수정해서 만드세요 (보안상 회원가입 화면으로는 admin 가입이 불가능합니다).

## 2. 구현된 기능

| 영역 | 내용 |
|---|---|
| 회원가입/로그인 | Supabase Auth 이메일/비밀번호, 역할별(치과/기공소/구직자) 추가 정보 입력 |
| 공고 등록/수정/삭제 | `dashboard/clinic`, `dashboard/lab`에서 등록(승인대기) · 마감 · 삭제. 기공소는 전문분야·모집구분(기사/알바/외주) 필드 포함 |
| 지원 기능 | 구직자가 공고 상세에서 지원 → 치과/기공소 대시보드에서 지원자 목록·상태 변경(서류검토/면접/합격/불합격) |
| 관리자 페이지 | `/admin` — 회원 통계(치과기공사 vs 치과 공고 비중 포함), 공고 승인/반려, 신고 관리, 공지사항, 문자 발송 |
| 결제 | 토스페이먼츠 주문 생성(`/api/payments/order`) → 결제창 → 승인(`/api/payments/confirm`) |
| 문자 | 네이버클라우드 SENS 연동 (`/api/admin/sms`) |
| SEO | `generateMetadata`로 공고별 동적 title/description, `sitemap.ts`(공고 URL 자동 포함), `robots.ts` |
| 성능 | Server Components 기반 데이터 페칭, `revalidate` 캐싱, 폰트는 CDN 프리커넥트로 로드하여 빌드 네트워크 의존성 제거 |
| 모바일 | Tailwind 반응형 그리드 전 페이지 적용 (`sm:`/`md:`/`lg:` 브레이크포인트) |

### v2 — 차별화 기능

| 기능 | 위치 | 비고 |
|---|---|---|
| 병원/기공소 리뷰 | `/clinics/[id]`, `/labs/[id]` | 별점 + 후기, 작성자당 1개(수정 가능) |
| 즐겨찾기 | 공고 카드 ★ 버튼, `/favorites` | 공고/치과/기공소/구직자 대상 |
| AI 이력서 초안 | `/dashboard/seeker` | Claude API, `ANTHROPIC_API_KEY` 필요 |
| AI 자기소개서 초안 | `/dashboard/seeker` | 〃 |
| AI 공고 작성 초안 | `/dashboard/clinic/new`, `/dashboard/lab/new` | 〃 |
| 실시간 채팅 | `/chat/[conversationId]` | Supabase Realtime, 지원 건 단위 1:1 채팅방 |
| 카카오톡 공유 | 공고 상세 | `NEXT_PUBLIC_KAKAO_JS_KEY`만 있으면 동작 (무료) |
| 카카오 알림톡 | `src/lib/services/kakaoAlimtalk.ts` | **스캐폴드만 제공** — 카카오 비즈니스 채널 + 대행사(Solapi 등) 템플릿 승인 필요, 이 환경에서 대신 신청할 수 없음 |
| 지도 기반 검색 | `/jobs/map` | Kakao Maps JS SDK, `NEXT_PUBLIC_KAKAO_JS_KEY` 필요. 치과/기공소에 `lat`/`lng` 좌표가 있어야 표시됨 |
| 프리미엄/상단고정/긴급/메인배너/기업페이지 광고 | `/pricing`, `/api/payments/*` | 5개 상품 모두 반영, 결제 승인 시 `is_pinned`/`is_main_exposed`/`is_urgent` 자동 반영 |
| 기공 분야 필터 | `/jobs?category=lab` | CAD/CAM·지르코니아·포세린·덴처·교정·임플란트·밀링센터·외주 의뢰 |
| 커뮤니티 | `/community` | 자유게시판·질문게시판·구인후기·병원후기·기공노하우·중고장비, 댓글 포함 |
| 원터치 지원 | 공고 카드 (구직자 로그인 시) | 클릭 한 번으로 즉시 지원 |
| 전화/문자 바로가기 | 공고 상세 | `tel:`/`sms:` 링크, 담당자 휴대폰 등록 시 노출 |

### 아직 연결이 필요한 외부 서비스
- **AI 기능**: Anthropic API 키 발급 후 `.env`의 `ANTHROPIC_API_KEY`에 입력
- **카카오 공유/지도**: [Kakao Developers](https://developers.kakao.com)에서 앱 생성 → JavaScript 키 발급 → `NEXT_PUBLIC_KAKAO_JS_KEY`
- **카카오 알림톡**: 카카오톡 채널 개설 + Solapi/NHN Toast 등 대행사 가입 + 템플릿 승인 (영업일 기준 수일 소요, 사용자 본인 사업자 정보 필요)
- **지도 좌표**: 치과/기공소 가입 시 주소만 받고 있어, 좌표(`lat`/`lng`)는 아직 자동 지오코딩되지 않습니다. 카카오 로컬 API(주소→좌표 변환)를 가입 폼에 연결하거나 Supabase Table Editor에서 수동 입력하세요.

## 2-1. schema_v2.sql 적용
`supabase/schema.sql` 실행 후, **반드시 이어서** `supabase/schema_v2.sql`도 SQL Editor에서 실행하세요. 리뷰·즐겨찾기·채팅·커뮤니티·확장된 기공 분야·상단고정/기업광고 상품이 이 파일에 들어있습니다.


## 3. 프론트에서 토스페이먼츠 결제창 연동하기

이 저장소는 서버 쪽 주문 생성/승인 API까지 구현했습니다. 결제창 UI는 토스 결제위젯 SDK를 붙이면 됩니다:

```tsx
// 공고 상세 또는 대시보드에서
const res = await fetch("/api/payments/order", {
  method: "POST",
  body: JSON.stringify({ product_code: "urgent_post", job_post_id }),
});
const { tossClientKey, orderId, amount } = await res.json();
// @tosspayments/payment-widget-sdk 로 결제창 오픈 → successUrl에서 /api/payments/confirm 호출
```

## 4. Vercel 배포

1. GitHub에 이 프로젝트를 push
2. [vercel.com](https://vercel.com) → **New Project** → 저장소 선택 (Next.js 자동 감지)
3. **Environment Variables**에 `.env.local`의 모든 값을 동일하게 등록 (`NEXT_PUBLIC_SITE_URL`은 배포된 실제 도메인으로)
4. Deploy 클릭 — 빌드 커맨드/출력 디렉토리는 Next.js 기본값 그대로 사용
5. 배포 후 Supabase 프로젝트 설정 → **Authentication → URL Configuration**에 Vercel 도메인을 추가해야 로그인 리다이렉트가 정상 동작합니다.

로컬에서는 실제 Supabase 프로젝트가 없어 런타임 연결까지는 확인하지 못했습니다 (스키마 SQL과 동일한 설계를 앞서 순수 PostgreSQL로 이미 검증했고, 이번 코드는 `npm run build`+`npm run lint` 정적 검증까지 통과했습니다). 위 순서대로 연결하면 바로 동작합니다.

## 5. 프로젝트 구조

```
src/
  app/
    page.tsx                 홈 (인기공고 + 치과기공사 전문관 + 최신 구직자)
    jobs/page.tsx              공고 목록 (필터/정렬)
    jobs/[id]/page.tsx           공고 상세 + 지원폼 (동적 SEO metadata)
    seekers/, seekers/[id]/        구직자 목록/상세
    login/, signup/                 인증
    dashboard/clinic/                 치과 대시보드 (등록/지원자관리)
    dashboard/lab/                     기공소 대시보드 (기사/알바/외주 구분)
    dashboard/seeker/                   구직자 대시보드 (이력서/지원현황)
    admin/                                관리자 (승인/신고/공지/문자)
    api/payments/, api/admin/sms/          결제·문자 Route Handler
    sitemap.ts, robots.ts                   SEO
  components/                                재사용 UI 컴포넌트
  lib/
    supabase/                                 client/server/middleware
    actions/                                   Server Actions (CRUD)
    services/                                   Toss/SENS 연동
    constants.ts, types.ts
  proxy.ts                                       세션 갱신 (Next.js 16 proxy 컨벤션)
supabase/schema.sql                               전체 DB 스키마 + RLS
```
