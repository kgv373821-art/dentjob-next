import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SeekerCard from "@/components/SeekerCard";
import { maskName } from "@/lib/constants";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import type { Seeker } from "@/lib/types";

export const metadata: Metadata = {
  title: "구직자 전체보기",
  description: "치과기공사, 치과위생사 등 서울·경기 지역 구직자 이력서를 확인하세요.",
};

export default async function SeekersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }
  const isEmployer = role === "clinic" || role === "lab" || role === "admin";

  if (!isEmployer) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="mb-3 text-[19px] font-extrabold">구직자 정보는 치과·기공소 회원만 볼 수 있습니다</h1>
        <p className="mb-6 text-[13.5px] text-ink-soft">구직자 개인정보 보호를 위해 사업자(치과·기공소) 계정으로 로그인해야 열람할 수 있습니다.</p>
        <Link href="/login" className="inline-block rounded-sm bg-teal px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-teal-deep">
          로그인하기
        </Link>
      </div>
    );
  }

  const [{ data }, favoriteIds] = await Promise.all([
    supabase.from("seekers").select("*, profiles(name)").order("updated_at", { ascending: false }).limit(40),
    getMyFavoriteIds("seeker"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-9">
      <div className="mb-4.5 border-b-2 border-ink pb-2.5">
        <h1 className="text-[21px] font-extrabold tracking-tight">전체 구직자</h1>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {((data || []) as (Seeker & { profiles: { name: string } })[]).map((s) => (
          <SeekerCard
            key={s.id}
            seeker={s}
            name={maskName(s.profiles?.name || "")}
            isLoggedIn={!!user}
            isFavorited={favoriteIds.includes(s.id)}
          />
        ))}
      </div>
      {(!data || data.length === 0) && <p className="py-16 text-center text-ink-soft">등록된 구직자가 없습니다.</p>}
    </div>
  );
}
