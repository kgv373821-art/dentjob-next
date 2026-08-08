import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { incrementViewCount } from "@/lib/actions/jobs";
import ApplyForm from "@/components/ApplyForm";
import FavoriteButton from "@/components/FavoriteButton";
import KakaoShareButton from "@/components/KakaoShareButton";
import RecentlyViewedTracker from "@/components/RecentlyViewedTracker";
import { getMyFavoriteIds } from "@/lib/actions/favorites";
import { formatPay } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

async function getJob(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_posts")
    .select(
      "*, clinics(clinic_name, address, profiles(phone)), labs(lab_name, address, specialties, photo_url, profiles(phone))"
    )
    .eq("id", id)
    .single();
  return data;
}

function InfoTable({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  const visible = rows.filter((r) => r.value !== null && r.value !== undefined && r.value !== "");
  if (visible.length === 0) return null;
  return (
    <table className="mb-4 w-full border-collapse overflow-hidden rounded-sm border border-line text-[13px]">
      <tbody>
        {visible.map((r, i) => (
          <tr key={r.label} className={i % 2 === 0 ? "bg-white" : "bg-paper-dim"}>
            <th className="w-[120px] border-b border-line px-3 py-2.5 text-left align-top text-[12.5px] font-bold text-ink-soft">
              <span className="mr-0.5 text-coral">*</span>
              {r.label}
            </th>
            <td className="whitespace-pre-line border-b border-line px-3 py-2.5">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: "공고를 찾을 수 없습니다" };
  return {
    title: job.title,
    description: `${job.region} · ${job.job_type} · ${formatPay(job.pay_min)} — ${job.description?.slice(0, 100) || ""}`,
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
  const lab = (
    job as unknown as {
      labs?: { lab_name: string; address: string; specialties: string[]; photo_url: string | null; profiles?: { phone: string } };
    }
  ).labs;
  const org = job.org_name || clinic?.clinic_name || lab?.lab_name;
  const address = clinic?.address || lab?.address;
  const phone = clinic?.profiles?.phone || lab?.profiles?.phone;
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/jobs/${job.id}`;
  const isExpired = !!job.expires_at && job.expires_at < new Date().toISOString();
  const isLab = !!job.lab_id;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {isExpired && (
        <p className="mb-4 rounded-sm border border-dashed border-line bg-paper-dim px-3.5 py-2.5 text-center text-[12.5px] font-bold text-ink-soft">
          노출 기간이 만료된 공고입니다. 지원 전 채용 여부를 다시 확인해주세요.
        </p>
      )}
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

          {isLab && (
            <div className="mb-4.5">
              <div className="mb-2.5 flex items-center gap-3">
                {lab?.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lab.photo_url} alt={org} className="h-16 w-16 flex-shrink-0 rounded-sm border border-line object-cover" />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-sm border border-line bg-teal-tint text-[20px] font-extrabold text-teal">
                    {org?.[0]}
                  </div>
                )}
                <p className="text-[13px] font-bold text-gold">치과기공소 채용정보</p>
              </div>
              <InfoTable
                rows={[
                  { label: "업체 이름 및 분류", value: `${org} ( 분류 : 기공소 )` },
                  { label: "주소", value: address },
                  { label: "전화번호", value: phone },
                  { label: "홈페이지", value: job.homepage_url },
                  { label: "구인 담당자", value: job.hr_contact_name },
                  { label: "구인 상담 전화번호", value: job.hr_contact_phone },
                  { label: "E-mail", value: job.contact_email },
                ]}
              />
              <InfoTable
                rows={[
                  { label: "구인 제목", value: job.title },
                  { label: "구인 직종", value: job.job_type },
                  { label: "근무 구분", value: "기공소" },
                  { label: "전문 분야", value: job.lab_specialty },
                  { label: "경력", value: job.career_requirement },
                  { label: "근무 지역", value: job.region },
                  { label: "근무 형태", value: job.employment_type },
                  { label: "모집 인원", value: job.headcount },
                  { label: "급여 또는 연봉", value: formatPay(job.pay_min) },
                  { label: "구비 서류", value: job.required_documents },
                  { label: "모집 방법", value: job.application_method },
                  { label: "마감 일자", value: job.recruit_end_date || "충원시까지" },
                  { label: "복리 후생", value: job.welfare?.length > 0 ? job.welfare.join(", ") : null },
                ]}
              />
            </div>
          )}

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
            <KakaoShareButton title={job.title} description={`${org} · ${job.region} · ${formatPay(job.pay_min)}`} url={pageUrl} />
          </div>

          {!isLab && (
          <dl className="mb-4.5 grid grid-cols-[90px_1fr] gap-y-2 gap-x-3 text-[13.5px]">
            <dt className="font-semibold text-ink-soft">모집분야</dt>
            <dd>
              {job.job_type}
              {job.lab_specialty ? ` · ${job.lab_specialty}` : ""}
            </dd>
            {job.duties && (
              <>
                <dt className="font-semibold text-ink-soft">담당업무</dt>
                <dd>{job.duties}</dd>
              </>
            )}
            <dt className="font-semibold text-ink-soft">급여</dt>
            <dd className="font-mono">
              {formatPay(job.pay_min)} {job.pay_min != null ? job.pay_note : ""}
            </dd>
            {(job.employment_type || job.headcount) && (
              <>
                <dt className="font-semibold text-ink-soft">근무형태</dt>
                <dd>
                  {job.employment_type}
                  {job.employment_type && job.headcount ? " · " : ""}
                  {job.headcount ? `모집 ${job.headcount}` : ""}
                </dd>
              </>
            )}
            {(job.education_level || job.career_requirement) && (
              <>
                <dt className="font-semibold text-ink-soft">자격요건</dt>
                <dd>
                  {job.education_level}
                  {job.education_level && job.career_requirement ? " · " : ""}
                  {job.career_requirement}
                </dd>
              </>
            )}
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
            {(job.recruit_start_date || job.recruit_end_date) && (
              <>
                <dt className="font-semibold text-ink-soft">모집기간</dt>
                <dd>
                  {job.recruit_start_date || "상시"} ~ {job.recruit_end_date || "채용시 마감"}
                </dd>
              </>
            )}
            {(job.application_method || job.application_email) && (
              <>
                <dt className="font-semibold text-ink-soft">접수방법</dt>
                <dd>
                  {job.application_method}
                  {job.application_method && job.application_email ? " · " : ""}
                  {job.application_email}
                </dd>
              </>
            )}
            {job.required_documents && (
              <>
                <dt className="font-semibold text-ink-soft">제출서류</dt>
                <dd>{job.required_documents}</dd>
              </>
            )}
            {(job.work_address || address) && (
              <>
                <dt className="font-semibold text-ink-soft">위치</dt>
                <dd>
                  {job.work_address || address}
                  {job.nearby_station ? ` · ${job.nearby_station}` : ""}
                  <a
                    href={`https://map.kakao.com/link/search/${encodeURIComponent(job.work_address || address || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 whitespace-nowrap text-[12px] font-bold text-teal hover:underline"
                  >
                    지도에서 보기 →
                  </a>
                </dd>
              </>
            )}
          </dl>
          )}

          {job.description && (
            <div className="mb-4.5 whitespace-pre-line rounded-sm border border-line bg-paper p-3.5 text-[13.5px] leading-relaxed">
              {isLab && <p className="mb-1.5 text-[12.5px] font-bold text-ink-soft">구인 상세내용</p>}
              {job.description}
            </div>
          )}

          <ApplyForm jobPostId={job.id} isLoggedIn={!!user} />
        </div>
      </div>
    </div>
  );
}
