import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SearchForm from "@/components/SearchForm";
import JobCard from "@/components/JobCard";
import SeekerCard from "@/components/SeekerCard";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import type { JobPost, Seeker } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: popularJobs }, { data: labJobs }, { data: hygienistJobs }, { data: seekers }, { data: { user } }, favoriteIds] = await Promise.all([
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "approved")
      .order("is_pinned", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(6),
    supabase
      .from("job_posts")
      .select("*, labs(lab_name)")
      .eq("status", "approved")
      .not("lab_id", "is", null)
      .order("is_pinned", { ascending: false })
      .order("is_urgent", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(6),
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name)")
      .eq("status", "approved")
      .eq("job_type", "치과위생사")
      .order("is_pinned", { ascending: false })
      .order("is_urgent", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(6),
    supabase
      .from("seekers")
      .select("*, profiles(name)")
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase.auth.getUser(),
    getMyFavoriteIds("job_post"),
  ]);

  const normalizeJobs = (rows: typeof popularJobs) =>
    (rows || []).map((r) => ({
      ...r,
      clinic_name: (r as unknown as { clinics?: { clinic_name: string } }).clinics?.clinic_name,
      lab_name: (r as unknown as { labs?: { lab_name: string } }).labs?.lab_name,
    })) as JobPost[];

  let isSeeker = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isSeeker = profile?.role === "seeker";
  }

  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-10 pt-16 md:grid-cols-[1.1fr_.9fr] md:items-end">
        <div>
          <h1 className="mb-3.5 text-[34px] font-extrabold leading-tight tracking-tight sm:text-[44px]">
            서울·경기 치과 구인·구직,
            <br />
            가장 <span className="text-coral">빠른 연결</span>
          </h1>
          <p className="mb-7 text-[15.5px] leading-relaxed text-ink-soft">
            치과의사부터 데스크·상담실장까지, 그리고 치과기공사·기공소 채용까지 — 지역과 직종으로 바로 찾는 치과 전용
            구인구직 플랫폼입니다.
          </p>
        </div>
        <SearchForm />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-9">
        <div className="mb-4.5 flex items-end justify-between border-b-2 border-ink pb-2.5">
          <h2 className="text-[21px] font-extrabold tracking-tight">인기 채용공고</h2>
          <Link href="/jobs" className="text-[13px] font-bold text-teal hover:underline">
            전체보기 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {normalizeJobs(popularJobs).map((job) => (
            <JobCard key={job.id} job={job} isLoggedIn={!!user} isFavorited={favoriteIds.includes(job.id)} isSeeker={isSeeker} />
          ))}
          {(!popularJobs || popularJobs.length === 0) && (
            <p className="col-span-full py-12 text-center text-ink-soft">
              아직 등록된 공고가 없습니다. Supabase에 데이터를 연결하면 이 자리에 실제 채용공고가 표시됩니다.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl rounded px-6 py-9" style={{ background: "var(--color-ink)" }}>
        <div className="mb-1.5 flex items-end justify-between border-b-2 border-gold pb-2.5">
          <h2 className="text-[21px] font-extrabold tracking-tight text-white">
            치과기공사 전문관 <span className="ml-2 text-[13px] font-bold text-gold">기공소 채용 특화</span>
          </h2>
          <Link href="/jobs?category=lab" className="rounded-sm border border-gold px-3 py-1.5 text-[12.5px] font-bold text-gold hover:bg-gold/10">
            기공소 회원 바로가기
          </Link>
        </div>
        <p className="mb-4.5 mt-1 text-[13.5px] text-[#B9BFBC]">
          치과기공사 · CAD/CAM · 기공소 직원 채용만 모아봤습니다. 케이스 단가와 기공 수당을 함께 확인하세요.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {normalizeJobs(labJobs).map((job) => (
            <JobCard key={job.id} job={job} isLoggedIn={!!user} isFavorited={favoriteIds.includes(job.id)} isSeeker={isSeeker} />
          ))}
          {(!labJobs || labJobs.length === 0) && (
            <p className="col-span-full py-12 text-center text-[#B9BFBC]">
              기공소 채용공고가 아직 없습니다.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl rounded px-6 py-9" style={{ background: "var(--color-teal)" }}>
        <div className="mb-1.5 flex items-end justify-between border-b-2 border-white/40 pb-2.5">
          <h2 className="text-[21px] font-extrabold tracking-tight text-white">
            치과위생사 전문관 <span className="ml-2 text-[13px] font-bold text-teal-tint">위생사 채용 특화</span>
          </h2>
          <Link href="/jobs?job_type=치과위생사" className="rounded-sm border border-white px-3 py-1.5 text-[12.5px] font-bold text-white hover:bg-white/10">
            치과위생사 공고 더보기
          </Link>
        </div>
        <p className="mb-4.5 mt-1 text-[13.5px] text-teal-tint">
          치과위생사 채용만 모아봤습니다. 스케일링·진료보조·환자 응대 경력을 살릴 수 있는 자리를 확인하세요.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {normalizeJobs(hygienistJobs).map((job) => (
            <JobCard key={job.id} job={job} isLoggedIn={!!user} isFavorited={favoriteIds.includes(job.id)} isSeeker={isSeeker} />
          ))}
          {(!hygienistJobs || hygienistJobs.length === 0) && (
            <p className="col-span-full py-12 text-center text-teal-tint">
              치과위생사 채용공고가 아직 없습니다.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-9">
        <div className="mb-4.5 border-b-2 border-ink pb-2.5">
          <h2 className="text-[21px] font-extrabold tracking-tight">최신 구직자</h2>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {((seekers || []) as (Seeker & { profiles: { name: string } })[]).map((s) => (
            <SeekerCard key={s.id} seeker={s} name={s.profiles?.name || "구직자"} />
          ))}
          {(!seekers || seekers.length === 0) && (
            <p className="col-span-full py-12 text-center text-ink-soft">아직 등록된 구직자가 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
