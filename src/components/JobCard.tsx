import Link from "next/link";
import type { JobPost } from "@/lib/types";
import { formatPay } from "@/lib/constants";
import FavoriteButton from "@/components/FavoriteButton";
import QuickApplyButton from "@/components/QuickApplyButton";

function isRecent(job: JobPost) {
  const posted = job.posted_at || job.created_at;
  if (!posted) return false;
  return Date.now() - new Date(posted).getTime() < 3 * 24 * 60 * 60 * 1000;
}

export default function JobCard({
  job,
  isLoggedIn = false,
  isFavorited = false,
  isSeeker = false,
  compact = false,
  showNewBadge = false,
}: {
  job: JobPost;
  isLoggedIn?: boolean;
  isFavorited?: boolean;
  isSeeker?: boolean;
  compact?: boolean;
  showNewBadge?: boolean;
}) {
  const isLab = !!job.lab_id;
  const org = isLab ? job.lab_name : job.clinic_name;

  return (
    <div
      className={`relative rounded-[3px] border border-line bg-white transition hover:-translate-y-0.5 hover:border-teal hover:shadow-lg ${
        compact ? "p-3" : "p-[18px]"
      } ${isLab ? "border-l-[3px] border-l-gold" : ""} ${job.is_pinned ? "ring-1 ring-gold" : ""}`}
    >
      <span className="ticket-dot -left-1.5" />
      <span className="ticket-dot -right-1.5" />

      <div className="absolute right-3 top-3">
        <FavoriteButton targetType="job_post" targetId={job.id} initialFavorited={isFavorited} isLoggedIn={isLoggedIn} />
      </div>

      <Link href={`/jobs/${job.id}`} className="block pr-9">
        {!compact && job.image_urls?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.image_urls[0]}
            alt={job.title}
            className="mb-2.5 h-32 w-full rounded-sm border border-line object-cover"
          />
        )}
        <div className="font-mono text-[10.5px] text-ink-soft">
          NO.{job.id.slice(0, 8).toUpperCase()} · {job.region}
          {job.lab_specialty ? ` · ${job.lab_specialty}` : ""}
        </div>

        <div className="my-1.5 flex flex-wrap gap-1.5">
          {showNewBadge && isRecent(job) && (
            <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[10px] font-extrabold text-white">NEW</span>
          )}
          {job.is_pinned && (
            <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[10px] font-extrabold text-white">상단고정</span>
          )}
          {job.is_urgent && (
            <span className="rounded-sm bg-coral px-1.5 py-0.5 text-[10px] font-extrabold text-white">긴급</span>
          )}
          {job.is_main_exposed && (
            <span className="rounded-sm bg-teal px-1.5 py-0.5 text-[10px] font-extrabold text-white">프리미엄</span>
          )}
          {isLab && (
            <span className="rounded-sm border border-gold bg-ink px-1.5 py-0.5 text-[10px] font-extrabold text-gold">
              기공소
            </span>
          )}
        </div>

        <h3 className={`font-extrabold leading-snug ${compact ? "text-[13.5px]" : "text-[15.5px]"}`}>{job.title}</h3>
        <div className={`text-ink-soft ${compact ? "mb-1.5 text-[11.5px]" : "mb-2.5 text-[12.5px]"}`}>
          {org} · {job.job_type}
        </div>

        {!compact && <div className="my-2.5 border-t border-dashed border-line" />}

        <div className="flex items-center justify-between text-[12px] text-ink-soft">
          <span className={`font-mono font-bold text-teal ${compact ? "text-[12px]" : "text-[13.5px]"}`}>
            {formatPay(job.pay_min, isLab ? " + 기공수당" : "")}
          </span>
          {!compact && <span className="font-mono text-[11px]">조회 {job.view_count}</span>}
        </div>
      </Link>
      {!compact && isSeeker && (
        <div className="mt-2.5 border-t border-dashed border-line pt-2.5">
          <QuickApplyButton jobPostId={job.id} />
        </div>
      )}
    </div>
  );
}
