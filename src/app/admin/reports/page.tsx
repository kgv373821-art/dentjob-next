import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReportActions from "@/components/ReportActions";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reports } = await supabase.from("reports").select("*").neq("status", "resolved").order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">신고 관리</h1>
      <div className="space-y-2.5">
        {(reports || []).map((r) => (
          <div key={r.id} className="rounded-sm border border-line bg-white p-3.5">
            <div className="mb-1 text-[12px] text-ink-soft">
              {r.target_type} · {new Date(r.created_at).toLocaleDateString("ko-KR")}
            </div>
            <p className="mb-2.5 text-[13.5px]">{r.reason}</p>
            <ReportActions reportId={r.id} />
          </div>
        ))}
        {(!reports || reports.length === 0) && <p className="py-10 text-center text-ink-soft">처리할 신고가 없습니다.</p>}
      </div>
    </div>
  );
}
