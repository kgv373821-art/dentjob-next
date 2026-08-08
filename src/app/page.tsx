import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import SearchForm from "@/components/SearchForm";
import JobCard from "@/components/JobCard";
import AiRecommend from "@/components/AiRecommend";
import PopularClinics from "@/components/PopularClinics";
import RecentlyViewedJobs from "@/components/RecentlyViewedJobs";
import NoticesSidebar from "@/components/NoticesSidebar";
import AdSlot from "@/components/AdSlot";
import { LAB_SPECIALTIES } from "@/lib/constants";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import type { JobPost, BoardPost } from "@/lib/types";
import { BOARD_LABELS } from "@/lib/types";

export const revalidate = 60;

const JOB_TYPE_SHORTCUTS = ["치과기공사", "치과위생사", "치과조무사", "치과의사"];
const CLINIC_JOB_SHORTCUTS = ["치과의사", "치과위생사", "치과조무사", "상담실장", "데스크"];

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
  const nowIso = new Date().toISOString();
  const notExpired = `expires_at.is.null,expires_at.gt.${nowIso}`;

  const [
    { data: premiumJobs },
    { data: todayJobs },
    { data: labJobs },
    { data: clinicJobs },
    { count: todayCount },
    { count: urgentCount },
    { count: seekerCount },
    { data: communityPosts },
    { data: usedEquipment },
    { data: outsourcingRaw },
    { data: { user } },
    favoriteIds,
  ] = await Promise.all([
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "approved")
      .eq("is_main_exposed", true)
      .or(notExpired)
      .order("posted_at", { ascending: false })
      .limit(6),
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "approved")
      .or(notExpired)
      .order("is_pinned", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(9),
    supabase
      .from("job_posts")
      .select("*, labs(lab_name)")
      .eq("status", "approved")
      .not("lab_id", "is", null)
      .or(notExpired)
      .order("is_pinned", { ascending: false })
      .order("is_urgent", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(6),
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name)")
      .eq("status", "approved")
      .not("clinic_id", "is", null)
      .or(notExpired)
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
      .eq("is_urgent", true)
      .or(notExpired),
    supabase.from("seekers").select("*", { count: "exact", head: true }),
    supabase.from("board_posts").select("*, profiles(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("board_posts").select("*, profiles(name)").eq("board", "used_equipment").order("created_at", { ascending: false }).limit(4),
    supabase
      .from("job_posts")
      .select("*, labs(lab_name)")
      .eq("status", "approved")
      .or("lab_category.eq.외주모집,lab_specialty.eq.외주 의뢰")
      .order("posted_at", { ascending: false })
      .limit(8),
    supabase.auth.getUser(),
    getMyFavoriteIds("job_post"),
  ]);

  const outsourcing = (outsourcingRaw || [])
    .filter((j) => !j.expires_at || j.expires_at > nowIso)
    .slice(0, 4);

  let isSeeker = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isSeeker = profile?.role === "seeker";
  }

  const cardProps = { isLoggedIn: !!user, isSeeker };

  return (
    <div>
      {/* 히어로 배너 */}
      <section className="relative min-h-[300px] overflow-hidden px-6 py-10 sm:min-h-[440px] sm:py-16">
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-[rgba(11,61,58,0.9)] sm:hidden" />
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,61,58,0.97) 0%, rgba(11,61,58,0.92) 32%, rgba(11,61,58,0.55) 58%, rgba(11,61,58,0.12) 82%)",
          }}
        />

        <div className="relative mx-auto flex max-w-6xl items-center">
          <div className="max-w-lg text-center lg:text-left">
            <span className="mb-4 inline-block rounded-full border border-gold/60 bg-white/10 px-3.5 py-1.5 font-mono text-[11.5px] font-bold tracking-widest text-gold">
              SEOUL · GYEONGGI DENTAL NO.1
            </span>
            <h1 className="mb-4 text-[30px] font-extrabold leading-tight tracking-tight text-white sm:text-[42px]">
              서울·경기 치과 전문
              <br />
              구인구직 <span className="text-gold">No.1 플랫폼</span>
            </h1>
            <p className="mx-auto max-w-md text-[15px] leading-relaxed text-white/80 lg:mx-0">
              치과의사부터 데스크·상담실장까지, 치과기공사·기공소 채용까지 — 지역과 직종으로 가장 빠르게 연결합니다.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
              {["✓ 검증된 병원·기공소", "✓ 원터치 지원", "✓ 무료 등록"].map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 검색바 */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-6">
        <SearchForm bar />
      </section>
      <div className="pb-6" />

      {/* 광고: 메인상단 */}
      <section className="mx-auto max-w-6xl px-6 pb-9">
        <AdSlot position="main_top" />
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
        <section
          className="mx-auto max-w-6xl rounded px-6 py-8"
          style={{ background: "linear-gradient(180deg, rgba(20,184,166,0.08), transparent)" }}
        >
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

      {/* 광고: 메인중단 */}
      <section className="mx-auto max-w-6xl px-6 pb-9">
        <AdSlot position="main_mid" />
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
            <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} emphasizeUrgent />
          ))}
          {(!labJobs || labJobs.length === 0) && (
            <p className="col-span-full py-12 text-center text-[#B9BFBC]">기공소 채용공고가 아직 없습니다.</p>
          )}
        </div>
      </section>

      {/* 치과 구인등록 */}
      <section
        className="mx-auto mt-6 max-w-6xl rounded px-6 py-9"
        style={{ background: "linear-gradient(135deg, #0b4a45, #06211f)" }}
      >
        <div className="mb-1.5 flex items-end justify-between border-b-2 border-gold pb-2.5">
          <h2 className="text-[18px] font-extrabold tracking-tight text-white">
            치과 구인등록 <span className="ml-2 text-[13px] font-bold text-gold">치과·병원 채용 특화</span>
          </h2>
          <Link href="/jobs?category=clinic" className="rounded-sm border border-white/60 px-3 py-1.5 text-[12.5px] font-bold text-white hover:bg-white/10">
            치과 채용 전체보기
          </Link>
        </div>
        <p className="mb-4 mt-1 text-[13.5px] text-white/80">
          치과의사·치과위생사·치과조무사부터 데스크·상담실장까지, 치과 전용 채용공고만 모아봤습니다.
        </p>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {CLINIC_JOB_SHORTCUTS.map((jt) => (
            <Link
              key={jt}
              href={`/jobs?category=clinic&job_type=${encodeURIComponent(jt)}`}
              className="rounded-full border border-white/60 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-white/10"
            >
              {jt}
            </Link>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {normalizeJobs(clinicJobs).map((job) => (
            <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} emphasizeUrgent />
          ))}
          {(!clinicJobs || clinicJobs.length === 0) && (
            <p className="col-span-full py-12 text-center text-white/80">치과 채용공고가 아직 없습니다.</p>
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
              <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} showNewBadge emphasizeUrgent />
            ))}
            {(!todayJobs || todayJobs.length === 0) && (
              <p className="col-span-full py-12 text-center text-ink-soft">아직 등록된 공고가 없습니다.</p>
            )}
          </div>
        </div>

        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <AiRecommend compact />
          <PopularClinics />
          <AdSlot position="sidebar" />
          <div className="rounded-[3px] border border-dashed border-coral/40 bg-coral/5 p-4 text-center">
            <p className="mb-1 text-[12px] font-bold text-coral">📢 광고</p>
            <p className="mb-3 text-[12.5px]">우리 병원/기공소를 메인에 노출해보세요.</p>
            <Link href="/pricing" className="inline-block rounded-sm bg-coral px-4 py-2 text-[12px] font-bold text-white hover:bg-coral-deep">
              광고 상품 보기
            </Link>
          </div>
          <RecentlyViewedJobs />
          <NoticesSidebar />
        </aside>
      </section>

      {/* 커뮤니티 / 중고장비 / 외주거래 */}
      <section className="mx-auto max-w-6xl px-6 py-9">
        <div className="grid gap-6 sm:grid-cols-3">
          <PreviewList
            title="💬 커뮤니티"
            href="/community"
            accent="border-t-teal"
            items={(communityPosts || []).map((p: BoardPost) => ({
              id: p.id,
              href: `/community/${p.board}/${p.id}`,
              label: `[${BOARD_LABELS[p.board]}] ${p.title}`,
            }))}
            emptyLabel="아직 등록된 글이 없습니다."
          />
          <PreviewList
            title="🛠 중고장비"
            href="/community/used_equipment"
            accent="border-t-gold"
            items={(usedEquipment || []).map((p: BoardPost) => ({
              id: p.id,
              href: `/community/used_equipment/${p.id}`,
              label: p.price ? `${p.title} · ${p.price.toLocaleString()}원` : p.title,
            }))}
            emptyLabel="등록된 중고장비가 없습니다."
          />
          <PreviewList
            title="🔗 외주거래"
            href="/jobs?category=lab&lab_specialty=외주 의뢰"
            accent="border-t-coral"
            items={normalizeJobs(outsourcing).map((j) => ({ id: j.id, href: `/jobs/${j.id}`, label: `${j.title} · ${j.lab_name || ""}` }))}
            emptyLabel="등록된 외주 공고가 없습니다."
          />
        </div>
      </section>

      {/* 광고: 메인하단 */}
      <section className="mx-auto max-w-6xl px-6 pb-9">
        <AdSlot position="main_bottom" />
      </section>
    </div>
  );
}

function PreviewList({
  title,
  href,
  items,
  emptyLabel,
  accent,
}: {
  title: string;
  href: string;
  items: { id: string; href: string; label: string }[];
  emptyLabel: string;
  accent: string;
}) {
  return (
    <div className={`rounded-[3px] border border-t-4 border-line bg-white p-4 ${accent}`}>
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
