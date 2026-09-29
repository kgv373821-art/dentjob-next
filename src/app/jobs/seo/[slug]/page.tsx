import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import JobCard from "@/components/JobCard";
import { createClient } from "@/lib/supabase/server";
import { LAB_RELATED_JOB_TYPES } from "@/lib/constants";
import { getSeoLandingPage, seoLandingPages, type SeoLandingPage } from "@/lib/seoLandingPages";
import type { JobPost } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

import { SITE_INFO } from "@/lib/siteInfo";

const CONTACT_EMAIL = SITE_INFO.email;

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

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/jobs/seo/${page.slug}` },
    openGraph: { title: `${page.title} | 덴트잡2804`, description: page.description, url: `/jobs/seo/${page.slug}`, type: "website", siteName: "덴트잡2804", locale: "ko_KR" },
  };
}

export default async function SeoJobLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) notFound();

  const jobs = await getJobs(slug);
  const isLab = isLabPage(page);
  const allJobsHref = isLab ? "/jobs?category=lab" : "/jobs?category=clinic";
  const pays = jobs.map((j) => j.pay_min).filter((p): p is number => typeof p === "number" && p > 0);
  const payStats = pays.length > 0 ? { count: pays.length, min: Math.min(...pays), max: Math.max(...pays) } : null;

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

      {/* 지역·직종 안내 본문 */}
      <article className="mt-10 space-y-7 rounded border border-line bg-white px-6 py-7 sm:px-8">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-2.5 text-[17px] font-extrabold tracking-tight">{s.heading}</h2>
            <p className="text-[14px] leading-[1.85] text-ink/85">{s.body}</p>
          </section>
        ))}
        {payStats && (
          <section>
            <h2 className="mb-2.5 text-[17px] font-extrabold tracking-tight">
              현재 공고 기준 제시 급여 <span className="text-[12.5px] font-bold text-ink-soft">(급여 공개 공고 {payStats.count}건)</span>
            </h2>
            <p className="text-[14px] leading-[1.85] text-ink/85">
              지금 덴트잡2804에 올라와 있는 {page.areaLabel} 지역 {page.kindLabel} 공고 가운데 급여를 공개한 공고의 제시 금액은{" "}
              <strong>
                {payStats.min === payStats.max ? `월 ${payStats.min}만원` : `월 ${payStats.min}만원 ~ ${payStats.max}만원`}
              </strong>
              입니다. 공고 수가 적을 때는 실제 시세와 차이가 있을 수 있으니 참고용으로만 보시고, 세부 조건은 각 공고에서 확인하세요.
            </p>
          </section>
        )}
        <section>
          <h2 className="mb-2.5 text-[17px] font-extrabold tracking-tight">지원 전 체크포인트</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink/85">
            {page.checklist.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      </article>

      {/* 다른 지역·직종 채용정보 (내부 링크) */}
      <nav className="mt-8" aria-label="다른 지역 채용정보">
        <h2 className="mb-3 text-[14px] font-extrabold text-ink-soft">다른 지역·직종 채용정보</h2>
        <div className="flex flex-wrap gap-2">
          {seoLandingPages
            .filter((p) => p.slug !== page.slug)
            .map((p) => (
              <Link
                key={p.slug}
                href={`/jobs/seo/${p.slug}`}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft hover:border-teal hover:text-teal"
              >
                {p.title}
              </Link>
            ))}
        </div>
      </nav>
    </div>
  );
}
