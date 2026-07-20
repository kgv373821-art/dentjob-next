import Link from "next/link";
import type { JobPost } from "@/lib/types";
import FavoriteButton from "@/components/FavoriteButton";
import QuickApplyButton from "@/components/QuickApplyButton";

export default function JobCard({
  job,
  isLoggedIn = false,
  isFavorited = false,
  isSeeker = false,
}: {
  job: JobPost;
  isLoggedIn?: boolean;
  isFavorited?: boolean;
  isSeeker?: boolean;
}) {
  const isLab = !!job.lab_id;
  const org = isLab ? job.lab_name : job.clinic_name;

  return (
    <div
      className={`relative rounded-[3px] border border-line bg-white p-[18px] transition hover:-translate-y-0.5 hover:border-teal hover:shadow-lg ${
        isLab ? "border-l-[3px] border-l-gold" : ""
      } ${job.is_pinned ? "ring-1 ring-gold" : ""}`}
    >
      <span className="ticket-dot -left-1.5" />
      <span className="ticket-dot -right-1.5" />

      <div className="absolute right-3 top-3">
        <FavoriteButton targetType="job_post" targetId={job.id} initialFavorited={isFavorited} isLoggedIn={isLoggedIn} />
      </div>

      <Link href={`/jobs/${job.id}`} className="block pr-9">
        <div className="font-mono text-[10.5px] text-ink-soft">
          NO.{job.id.slice(0, 8).toUpperCase()} · {job.region}
          {job.lab_specialty ? ` · ${job.lab_specialty}` : ""}
        </div>

        <div className="my-1.5 flex flex-wrap gap-1.5">
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

        <h3 className="text-[15.5px] font-extrabold leading-snug">{job.title}</h3>
        <div className="mb-2.5 text-[12.5px] text-ink-soft">
          {org} · {job.job_type}
        </div>

        <div className="my-2.5 border-t border-dashed border-line" />

        <div className="flex items-center justify-between text-[12px] text-ink-soft">
          <span className="font-mono text-[13.5px] font-bold text-teal">
            월 {job.pay_min}만원{isLab ? " + 기공수당" : ""}
          </span>
          <span className="font-mono text-[11px]">조회 {job.view_count}</span>
        </div>
      </Link>
      {isSeeker && (
        <div className="mt-2.5 border-t border-dashed border-line pt-2.5">
          <QuickApplyButton jobPostId={job.id} />
        </div>
      )}
    </div>
  );
}
