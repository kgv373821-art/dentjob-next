import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JobCard from "@/components/JobCard";
import type { JobPost } from "@/lib/types";

export const metadata = { title: "즐겨찾기" };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: favorites } = await supabase.from("favorites").select("target_id").eq("user_id", user.id).eq("target_type", "job_post");
  const ids = (favorites || []).map((f) => f.target_id);

  const { data } =
    ids.length > 0
      ? await supabase.from("job_posts").select("*, clinics(clinic_name), labs(lab_name)").in("id", ids)
      : { data: [] };

  const jobs = (data || []).map((r) => ({
    ...r,
    clinic_name: (r as unknown as { clinics?: { clinic_name: string } }).clinics?.clinic_name,
    lab_name: (r as unknown as { labs?: { lab_name: string } }).labs?.lab_name,
  })) as JobPost[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">즐겨찾기한 공고</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isLoggedIn isFavorited />
        ))}
      </div>
      {jobs.length === 0 && <p className="py-16 text-center text-ink-soft">즐겨찾기한 공고가 없습니다.</p>}
    </div>
  );
}
