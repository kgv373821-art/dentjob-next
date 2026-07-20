import { createClient } from "@/lib/supabase/server";
import ApplicantActions from "@/components/ApplicantActions";
import { openConversation } from "@/lib/actions/chat";

const STATUS_LABEL: Record<string, string> = {
  applied: "지원접수",
  reviewing: "서류검토중",
  interview: "면접예정",
  passed: "합격",
  failed: "불합격",
  withdrawn: "지원취소",
};

export default async function ApplicantsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase.from("job_posts").select("title").eq("id", jobId).single();
  const { data: applications } = await supabase
    .from("applications")
    .select("*, seekers(desired_job, career_years, lab_specialty, profiles(name, phone))")
    .eq("job_post_id", jobId)
    .order("applied_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">지원자 관리 — {job?.title}</h1>

      <div className="space-y-2.5">
        {(applications || []).map((a) => {
          const seeker = (a as unknown as {
            seekers?: { desired_job: string; career_years: number; lab_specialty?: string; profiles?: { name: string; phone: string } };
          }).seekers;
          return (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-white p-3.5">
              <div>
                <div className="font-bold">{seeker?.profiles?.name}</div>
                <div className="text-[12.5px] text-ink-soft">
                  {seeker?.desired_job} · 경력 {seeker?.career_years}년{seeker?.lab_specialty ? ` · ${seeker.lab_specialty}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-paper-dim px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">
                  {STATUS_LABEL[a.status] || a.status}
                </span>
                <form action={openConversation.bind(null, a.id)}>
                  <button className="rounded-sm border border-line px-2.5 py-1 text-[11.5px] font-bold text-ink-soft hover:border-teal hover:text-teal">
                    채팅하기
                  </button>
                </form>
                <ApplicantActions applicationId={a.id} />
              </div>
            </div>
          );
        })}
        {(!applications || applications.length === 0) && <p className="py-10 text-center text-ink-soft">아직 지원자가 없습니다.</p>}
      </div>
    </div>
  );
}
