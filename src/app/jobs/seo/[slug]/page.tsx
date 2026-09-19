import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JobCard from "@/components/JobCard";
import { createClient } from "@/lib/supabase/server";
import { getSeoLandingPage } from "@/lib/seoLandingPages";
import type { JobPost } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) return { title: "채용공고를 찾을 수 없습니다" };

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/jobs/seo/${page.slug}` },
  };
}

export default async function SeoJobLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) notFound();

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_posts")
    .select("*, clinics(clinic_name), labs(lab_name)")
    .eq("status", "approved")
    .in("region", page.regions)
    .in("job_type", page.jobTypes)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .or(`recruit_end_date.is.null,recruit_end_date.gte.${today}`)
    .order("is_pinned", { ascending: false })
    .order("is_premium", { ascending: false })
    .order("posted_at", { ascending: false })
    .limit(60);

  const jobs = ((data || []).map((job) => ({
    ...job,
    clinic_name: (job as { clinics?: { clinic_name?: string } }).clinics?.clinic_name,
    lab_name: (job as { labs?: { lab_name?: string } }).labs?.lab_name,
  })) as unknown) as JobPost[];

  // 실제 노출할 공고가 없을 때는 빈 SEO 페이지를 만들지 않습니다.
  if (jobs.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-9">
      <nav className="mb-3 text-[12px] text-ink-soft" aria-label="현재 위치">
        <Link href="/jobs" className="hover:text-teal">채용공고</Link> <span aria-hidden="true">/</span> {page.title}
      </nav>
      <header className="mb-6 border-b-2 border-ink pb-3">
        <h1 className="text-[24px] font-extrabold tracking-tight">{page.title}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{page.intro}</p>
      </header>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink-soft">현재 모집 중인 공고 {jobs.length}건</p>
        <Link href="/jobs?category=lab" className="text-[13px] font-bold text-teal hover:underline">전체 채용공고 보기 →</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => <JobCard key={job.id} job={job} emphasizeUrgent />)}
      </div>
    </div>
  );
}
