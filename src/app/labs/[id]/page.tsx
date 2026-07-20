import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { submitLabReview } from "@/lib/actions/reviews";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import FavoriteButton from "@/components/FavoriteButton";
import JobCard from "@/components/JobCard";
import type { JobPost } from "@/lib/types";

export default async function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lab } = await supabase.from("labs").select("*").eq("id", id).single();
  if (!lab) notFound();

  const [{ data: reviews }, { data: jobs }, { data: { user } }, favoriteIds] = await Promise.all([
    supabase.from("lab_reviews").select("*, profiles(name)").eq("lab_id", id).order("created_at", { ascending: false }),
    supabase.from("job_posts").select("*").eq("lab_id", id).eq("status", "approved"),
    supabase.auth.getUser(),
    getMyFavoriteIds("lab"),
  ]);

  const reviewRows = (reviews || []).map((r) => ({
    ...r,
    author_name: (r as unknown as { profiles?: { name: string } }).profiles?.name,
  }));
  const avgRating = reviewRows.length ? (reviewRows.reduce((s, r) => s + r.rating, 0) / reviewRows.length).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className={`mb-6 overflow-hidden rounded border border-line ${lab.is_page_ad ? "ring-2 ring-gold" : ""}`}>
        <div
          className="flex h-[140px] items-center justify-center font-mono text-[12px] tracking-widest text-white"
          style={{ background: "linear-gradient(135deg, var(--color-ink), var(--color-teal-deep))" }}
        >
          {lab.lab_name}
        </div>
        <div className="p-6">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-extrabold">{lab.lab_name}</h1>
              <p className="text-[13px] text-ink-soft">
                {lab.region_main} {lab.address ? `· ${lab.address}` : ""}
              </p>
            </div>
            <FavoriteButton targetType="lab" targetId={id} initialFavorited={favoriteIds.includes(id)} isLoggedIn={!!user} />
          </div>
          {avgRating && (
            <p className="mb-2 text-[13px] font-bold text-gold">
              ★ {avgRating} <span className="font-normal text-ink-soft">({reviewRows.length}개 리뷰)</span>
            </p>
          )}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(lab.specialties || []).map((s: string) => (
              <span key={s} className="rounded-full border border-gold px-2.5 py-0.5 text-[11px] font-bold text-gold">
                {s}
              </span>
            ))}
            {lab.has_cadcam && (
              <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold text-white">CAD/CAM 장비 보유</span>
            )}
          </div>
          {lab.intro && <p className="text-[13.5px] leading-relaxed text-ink-soft">{lab.intro}</p>}
        </div>
      </div>

      {jobs && jobs.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-[15px] font-bold">진행중인 채용공고</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(jobs as JobPost[]).map((j) => (
              <JobCard key={j.id} job={{ ...j, lab_name: lab.lab_name }} />
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-[15px] font-bold">기공소 리뷰</h2>
      {user ? (
        <ReviewForm action={submitLabReview.bind(null, id)} />
      ) : (
        <p className="mb-4 text-[13px] text-ink-soft">
          <Link href="/login" className="font-bold text-teal">
            로그인
          </Link>{" "}
          후 리뷰를 작성할 수 있습니다.
        </p>
      )}
      <ReviewList reviews={reviewRows} />
    </div>
  );
}
