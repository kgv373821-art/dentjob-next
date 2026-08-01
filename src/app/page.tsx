import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SearchForm from "@/components/SearchForm";
import JobCard from "@/components/JobCard";
import AiRecommend from "@/components/AiRecommend";
import PopularClinics from "@/components/PopularClinics";
import RecentlyViewedJobs from "@/components/RecentlyViewedJobs";
import { LAB_SPECIALTIES } from "@/lib/constants";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import type { JobPost, BoardPost } from "@/lib/types";
import { BOARD_LABELS } from "@/lib/types";

export const revalidate = 60;

const JOB_TYPE_SHORTCUTS = ["치과기공사", "치과위생사", "치과조무사", "치과의사"];

function normalizeJobs(rows: unknown) {
  return ((rows as Record<string, unknown>[]) || []).map((r) => ({
    ...r,
    clinic_name: (r as unknown as { clinics?: { clinic_name: string } }).clinics?.clinic_name,
    lab_name: (r as unknown as { labs?: { lab_name: string } }).labs?.lab_name,
  })) as JobPost[];
}

export default async function HomePage() {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { data: premiumJobs },
    { data: todayJobs },
    { data: labJobs },
    { count: todayCount },
    { count: urgentCount },
    { count: seekerCount },
    { data: communityPosts },
    { data: usedEquipment },
    { data: outsourcing },
    { data: { user } },
    favoriteIds,
  ] = await Promise.all([
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "approved")
      .eq("is_main_exposed", true)
      .order("posted_at", { ascending: false })
      .limit(6),
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "approved")
      .order("is_pinned", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(9),
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
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("posted_at", todayStart.toISOString()),
    supabase
      .from("job_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_urgent", true),
    supabase.from("seekers").select("*", { count: "exact", head: true }),
    supabase.from("board_posts").select("*, profiles(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("board_posts").select("*, profiles(name)").eq("board", "used_equipment").order("created_at", { ascending: false }).limit(4),
    supabase
      .from("job_posts")
      .select("*, labs(lab_name)")
      .eq("status", "approved")
      .or("lab_category.eq.외주모집,lab_specialty.eq.외주 의뢰")
      .order("posted_at", { ascending: false })
      .limit(4),
    supabase.auth.getUser(),
    getMyFavoriteIds("job_post"),
  ]);

  let isSeeker = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isSeeker = profile?.role === "seeker";
  }

  const cardProps = { isLoggedIn: !!user, isSeeker };

  return (
    <div>
      {/* 검색바 */}
      <section className="mx-auto max-w-6xl px-6 pb-6 pt-10">
        <h1 className="mb-4 text-center text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
          서울·경기 치과 구인·구직, 가장 <span className="text-coral">빠른 연결</span>
        </h1>
        <SearchForm bar />
      </section>

      {/* 통계바 */}
      <section className="mx-auto max-w-6xl px-6 pb-9">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 rounded border border-line bg-white py-3.5 text-[13px] font-bold text-ink-soft">
          <span>
            오늘 등록 <span className="text-teal">{todayCount ?? 0}건</span>
          </span>
          <span>
            긴급채용 <span className="text-coral">{urgentCount ?? 0}건</span>
          </span>
          <span>
            구직자 <span className="text-teal">{seekerCount ?? 0}명</span>
          </span>
        </div>
      </section>

      {/* 프리미엄 채용관 */}
      {premiumJobs && premiumJobs.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-9">
          <div className="mb-4.5 flex items-end justify-between border-b-2 border-gold pb-2.5">
            <h2 className="text-[18px] font-extrabold tracking-tight text-gold">★★★★ 프리미엄 채용</h2>
            <Link href="/jobs" className="text-[13px] font-bold text-teal hover:underline">
              전체보기 →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {normalizeJobs(premiumJobs).map((job) => (
              <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} compact />
            ))}
          </div>
        </section>
      )}

      {/* AI 추천 채용 */}
      <AiRecommend />

      {/* 직종별 바로가기 */}
      <section className="mx-auto max-w-6xl px-6 pb-9">
        <div className="mb-4.5 border-b-2 border-ink pb-2.5">
          <h2 className="text-[18px] font-extrabold tracking-tight">직종별 바로가기</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {JOB_TYPE_SHORTCUTS.map((jt) => (
            <Link
              key={jt}
              href={`/jobs?job_type=${encodeURIComponent(jt)}`}
              className="rounded-[3px] border border-line bg-white py-6 text-center font-bold transition hover:-translate-y-0.5 hover:border-teal hover:text-teal hover:shadow-lg"
            >
              {jt}
            </Link>
          ))}
        </div>
      </section>

      {/* 치과기공사 전문관 */}
      <section className="mx-auto max-w-6xl rounded px-6 py-9" style={{ background: "var(--color-ink)" }}>
        <div className="mb-1.5 flex items-end justify-between border-b-2 border-gold pb-2.5">
          <h2 className="text-[18px] font-extrabold tracking-tight text-white">
            치과기공사 전문관 <span className="ml-2 text-[13px] font-bold text-gold">기공소 채용 특화</span>
          </h2>
          <Link href="/jobs?category=lab" className="rounded-sm border border-gold px-3 py-1.5 text-[12.5px] font-bold text-gold hover:bg-gold/10">
            기공소 회원 바로가기
          </Link>
        </div>
        <p className="mb-4 mt-1 text-[13.5px] text-[#B9BFBC]">
          치과기공사 · CAD/CAM · 기공소 직원 채용만 모아봤습니다. 케이스 단가와 기공 수당을 함께 확인하세요.
        </p>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {LAB_SPECIALTIES.map((s) => (
            <Link
              key={s}
              href={`/jobs?category=lab&lab_specialty=${encodeURIComponent(s)}`}
              className="rounded-full border border-gold px-3 py-1.5 text-[12px] font-bold text-gold hover:bg-gold/10"
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {normalizeJobs(labJobs).map((job) => (
            <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} />
          ))}
          {(!labJobs || labJobs.length === 0) && (
            <p className="col-span-full py-12 text-center text-[#B9BFBC]">기공소 채용공고가 아직 없습니다.</p>
          )}
        </div>
      </section>

      {/* 오늘 등록 공고 + 사이드바 */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-9 md:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-4.5 border-b-2 border-ink pb-2.5">
            <h2 className="text-[18px] font-extrabold tracking-tight">오늘 등록된 공고</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {normalizeJobs(todayJobs).map((job) => (
              <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} showNewBadge />
            ))}
            {(!todayJobs || todayJobs.length === 0) && (
              <p className="col-span-full py-12 text-center text-ink-soft">아직 등록된 공고가 없습니다.</p>
            )}
          </div>
        </div>

        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <AiRecommend compact />
          <PopularClinics />
          <div className="rounded-[3px] border border-dashed border-line bg-white p-4 text-center">
            <p className="mb-1 text-[12px] font-bold text-ink-soft">광고</p>
            <p className="mb-3 text-[12.5px]">우리 병원/기공소를 메인에 노출해보세요.</p>
            <Link href="/pricing" className="inline-block rounded-sm bg-coral px-4 py-2 text-[12px] font-bold text-white hover:bg-coral-deep">
              광고 상품 보기
            </Link>
          </div>
          <RecentlyViewedJobs />
        </aside>
      </section>

      {/* 커뮤니티 / 중고장비 / 외주거래 */}
      <section className="mx-auto max-w-6xl px-6 py-9">
        <div className="grid gap-6 sm:grid-cols-3">
          <PreviewList
            title="커뮤니티"
            href="/community"
            items={(communityPosts || []).map((p: BoardPost) => ({
              id: p.id,
              href: `/community/${p.board}/${p.id}`,
              label: `[${BOARD_LABELS[p.board]}] ${p.title}`,
            }))}
            emptyLabel="아직 등록된 글이 없습니다."
          />
          <PreviewList
            title="중고장비"
            href="/community/used_equipment"
            items={(usedEquipment || []).map((p: BoardPost) => ({
              id: p.id,
              href: `/community/used_equipment/${p.id}`,
              label: p.price ? `${p.title} · ${p.price.toLocaleString()}원` : p.title,
            }))}
            emptyLabel="등록된 중고장비가 없습니다."
          />
          <PreviewList
            title="외주거래"
            href="/jobs?category=lab&lab_specialty=외주 의뢰"
            items={normalizeJobs(outsourcing).map((j) => ({ id: j.id, href: `/jobs/${j.id}`, label: `${j.title} · ${j.lab_name || ""}` }))}
            emptyLabel="등록된 외주 공고가 없습니다."
          />
        </div>
      </section>
    </div>
  );
}

function PreviewList({
  title,
  href,
  items,
  emptyLabel,
}: {
  title: string;
  href: string;
  items: { id: string; href: string; label: string }[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-[3px] border border-line bg-white p-4">
      <div className="mb-2.5 flex items-center justify-between border-b border-line pb-2">
        <h3 className="text-[13.5px] font-extrabold">{title}</h3>
        <Link href={href} className="text-[11.5px] font-bold text-teal hover:underline">
          더보기 →
        </Link>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="truncate text-[12.5px]">
              <Link href={it.href} className="hover:text-teal">
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-[12px] text-ink-soft">{emptyLabel}</p>
      )}
    </div>
  );
}
