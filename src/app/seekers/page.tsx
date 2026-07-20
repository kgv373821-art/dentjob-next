import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SeekerCard from "@/components/SeekerCard";
import type { Seeker } from "@/lib/types";

export const metadata: Metadata = {
  title: "구직자 전체보기",
  description: "치과기공사, 치과위생사 등 서울·경기 지역 구직자 이력서를 확인하세요.",
};

export default async function SeekersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("seekers").select("*, profiles(name)").order("updated_at", { ascending: false }).limit(40);

  return (
    <div className="mx-auto max-w-6xl px-6 py-9">
      <div className="mb-4.5 border-b-2 border-ink pb-2.5">
        <h1 className="text-[21px] font-extrabold tracking-tight">전체 구직자</h1>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {((data || []) as (Seeker & { profiles: { name: string } })[]).map((s) => (
          <SeekerCard key={s.id} seeker={s} name={s.profiles?.name || "구직자"} />
        ))}
      </div>
      {(!data || data.length === 0) && <p className="py-16 text-center text-ink-soft">등록된 구직자가 없습니다.</p>}
    </div>
  );
}
