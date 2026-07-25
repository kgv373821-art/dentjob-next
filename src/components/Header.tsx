import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

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

  const dashboardHref =
    role === "clinic" ? "/dashboard/clinic" : role === "lab" ? "/dashboard/lab" : role === "admin" ? "/admin" : "/dashboard/seeker";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="rounded-sm bg-teal px-2 py-1 font-mono text-[13px] font-bold tracking-wide text-white">2804</span>
          <span className="text-[19px] font-extrabold tracking-tight">덴트잡</span>
          <span className="hidden text-[11px] font-medium text-ink-soft sm:inline">서울·경기 치과 전용</span>
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
          <Link href="/pricing" className="text-[14.5px] font-semibold text-ink-soft hover:text-teal">
            요금안내
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 text-[13.5px]">
          {user ? (
            <>
              <Link href="/favorites" className="hidden text-[13px] font-bold text-ink-soft hover:text-coral sm:inline">
                ★ 즐겨찾기
              </Link>
              <Link href={dashboardHref} className="rounded-sm border border-teal px-4 py-2 font-bold text-teal hover:bg-teal-tint">
                마이페이지
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
