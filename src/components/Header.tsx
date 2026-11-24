import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { SHOW_PRICING } from "@/lib/siteInfo";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }

  // 구직자에게 답을 기다리는 면접 제안이 있으면 마이페이지 버튼에 숫자로 알려줌
  let pendingOffers = 0;
  if (user && role === "seeker") {
    const { count } = await supabase
      .from("job_offers")
      .select("id, seekers!inner(user_id)", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("seekers.user_id", user.id);
    pendingOffers = count ?? 0;
  }

  // 읽지 않은 운영자 메시지 (모든 회원)
  let unreadMessages = 0;
  if (user) {
    const { count } = await supabase
      .from("member_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    unreadMessages = count ?? 0;
  }

  const dashboardHref =
    role === "clinic" ? "/dashboard/clinic" : role === "lab" ? "/dashboard/lab" : role === "admin" ? "/admin" : "/dashboard/seeker";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[25px] font-extrabold tracking-tight">덴트잡</span>
          <span className="rounded-sm bg-teal px-2.5 py-1.5 font-mono text-[17px] font-bold tracking-wide text-white">2804</span>
          <span className="hidden text-[14px] font-semibold text-ink-soft sm:inline">서울·경기권(인천·수원) 치과 전용</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/jobs" className="text-[14.5px] font-semibold text-ink-soft hover:text-teal">
            구인
          </Link>
          <Link href="/jobs?category=lab" className="text-[14.5px] font-semibold text-ink-soft hover:text-teal">
            치과기공사 전문관
          </Link>
          <Link href="/jobs?job_type=치과위생사" className="text-[14.5px] font-semibold text-ink-soft hover:text-teal">
            치과위생사 전문관
          </Link>
          <Link href="/jobs/map" className="text-[14.5px] font-semibold text-ink-soft hover:text-teal">
            지도검색
          </Link>
          <Link href="/seekers" className="text-[14.5px] font-semibold text-ink-soft hover:text-teal">
            구직자
          </Link>
          <Link href="/community" className="text-[14.5px] font-semibold text-ink-soft hover:text-teal">
            커뮤니티
          </Link>
          {SHOW_PRICING && (
            <Link href="/pricing" className="text-[14.5px] font-semibold text-ink-soft hover:text-teal">
              요금안내
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2.5 text-[13.5px]">
          {user ? (
            <>
              <Link href="/favorites" className="hidden text-[13px] font-bold text-ink-soft hover:text-coral sm:inline">
                ★ 즐겨찾기
              </Link>
              <Link href={dashboardHref} className="rounded-sm border border-teal px-4 py-2 font-bold text-teal hover:bg-teal-tint">
                마이페이지
                {pendingOffers > 0 && (
                  <span className="ml-1.5 rounded-full bg-coral px-1.5 py-0.5 text-[10.5px] text-white" title="새 면접 제안">
                    제안 {pendingOffers}
                  </span>
                )}
                {unreadMessages > 0 && (
                  <span className="ml-1.5 rounded-full bg-coral px-1.5 py-0.5 text-[10.5px] text-white" title="운영자 메시지">
                    새 알림
                  </span>
                )}
              </Link>
              <form action={signOut}>
                <button className="rounded-sm border border-line px-4 py-2 font-bold text-ink-soft hover:bg-paper-dim">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-sm border border-teal px-4 py-2 font-bold text-teal hover:bg-teal-tint">
                로그인
              </Link>
              <Link href="/signup" className="rounded-sm bg-teal px-4 py-2 font-bold text-white hover:bg-teal-deep">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
