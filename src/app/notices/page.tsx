import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "공지사항" };
export const revalidate = 60;

export default async function NoticesPage() {
  const supabase = await createClient();
  const { data: notices } = await supabase.from("notices").select("*").order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">공지사항</h1>
      <div className="space-y-2.5">
        {(notices || []).map((n) => (
          <div key={n.id} className="rounded-sm border border-line bg-white p-3.5">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-bold">{n.title}</h3>
              <span className="font-mono text-[11px] text-ink-soft">{new Date(n.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
            <p className="whitespace-pre-wrap text-[13px] text-ink-soft">{n.content}</p>
          </div>
        ))}
        {(!notices || notices.length === 0) && <p className="py-16 text-center text-ink-soft">등록된 공지사항이 없습니다.</p>}
      </div>
    </div>
  );
}
