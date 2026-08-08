"use client";

import { useState } from "react";
import { formatPay } from "@/lib/constants";
import type { JobPost } from "@/lib/types";
import ApprovalActions from "@/components/ApprovalActions";

export default function PendingJobRow({ job, org }: { job: JobPost; org?: string }) {
  const [open, setOpen] = useState(false);

  const rows = (
    [
      ["담당업무", job.duties],
      ["근무형태", job.employment_type],
      ["모집인원", job.headcount],
      ["학력", job.education_level],
      ["경력", job.career_requirement],
      ["근무시간", job.work_hours],
      ["복지", job.welfare?.length > 0 ? job.welfare.join(", ") : null],
      ["모집기간", job.recruit_start_date || job.recruit_end_date ? `${job.recruit_start_date || "상시"} ~ ${job.recruit_end_date || "채용시 마감"}` : null],
      ["접수방법", job.application_method],
      ["접수 이메일", job.application_email],
      ["제출서류", job.required_documents],
      ["근무지 주소", job.work_address],
      ["인근 지하철역", job.nearby_station],
      ["홈페이지", job.homepage_url],
      ["구인 담당자", job.hr_contact_name],
      ["구인 상담 전화", job.hr_contact_phone],
      ["담당자 이메일", job.contact_email],
    ] as Array<[string, string | null | undefined]>
  ).filter(([, v]) => !!v);

  return (
    <div className="rounded-sm border border-line bg-white p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-left">
          <div className="font-semibold hover:text-teal">{job.title}</div>
          <div className="text-[12px] text-ink-soft">
            {org} · {job.region} · {job.job_type}
            {job.lab_specialty ? ` · ${job.lab_specialty}` : ""} · {formatPay(job.pay_min)}
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm border border-line px-3 py-1.5 text-[12px] font-bold text-ink-soft hover:border-teal hover:text-teal"
          >
            {open ? "접기 ▲" : "상세보기 ▼"}
          </button>
          <ApprovalActions jobId={job.id} />
        </div>
      </div>

      {open && (
        <div className="mt-3 border-t border-dashed border-line pt-3">
          {job.image_urls && job.image_urls.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {job.image_urls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt={job.title} className="h-20 w-20 rounded-sm border border-line object-cover" />
              ))}
            </div>
          )}
          {rows.length > 0 && (
            <dl className="mb-3 grid grid-cols-[110px_1fr] gap-y-1.5 gap-x-3 text-[12.5px]">
              {rows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="font-semibold text-ink-soft">{label}</dt>
                  <dd className="whitespace-pre-line">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {job.description && (
            <div className="whitespace-pre-line rounded-sm border border-line bg-paper p-3 text-[12.5px] leading-relaxed">
              {job.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
