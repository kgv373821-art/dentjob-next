import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResumeForm from "@/components/ResumeForm";
import { openConversation } from "@/lib/actions/chat";

const STATUS_LABEL: Record<string, string> = {
  applied: "지원접수",
  reviewing: "서류검토중",
  interview: "면접예정",
  passed: "합격",
  failed: "불합격",
  withdrawn: "지원취소",
};

export default async function SeekerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: seeker } = await supabase.from("seekers").select("*").eq("user_id", user.id).single();
  if (!seeker) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-ink-soft">구직자 프로필이 없습니다. 관리자에게 문의해주세요.</p>
      </div>
    );
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("*, job_posts(title, region, job_type)")
    .eq("seeker_id", seeker.id)
    .order("applied_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">내 이력서 · 지원 현황</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-[14px] font-bold">이력서 작성 · 자기소개 · 포트폴리오</h2>
          <ResumeForm seeker={seeker} />
        </div>

        <div>
          <h2 className="mb-3 text-[14px] font-bold">지원 현황</h2>
          <div className="space-y-2">
            {(applications || []).map((a) => {
              const job = (a as unknown as { job_posts?: { title: string; region: string; job_type: string } }).job_posts;
              return (
                <div key={a.id} className="flex items-center justify-between rounded-sm border border-line bg-white p-3 text-[13px]">
                  <div>
                    <div className="font-semibold">{job?.title}</div>
                    <div className="text-[11.5px] text-ink-soft">{job?.region} · {job?.job_type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                  <span className="rounded-full bg-paper-dim px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">
                    {STATUS_LABEL[a.status] || a.status}
                  </span>
                  <form action={openConversation.bind(null, a.id)}>
                    <button className="rounded-sm border border-line px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:border-teal hover:text-teal">
                      채팅
                    </button>
                  </form>
                  </div>
                </div>
              );
            })}
            {(!applications || applications.length === 0) && <p className="text-[13px] text-ink-soft">아직 지원한 공고가 없습니다.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
