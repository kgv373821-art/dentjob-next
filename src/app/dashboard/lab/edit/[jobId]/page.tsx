import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JobForm from "@/components/JobForm";
import type { JobPost } from "@/lib/types";

export default async function EditLabJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lab } = await supabase.from("labs").select("id, lab_name").eq("user_id", user.id).single();
  if (!lab) notFound();

  const { data: job } = await supabase.from("job_posts").select("*").eq("id", jobId).eq("lab_id", lab.id).single();
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">채용 공고 수정</h1>
      <JobForm role="lab" orgName={lab.lab_name} job={job as JobPost} />
    </div>
  );
}
