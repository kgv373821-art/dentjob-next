import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import JobCard from "@/components/JobCard";
import { createClient } from "@/lib/supabase/server";
import { LAB_RELATED_JOB_TYPES } from "@/lib/constants";
import { getSeoLandingPage, type SeoLandingPage } from "@/lib/seoLandingPages";
import type { JobPost } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

const CONTACT_EMAIL = "t01028848755@gmail.com";

const getJobs = cache(async (slug: string) => {
  const page = getSeoLandingPage(slug);
  if (!page) return [];

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

  return ((data || []).map((job) => ({
    ...job,
    clinic_name: (job as { clinics?: { clinic_name?: string } }).clinics?.clinic_name,
    lab_name: (job as { labs?: { lab_name?: string } }).labs?.lab_name,
  })) as unknown) as JobPost[];
});

function isLabPage(page: SeoLandingPage) {
  return page.jobTypes.every((t) => LAB_RELATED_JOB_TYPES.includes(t));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) return { title: "채용공고를 찾을 수 없습니다" };

  const jobs = await getJobs(slug);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/jobs/seo/${page.slug}` },
    // 공고가 없는 동안은 얇은 페이지가 검색에 색인되지 않도록 합니다. (사이트맵에도 공고가 있는 페이지만 실립니다)
    ...(jobs.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function SeoJobLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) notFound();

  const jobs = await getJobs(slug);
  const isLab = isLabPage(page);
  const allJobsHref = isLab ? "/jobs?category=lab" : "/jobs?category=clinic";

  return (
    <div className="mx-auto max-w-6xl px-6 py-9">
      <nav className="mb-3 text-[12px] text-ink-soft" aria-label="현재 위치">
        <Link href="/jobs" className="hover:text-teal">채용공고</Link> <span aria-hidden="true">/</span> {page.title}
      </nav>
      <header className="mb-6 border-b-2 border-ink pb-3">
        <h1 className="text-[24px] font-extrabold tracking-tight">{page.title}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{page.intro}</p>
      </header>

      {jobs.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-bold text-ink-soft">현재 모집 중인 공고 {jobs.length}건</p>
            <Link href={allJobsHref} className="text-[13px] font-bold text-teal hover:underline">전체 채용공고 보기 →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => <JobCard key={job.id} job={job} emphasizeUrgent />)}
          </div>
        </>
      ) : (
        <section className="rounded border border-dashed border-teal/40 bg-teal/5 px-6 py-10 text-center">
          <p className="mb-1.5 text-[12px] font-bold text-teal">현재 이 조건의 공고가 없습니다</p>
          <h2 className="mb-2 text-[20px] font-extrabold tracking-tight text-ink">
            이 지역 {isLab ? "기공소" : "치과"}의 첫 공고를 올려보세요
          </h2>
          <p className="mx-auto mb-5 max-w-md text-[14px] leading-relaxed text-ink-soft">
            {isLab ? "기공소" : "치과"} 전문 구인구직 사이트라 원하는 분께 바로 닿습니다. 지금은 공고를 무료로 등록할 수 있고, 직접 올리기
            어렵다면 사진이나 문자로 보내주시면 대신 등록해 드립니다.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/signup" className="rounded-sm bg-teal px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-teal-deep">
              무료로 공고 등록하기
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("공고 대리 등록 문의")}`}
              className="rounded-sm border border-teal px-5 py-2.5 text-[13.5px] font-bold text-teal hover:bg-teal/10"
            >
              대신 올려주세요 (문의)
            </a>
            <Link href={allJobsHref} className="rounded-sm border border-line bg-white px-5 py-2.5 text-[13.5px] font-bold text-ink-soft hover:border-teal">
              전체 공고 둘러보기
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
