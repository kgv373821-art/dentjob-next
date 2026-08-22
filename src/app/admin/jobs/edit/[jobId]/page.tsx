import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminJobForm from "@/components/AdminJobForm";
import type { JobPost } from "@/lib/types";

export default async function AdminEditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: job } = await supabase.from("job_posts").select("*").eq("id", jobId).single();
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-1.5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">공고 수정 (관리자)</h1>
      <p className="mb-5 text-[12.5px] text-ink-soft">공고 소유 계정을 바꾸려면 공고 노출 관리 화면의 &quot;계정 연결&quot; 버튼을 이용하세요.</p>
      <AdminJobForm accounts={[]} job={job as JobPost} />
    </div>
  );
}
