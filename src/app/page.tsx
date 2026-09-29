import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SearchForm from "@/components/SearchForm";
import HeroVideo from "@/components/HeroVideo";
import JobCard from "@/components/JobCard";
import AiRecommend from "@/components/AiRecommend";
import PopularClinics from "@/components/PopularClinics";
import RecentlyViewedJobs from "@/components/RecentlyViewedJobs";
import NoticesSidebar from "@/components/NoticesSidebar";
import AdSlot from "@/components/AdSlot";
import SiteIntroVideo from "@/components/SiteIntroVideo";
import { LAB_SPECIALTIES, isLabJob } from "@/lib/constants";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import { SHOW_PRICING } from "@/lib/siteInfo";
import type { JobPost, BoardPost } from "@/lib/types";
import { BOARD_LABELS } from "@/lib/types";

export const revalidate = 60;

// utm 등 추적 파라미터가 붙은 접속도 대표 주소(/)로 모이도록 canonical 지정
export const metadata: Metadata = { alternates: { canonical: "/" } };

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
  const todayStr = nowIso.slice(0, 10);
  const notExpired = `expires_at.is.null,expires_at.gt.${nowIso}`;
  const notPastDeadline = `recruit_end_date.is.null,recruit_end_date.gte.${todayStr}`;

  const [
    { data: premiumJobs },
    { data: todayJobs },
    { data: categorizedJobsRaw },
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
      .or(notPastDeadline)
      .order("posted_at", { ascending: false })
      .limit(6),
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "approved")
      .or(notExpired)
      .or(notPastDeadline)
      .order("is_pinned", { ascending: false })
      .order("is_premium", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(9),
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "approved")
      .or(notExpired)
      .or(notPastDeadline)
      .order("is_pinned", { ascending: false })
      .order("is_premium", { ascending: false })
      .order("is_urgent", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(50),
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
      .or(notExpired)
      .or(notPastDeadline),
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
    .filter((j) => (!j.expires_at || j.expires_at > nowIso) && (!j.recruit_end_date || j.recruit_end_date >= todayStr))
    .slice(0, 4);

  const categorizedJobs = normalizeJobs(categorizedJobsRaw);
  const labJobs = categorizedJobs.filter((j) => isLabJob(j)).slice(0, 12);
  const clinicJobs = categorizedJobs.filter((j) => !isLabJob(j)).slice(0, 12);

  let isSeeker = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isSeeker = profile?.role === "seeker";
  }

  const cardProps = { isLoggedIn: !!user, isSeeker };
  const visibleMarketStats = [
    { label: "오늘 등록", value: todayCount ?? 0, suffix: "건", className: "text-teal" },
    { label: "긴급채용", value: urgentCount ?? 0, suffix: "건", className: "text-coral" },
    { label: "구직자", value: seekerCount ?? 0, suffix: "명", className: "text-teal" },
  ].filter((stat) => stat.value > 0);

  return (
    <div>
      {/* 히어로 배너 */}
      <section className="grid overflow-hidden sm:grid-cols-[1.15fr_1fr]">
        <div
          className="flex flex-col justify-center px-6 py-14 sm:px-12 sm:py-16"
          style={{ background: "linear-gradient(135deg, #4a6b63, #3a5850)" }}
        >
          <h1 className="mb-4 text-[28px] font-extrabold leading-tight tracking-tight text-white sm:text-[38px]">
            서울·경기·인천 치과 전문
            <br />
            구인구직 <span className="text-white">No.1 플랫폼</span>
          </h1>
          <p className="mb-7 max-w-md text-[15px] leading-relaxed text-white/85">
            치과의사부터 데스크·상담실장까지, 치과기공사·기공소 채용까지 — 지역과 직종으로 가장 빠르게 연결합니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs" className="rounded-full bg-white px-6 py-3 text-[14px] font-bold text-[#3a5850] hover:bg-white/90">
              채용정보 보러가기
            </Link>
            <Link href="/signup" className="rounded-full border border-white/70 px-6 py-3 text-[14px] font-bold text-white hover:bg-white/10">
              회원가입하기
            </Link>
          </div>
        </div>
        <div className="relative min-h-[220px] sm:min-h-0">
          <HeroVideo />
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
          {visibleMarketStats.length > 0 ? (
            visibleMarketStats.map((stat) => (
              <span key={stat.label}>
                {stat.label} <span className={stat.className}>{stat.value}{stat.suffix}</span>
              </span>
            ))
          ) : (
            <span>
              새 채용공고는 수시로 업데이트됩니다. <Link href="/jobs" className="text-teal hover:underline">전체 공고 보기 →</Link>
            </span>
          )}
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

      {/* 치과기공사 전문관 */}
      <section className="mx-auto max-w-7xl rounded border border-line bg-white px-8 py-11">
        <div className="mb-2 flex items-end justify-between border-b-2 border-ink/15 pb-3">
          <h2 className="text-[19px] font-extrabold tracking-tight text-ink">
            치과기공사 전문관 <span className="ml-2 text-[13px] font-bold text-[#b45309]">기공소 채용 특화</span>
          </h2>
          <Link href="/jobs?category=lab" className="rounded-sm bg-ink px-3 py-1.5 text-[12.5px] font-bold text-white hover:bg-ink/90">
            기공소 회원 바로가기
          </Link>
        </div>
        <p className="mb-5 mt-1.5 text-[13.5px] text-ink/70">
          치과기공사 · CAD/CAM · 기공소 직원 채용만 모아봤습니다. 케이스 단가와 기공 수당을 함께 확인하세요.
        </p>
        <div className="mb-6 flex flex-wrap gap-1.5">
          {LAB_SPECIALTIES.map((s) => (
            <Link
              key={s}
              href={`/jobs?category=lab&lab_specialty=${encodeURIComponent(s)}`}
              className="rounded-full border border-ink/25 bg-white px-3 py-1.5 text-[12px] font-bold text-ink hover:border-ink"
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {labJobs.map((job) => (
            <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} emphasizeUrgent />
          ))}
          {labJobs.length === 0 && (
            <EmptyJobCta
              title="우리 기공소의 첫 공고를 올려보세요"
              desc="지금은 오픈 기념으로 공고 등록이 무료입니다. 등록 즉시 이 자리에 노출됩니다."
              href={user ? "/dashboard/lab/new" : "/signup"}
            />
          )}
        </div>
      </section>

      {/* 치과 구인등록 */}
      <section className="mx-auto mt-6 max-w-7xl rounded border border-line bg-white px-8 py-11">
        <div className="mb-2 flex items-end justify-between border-b-2 border-ink/15 pb-3">
          <h2 className="text-[19px] font-extrabold tracking-tight text-ink">
            치과 구인등록 <span className="ml-2 text-[13px] font-bold text-coral">치과·병원 채용 특화</span>
          </h2>
          <Link href="/jobs?category=clinic" className="rounded-sm bg-ink px-3 py-1.5 text-[12.5px] font-bold text-white hover:bg-ink/85">
            치과 채용 전체보기
          </Link>
        </div>
        <p className="mb-5 mt-1.5 text-[13.5px] text-ink/70">
          치과의사·치과위생사·치과조무사부터 데스크·상담실장까지, 치과 전용 채용공고만 모아봤습니다.
        </p>
        <div className="mb-6 flex flex-wrap gap-1.5">
          {CLINIC_JOB_SHORTCUTS.map((jt) => (
            <Link
              key={jt}
              href={`/jobs?category=clinic&job_type=${encodeURIComponent(jt)}`}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-bold text-ink hover:border-ink"
            >
              {jt}
            </Link>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clinicJobs.map((job) => (
            <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} emphasizeUrgent />
          ))}
          {clinicJobs.length === 0 && (
            <EmptyJobCta
              title="우리 치과의 첫 공고를 올려보세요"
              desc="지금은 오픈 기념으로 공고 등록이 무료입니다. 등록 즉시 이 자리에 노출됩니다."
              href={user ? "/dashboard/clinic/new" : "/signup"}
            />
          )}
        </div>
      </section>

      {/* 오늘 등록 공고 + 사이드바 */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-9 md:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-4.5 border-b-2 border-ink pb-2.5">
            <h2 className="text-[18px] font-extrabold tracking-tight">최근 등록된 공고</h2>
          </div>
          {(() => {
            const today = normalizeJobs(todayJobs);
            const todayLab = today.filter((j) => isLabJob(j));
            const todayClinic = today.filter((j) => !isLabJob(j));
            if (today.length === 0) return <p className="py-12 text-center text-ink-soft">아직 등록된 공고가 없습니다.</p>;
            return (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2.5 border-b border-teal pb-1.5 text-[13px] font-bold text-teal">
                    치과 <span className="font-normal text-ink-soft">({todayClinic.length})</span>
                  </h3>
                  {todayClinic.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {todayClinic.map((job) => (
                        <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} showNewBadge emphasizeUrgent compact />
                      ))}
                    </div>
                  ) : (
                    <EmptyInlineCta text="치과 공고를 무료로 올려보세요" href={user ? "/dashboard/clinic/new" : "/signup"} />
                  )}
                </div>
                <div>
                  <h3 className="mb-2.5 border-b border-gold pb-1.5 text-[13px] font-bold text-gold">
                    기공소 <span className="font-normal text-ink-soft">({todayLab.length})</span>
                  </h3>
                  {todayLab.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {todayLab.map((job) => (
                        <JobCard key={job.id} job={job} {...cardProps} isFavorited={favoriteIds.includes(job.id)} showNewBadge emphasizeUrgent compact />
                      ))}
                    </div>
                  ) : (
                    <EmptyInlineCta text="기공소 공고를 무료로 올려보세요" href={user ? "/dashboard/lab/new" : "/signup"} />
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <AiRecommend compact />
          <PopularClinics />
          <SiteIntroVideo />
          <AdSlot position="sidebar" />
          {SHOW_PRICING && (
            <div className="rounded-[3px] border border-dashed border-coral/40 bg-coral/5 p-4 text-center">
              <p className="mb-1 text-[12px] font-bold text-coral">📢 광고</p>
              <p className="mb-3 text-[12.5px]">우리 병원/기공소를 메인에 노출해보세요.</p>
              <Link href="/pricing" className="inline-block rounded-sm bg-coral px-4 py-2 text-[12px] font-bold text-white hover:bg-coral-deep">
                광고 상품 보기
              </Link>
            </div>
          )}
          <AdSlot position="main_mid" compact />
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
            emptyCta={{ text: "첫 글 남기기", href: "/community/free/new" }}
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
            emptyCta={{ text: "중고장비 무료 등록", href: "/community/used_equipment/new" }}
          />
          <PreviewList
            title="🔗 외주거래"
            href="/jobs?category=lab&lab_specialty=외주 의뢰"
            accent="border-t-coral"
            items={normalizeJobs(outsourcing).map((j) => ({ id: j.id, href: `/jobs/${j.id}`, label: `${j.title} · ${j.lab_name || ""}` }))}
            emptyCta={{ text: "외주 의뢰 무료 등록", href: user ? "/dashboard/lab/new" : "/signup" }}
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
  emptyCta,
  accent,
}: {
  title: string;
  href: string;
  items: { id: string; href: string; label: string }[];
  emptyCta: { text: string; href: string };
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
        <div className="py-3 text-center"><Link href={emptyCta.href} className="inline-block rounded-full border border-teal/40 bg-teal/5 px-3.5 py-1.5 text-[12px] font-bold text-teal hover:bg-teal/10">+ {emptyCta.text}</Link></div>
      )}
    </div>
  );
}

function EmptyJobCta({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <div className="col-span-full rounded-[3px] border border-dashed border-ink/20 bg-[#fffdf7] px-6 py-10 text-center">
      <p className="mb-1.5 text-[15px] font-extrabold text-ink">{title}</p>
      <p className="mb-5 text-[13px] text-ink/70">{desc}</p>
      <Link href={href} className="inline-block rounded-full bg-ink px-6 py-2.5 text-[13px] font-bold text-white hover:bg-ink/85">
        첫 공고 무료 등록하기
      </Link>
    </div>
  );
}

function EmptyInlineCta({ text, href }: { text: string; href: string }) {
  return (
    <div className="py-3 text-center">
      <Link href={href} className="inline-block rounded-full border border-teal/40 bg-teal/5 px-3.5 py-1.5 text-[12px] font-bold text-teal hover:bg-teal/10">
        + {text}
      </Link>
    </div>
  );
}
