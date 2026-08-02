import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JobForm from "@/components/JobForm";
import type { JobPost } from "@/lib/types";

export default async function EditClinicJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clinic } = await supabase.from("clinics").select("id, clinic_name").eq("user_id", user.id).single();
  if (!clinic) notFound();

  const { data: job } = await supabase.from("job_posts").select("*").eq("id", jobId).eq("clinic_id", clinic.id).single();
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">채용 공고 수정</h1>
      <JobForm role="clinic" orgName={clinic.clinic_name} job={job as JobPost} />
    </div>
  );
}
