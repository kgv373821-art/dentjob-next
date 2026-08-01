import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { incrementViewCount } from "@/lib/actions/jobs";
import ApplyForm from "@/components/ApplyForm";
import FavoriteButton from "@/components/FavoriteButton";
import KakaoShareButton from "@/components/KakaoShareButton";
import RecentlyViewedTracker from "@/components/RecentlyViewedTracker";
import { getMyFavoriteIds } from "@/lib/actions/favorites";

type Props = { params: Promise<{ id: string }> };

async function getJob(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_posts")
    .select("*, clinics(clinic_name, address, profiles(phone)), labs(lab_name, address, specialties, profiles(phone))")
    .eq("id", id)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: "공고를 찾을 수 없습니다" };
  return {
    title: job.title,
    description: `${job.region} · ${job.job_type} · 월 ${job.pay_min}만원 — ${job.description?.slice(0, 100) || ""}`,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  await incrementViewCount(id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const favoriteIds = await getMyFavoriteIds("job_post");

  const clinic = (job as unknown as { clinics?: { clinic_name: string; address: string; profiles?: { phone: string } } }).clinics;
  const lab = (job as unknown as { labs?: { lab_name: string; address: string; specialties: string[]; profiles?: { phone: string } } }).labs;
  const org = clinic?.clinic_name || lab?.lab_name;
  const address = clinic?.address || lab?.address;
  const phone = clinic?.profiles?.phone || lab?.profiles?.phone;
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/jobs/${job.id}`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <RecentlyViewedTracker
        job={{ id: job.id, title: job.title, region: job.region, job_type: job.job_type, pay_min: job.pay_min }}
      />
      <div className="overflow-hidden rounded border border-line">
        {job.image_urls?.[0] ? (
          <div className="relative h-[220px] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={job.image_urls[0]} alt={job.title} className="h-full w-full object-cover" />
            <div className="absolute right-3 top-3">
              <FavoriteButton targetType="job_post" targetId={job.id} initialFavorited={favoriteIds.includes(job.id)} isLoggedIn={!!user} />
            </div>
          </div>
        ) : (
          <div
            className="relative flex h-[150px] items-center justify-center font-mono text-[12px] tracking-widest text-white"
            style={{ background: `linear-gradient(135deg, var(--color-teal), var(--color-teal-deep))` }}
          >
            {org}
            <div className="absolute right-3 top-3">
              <FavoriteButton targetType="job_post" targetId={job.id} initialFavorited={favoriteIds.includes(job.id)} isLoggedIn={!!user} />
            </div>
          </div>
        )}
        {job.image_urls && job.image_urls.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto border-b border-line bg-paper-dim p-2">
            {job.image_urls.slice(1).map((url: string) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt={job.title} className="h-14 w-14 flex-shrink-0 rounded-sm border border-line object-cover" />
            ))}
          </div>
        )}
        <div className="p-7">
          <h1 className="mb-1 text-[20px] font-extrabold">{job.title}</h1>
          <div className="mb-4 text-[13px] text-ink-soft">
            {org} · {job.region}
          </div>

          {/* 모바일 원터치 액션: 전화 · 문자 · 카카오톡 공유 */}
          <div className="mb-4.5 flex flex-wrap gap-2">
            {phone && (
              <>
                <a href={`tel:${phone}`} className="flex items-center justify-center gap-1.5 rounded-sm bg-teal px-3.5 py-2.5 text-[13px] font-bold text-white hover:bg-teal-deep">
                  전화 바로 걸기
                </a>
                <a
                  href={`sms:${phone}?body=${encodeURIComponent(`[덴트잡] ${job.title} 공고 보고 문자 드립니다.`)}`}
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-teal px-3.5 py-2.5 text-[13px] font-bold text-teal hover:bg-teal-tint"
                >
                  문자 남기기
                </a>
              </>
            )}
            <KakaoShareButton title={job.title} description={`${org} · ${job.region} · 월 ${job.pay_min}만원`} url={pageUrl} />
          </div>

          <dl className="mb-4.5 grid grid-cols-[90px_1fr] gap-y-2 gap-x-3 text-[13.5px]">
            <dt className="font-semibold text-ink-soft">모집분야</dt>
            <dd>
              {job.job_type}
              {job.lab_specialty ? ` · ${job.lab_specialty}` : ""}
            </dd>
            <dt className="font-semibold text-ink-soft">급여</dt>
            <dd className="font-mono">
              월 {job.pay_min}만원 {job.pay_note}
            </dd>
            {job.work_hours && (
              <>
                <dt className="font-semibold text-ink-soft">근무시간</dt>
                <dd>{job.work_hours}</dd>
              </>
            )}
            {job.welfare?.length > 0 && (
              <>
                <dt className="font-semibold text-ink-soft">복지</dt>
                <dd>{job.welfare.join(", ")}</dd>
              </>
            )}
            {address && (
              <>
                <dt className="font-semibold text-ink-soft">위치</dt>
                <dd>{address}</dd>
              </>
            )}
          </dl>

          {job.description && (
            <div className="mb-4.5 whitespace-pre-line rounded-sm border border-line bg-paper p-3.5 text-[13.5px] leading-relaxed">
              {job.description}
            </div>
          )}

          <ApplyForm jobPostId={job.id} isLoggedIn={!!user} />
        </div>
      </div>
    </div>
  );
}
