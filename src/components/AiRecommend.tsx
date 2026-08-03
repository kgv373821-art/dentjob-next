import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import JobCard from "@/components/JobCard";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import { formatPay } from "@/lib/constants";
import type { JobPost } from "@/lib/types";

export default async function AiRecommend({ compact = false }: { compact?: boolean }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-[3px] border border-dashed border-teal bg-teal-tint p-4 text-center">
        <p className="mb-2 text-[13px] font-bold text-teal">AI 추천 채용</p>
        <p className="mb-3 text-[12px] text-ink-soft">로그인하면 희망 직종·지역에 맞는 공고를 추천해드려요.</p>
        <Link href="/login" className="inline-block rounded-sm bg-teal px-4 py-2 text-[12.5px] font-bold text-white hover:bg-teal-deep">
          로그인하고 추천받기
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "seeker") return null;

  const { data: seeker } = await supabase
    .from("seekers")
    .select("desired_job, desired_region, lab_specialty")
    .eq("user_id", user.id)
    .single();

  let query = supabase
    .from("job_posts")
    .select("*, clinics(clinic_name), labs(lab_name)")
    .eq("status", "approved");

  const conditions: string[] = [];
  if (seeker?.desired_job) conditions.push(`job_type.eq.${seeker.desired_job}`);
  if (seeker?.desired_region) conditions.push(`region.eq.${seeker.desired_region}`);
  if (seeker?.lab_specialty) conditions.push(`lab_specialty.eq.${seeker.lab_specialty}`);

  if (conditions.length > 0) query = query.or(conditions.join(","));

  const nowIso = new Date().toISOString();
  const [{ data: jobs }, favoriteIds] = await Promise.all([
    query.order("posted_at", { ascending: false }).limit((compact ? 3 : 6) * 3),
    getMyFavoriteIds("job_post"),
  ]);

  const normalized = (jobs || [])
    .filter((r) => !r.expires_at || r.expires_at > nowIso)
    .slice(0, compact ? 3 : 6)
    .map((r) => ({
      ...r,
      clinic_name: (r as unknown as { clinics?: { clinic_name: string } }).clinics?.clinic_name,
      lab_name: (r as unknown as { labs?: { lab_name: string } }).labs?.lab_name,
    })) as JobPost[];

  if (normalized.length === 0) return null;

  if (compact) {
    return (
      <div className="rounded-[3px] border border-l-4 border-line border-l-teal bg-white p-4">
        <h3 className="mb-2.5 border-b border-line pb-2 text-[13.5px] font-extrabold text-teal">✨ 맞춤 추천 채용</h3>
        <ul className="space-y-2">
          {normalized.map((job) => (
            <li key={job.id}>
              <Link href={`/jobs/${job.id}`} className="block text-[12.5px] hover:text-teal">
                <div className="truncate font-semibold">{job.title}</div>
                <div className="text-[11px] text-ink-soft">
                  {job.region} · {job.job_type} · {formatPay(job.pay_min)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-9">
      <div className="mb-4.5 border-b-2 border-teal pb-2.5">
        <h2 className="text-[21px] font-extrabold tracking-tight text-teal">맞춤 추천 채용</h2>
        <p className="mt-1 text-[13px] text-ink-soft">회원님의 희망 직종·지역과 일치하는 공고입니다.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {normalized.map((job) => (
          <JobCard key={job.id} job={job} isLoggedIn isFavorited={favoriteIds.includes(job.id)} isSeeker />
        ))}
      </div>
    </section>
  );
}
