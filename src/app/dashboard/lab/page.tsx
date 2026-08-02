import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteJobPost, closeJobPost } from "@/lib/actions/jobs";
import { LAB_JOB_CATEGORIES } from "@/lib/constants";

export default async function LabDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lab } = await supabase.from("labs").select("*").eq("user_id", user.id).single();
  if (!lab) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-ink-soft">기공소 프로필이 없습니다. 관리자에게 문의해주세요.</p>
      </div>
    );
  }

  const { data: jobs } = await supabase
    .from("job_posts")
    .select("*, applications(count)")
    .eq("lab_id", lab.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-9">
      <div className="mb-5 flex items-center justify-between border-b-2 border-gold pb-2.5">
        <div>
          <h1 className="text-[21px] font-extrabold">{lab.lab_name} 대시보드</h1>
          <p className="text-[12.5px] text-ink-soft">기사 모집 · 아르바이트 모집 · 외주 모집</p>
        </div>
        <Link href="/dashboard/lab/new" className="rounded-sm bg-ink px-4 py-2.5 text-[13.5px] font-bold text-gold hover:bg-teal-deep">
          + 기공소 채용 등록
        </Link>
      </div>

      {LAB_JOB_CATEGORIES.map((cat) => {
        const rows = (jobs || []).filter((j) => j.lab_category === cat);
        return (
          <div key={cat} className="mb-6">
            <h2 className="mb-2 text-[14px] font-bold text-ink-soft">{cat}</h2>
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                {rows.map((job) => (
                  <tr key={job.id} className="border-b border-line">
                    <td className="p-2.5">
                      <Link href={`/jobs/${job.id}`} className="font-semibold hover:text-teal">
                        {job.title}
                      </Link>
                    </td>
                    <td className="p-2.5">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="p-2.5">
                      {(job as unknown as { applications: { count: number }[] }).applications?.[0]?.count ?? 0}명{" "}
                      <Link href={`/dashboard/lab/applicants/${job.id}`} className="ml-1 text-teal underline">
                        관리
                      </Link>
                    </td>
                    <td className="p-2.5 text-right">
                      <Link href={`/dashboard/lab/edit/${job.id}`} className="mr-2 text-[12px] font-bold text-teal hover:underline">
                        수정
                      </Link>
                      {job.status !== "closed" && (
                        <form action={closeJobPost.bind(null, job.id)} className="inline">
                          <button className="mr-2 text-[12px] font-bold text-ink-soft hover:text-teal">마감</button>
                        </form>
                      )}
                      <form action={deleteJobPost.bind(null, job.id)} className="inline">
                        <button className="text-[12px] font-bold text-coral">삭제</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p className="py-3 text-[12.5px] text-ink-soft">등록된 공고가 없습니다.</p>}
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-[#FFF1CE] text-[#946200]",
    approved: "bg-[#DCF3E5] text-[#1D7A45]",
    rejected: "bg-[#FBE0DC] text-[#B23A21]",
    closed: "bg-paper-dim text-ink-soft",
  };
  const label: Record<string, string> = { pending: "승인대기", approved: "게시중", rejected: "반려됨", closed: "마감" };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${map[status] || ""}`}>{label[status] || status}</span>;
}
