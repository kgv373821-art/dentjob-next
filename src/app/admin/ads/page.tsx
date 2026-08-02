import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdsListClient from "@/components/AdsListClient";
import type { Ad } from "@/lib/types";

export default async function AdminAdsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: ads } = await supabase.from("ads").select("*").order("priority", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-9">
      <div className="mb-5 flex items-center justify-between border-b-2 border-ink pb-2.5">
        <div>
          <h1 className="text-[21px] font-extrabold">광고관리</h1>
          <p className="text-[12.5px] text-ink-soft">위치별로 묶여 있으며, ⠿을 드래그해 우선순위(노출 순서)를 바꿀 수 있습니다.</p>
        </div>
        <Link href="/admin/ads/new" className="rounded-sm bg-teal px-4 py-2.5 text-[13.5px] font-bold text-white hover:bg-teal-deep">
          + 광고 등록
        </Link>
      </div>

      <AdsListClient ads={(ads || []) as Ad[]} />
    </div>
  );
}
