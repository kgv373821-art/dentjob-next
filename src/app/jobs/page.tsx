import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import JobCard from "@/components/JobCard";
import { REGIONS, JOB_TYPES } from "@/lib/constants";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import type { JobPost } from "@/lib/types";

export const metadata: Metadata = {
  title: "채용공고 전체보기",
  description: "서울·경기 치과, 치과기공사·기공소 채용공고를 지역·직종·급여별로 검색하세요.",
};

const SORTS = [
  { key: "new", label: "오늘 등록" },
  { key: "pay", label: "급여 높은 순" },
  { key: "views", label: "조회수 많은 순" },
  { key: "urgent", label: "긴급 채용" },
] as const;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; job_type?: string; category?: string; sort?: string; lab_specialty?: string; q?: string }>;
}) {
  const { region, job_type, category, sort = "new", lab_specialty, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("job_posts")
    .select("*, clinics(clinic_name), labs(lab_name)")
    .eq("status", "approved");

  if (region) query = query.eq("region", region);
  if (job_type) query = query.eq("job_type", job_type);
  if (lab_specialty) query = query.eq("lab_specialty", lab_specialty);
  if (category === "lab") query = query.not("lab_id", "is", null);
  if (category === "clinic") query = query.not("clinic_id", "is", null);
  if (sort === "urgent") query = query.eq("is_urgent", true);
  if (q) query = query.ilike("title", `%${q}%`);

  query = query.order("is_pinned", { ascending: false });
  if (sort === "pay") query = query.order("pay_min", { ascending: false });
  else if (sort === "views") query = query.order("view_count", { ascending: false });
  else query = query.order("posted_at", { ascending: false, nullsFirst: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data }, favoriteIds] = await Promise.all([query.limit(60), getMyFavoriteIds("job_post")]);
  let isSeeker = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isSeeker = profile?.role === "seeker";
  }
  const jobs = (data || []).map((r) => ({
    ...r,
    clinic_name: (r as unknown as { clinics?: { clinic_name: string } }).clinics?.clinic_name,
    lab_name: (r as unknown as { labs?: { lab_name: string } }).labs?.lab_name,
  })) as JobPost[];

  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { region, job_type, category, sort, lab_specialty, q, ...overrides };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    return `/jobs?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-9">
      <div className="mb-4.5 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-2.5">
        <h1 className="text-[21px] font-extrabold tracking-tight">
          {category === "lab" ? "치과기공사 · 기공소 채용공고" : "전체 채용공고"}
        </h1>
        <div className="flex gap-1">
          {SORTS.map((s) => (
            <a
              key={s.key}
              href={qs({ sort: s.key })}
              className={`rounded-sm px-3 py-1.5 text-[12.5px] font-bold ${
                sort === s.key ? "bg-teal text-white" : "text-ink-soft hover:bg-teal-tint hover:text-teal"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <form className="mb-6 flex flex-wrap gap-2.5" action="/jobs">
        <select name="region" defaultValue={region || ""} className="rounded-sm border border-line bg-white px-3 py-2 text-[13px]">
          <option value="">전체 지역</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select name="job_type" defaultValue={job_type || ""} className="rounded-sm border border-line bg-white px-3 py-2 text-[13px]">
          <option value="">전체 직종</option>
          {JOB_TYPES.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        <input name="q" defaultValue={q || ""} placeholder="공고 제목으로 검색" className="rounded-sm border border-line bg-white px-3 py-2 text-[13px]" />
        <input type="hidden" name="category" value={category || ""} />
        <input type="hidden" name="sort" value={sort} />
        <button className="rounded-sm border border-teal px-4 py-2 text-[13px] font-bold text-teal hover:bg-teal-tint">
          검색
        </button>
      </form>

      {category === "lab" && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {["", ...["CAD/CAM", "지르코니아", "포세린", "덴처", "교정", "임플란트", "밀링센터", "외주 의뢰"]].map((s) => (
            <a
              key={s || "all"}
              href={qs({ lab_specialty: s || undefined })}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${
                (lab_specialty || "") === s ? "border-gold bg-gold text-white" : "border-line text-ink-soft hover:border-gold hover:text-gold"
              }`}
            >
              {s || "전체 분야"}
            </a>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isLoggedIn={!!user} isFavorited={favoriteIds.includes(job.id)} isSeeker={isSeeker} />
        ))}
      </div>
      {jobs.length === 0 && (
        <p className="py-16 text-center text-ink-soft">조건에 맞는 공고가 없습니다. 조건을 넓혀 다시 검색해보세요.</p>
      )}
    </div>
  );
}
