"use client";

import { useActionState, useRef, useState } from "react";
import { createJobPost, updateJobPost } from "@/lib/actions/jobs";
import { createClient } from "@/lib/supabase/client";
import { REGIONS, JOB_TYPES, LAB_SPECIALTIES, LAB_JOB_CATEGORIES, EMPLOYMENT_TYPES, EDUCATION_LEVELS } from "@/lib/constants";
import type { JobPost } from "@/lib/types";

const MAX_PHOTOS = 5;
const MAX_PHOTO_MB = 5;

export default function JobForm({
  role,
  orgName,
  job,
}: {
  role: "clinic" | "lab";
  orgName?: string;
  /** 수정 모드일 때만 전달 — 기존 공고 데이터로 폼을 채우고 수정 액션으로 제출합니다. */
  job?: JobPost;
}) {
  const isEdit = !!job;
  const action = isEdit ? updateJobPost.bind(null, job!.id) : createJobPost;
  const [state, formAction, pending] = useActionState(action, { error: null });
  const jobTypeOptions = role === "lab" ? ["치과기공사", "CAD/CAM", "기공소 직원"] : JOB_TYPES;

  const [payNegotiable, setPayNegotiable] = useState(job ? job.pay_min == null : false);
  const [photoUrls, setPhotoUrls] = useState<string[]>(job?.image_urls || []);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    if (photoUrls.length + files.length > MAX_PHOTOS) {
      setPhotoError(`사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있습니다.`);
      return;
    }
    const tooLarge = files.find((f) => f.size > MAX_PHOTO_MB * 1024 * 1024);
    if (tooLarge) {
      setPhotoError(`${tooLarge.name} 파일이 ${MAX_PHOTO_MB}MB를 초과합니다.`);
      return;
    }

    setPhotoError(null);
    setPhotoUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const uploaded: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("job-photos").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("job-photos").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setPhotoUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setPhotoError((err as Error).message || "사진 업로드에 실패했습니다.");
    } finally {
      setPhotoUploading(false);
    }
  }

  function removePhoto(url: string) {
    setPhotoUrls((prev) => prev.filter((u) => u !== url));
  }

  const jobTypeRef = useRef<HTMLSelectElement>(null);
  const specialtyRef = useRef<HTMLSelectElement>(null);
  const regionRef = useRef<HTMLSelectElement>(null);
  const payRef = useRef<HTMLInputElement>(null);
  const hoursRef = useRef<HTMLInputElement>(null);
  const welfareRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function runAi() {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/job-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: orgName,
          job_type: jobTypeRef.current?.value,
          lab_specialty: specialtyRef.current?.value,
          region: regionRef.current?.value,
          pay_min: payRef.current?.value,
          work_hours: hoursRef.current?.value,
          welfare: welfareRef.current?.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "생성에 실패했습니다.");
      if (descRef.current) descRef.current.value = data.text;
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <form action={formAction} className="max-w-lg space-y-3">
      <div>
        <label className="mb-1 block text-[12px] font-bold text-ink-soft">업체명 (이 공고에 표시됩니다)</label>
        <input
          name="org_name"
          required
          defaultValue={job?.org_name || orgName || ""}
          placeholder={role === "lab" ? "업체명 (예: OO치과기공소)" : "업체명 (예: OO치과의원)"}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        />
      </div>

      <select
        ref={jobTypeRef}
        name="job_type"
        required
        defaultValue={job?.job_type || ""}
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      >
        <option value="" disabled>
          모집분야 선택
        </option>
        {jobTypeOptions.map((j) => (
          <option key={j} value={j}>
            {j}
          </option>
        ))}
      </select>

      {role === "lab" && (
        <>
          <select
            ref={specialtyRef}
            name="lab_specialty"
            defaultValue={job?.lab_specialty || ""}
            className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
          >
            <option value="">전문분야 선택 (CAD/CAM · 디자인 · 지르코니아 · 포세린 · 덴처 · 교정 · 임플란트 · 밀링센터 · 외주 의뢰)</option>
            {LAB_SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="lab_category"
            defaultValue={job?.lab_category || ""}
            className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
          >
            <option value="">모집 구분 선택</option>
            {LAB_JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="rounded-sm border border-line bg-paper-dim p-3 space-y-2.5">
            <p className="text-[12px] font-bold text-ink-soft">구인 담당자 정보 (선택, 공고 상세페이지 상단에 표시됩니다)</p>
            <input
              name="homepage_url"
              defaultValue={job?.homepage_url || ""}
              placeholder="기공소 홈페이지 URL"
              className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                name="hr_contact_name"
                defaultValue={job?.hr_contact_name || ""}
                placeholder="구인 담당자 이름"
                className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
              />
              <input
                name="hr_contact_phone"
                defaultValue={job?.hr_contact_phone || ""}
                placeholder="구인 상담 전화번호"
                className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
              />
            </div>
            <input
              type="email"
              name="contact_email"
              defaultValue={job?.contact_email || ""}
              placeholder="담당자 E-mail"
              className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
            />
          </div>
        </>
      )}

      <input
        name="title"
        required
        defaultValue={job?.title}
        placeholder="공고 제목"
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      />

      <select
        ref={regionRef}
        name="region"
        required
        defaultValue={job?.region || ""}
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      >
        <option value="" disabled>
          지역 선택
        </option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        name="employment_type"
        required
        defaultValue={job?.employment_type || ""}
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      >
        <option value="" disabled>
          근무형태 선택 (정규직 · 파트타임 · 주중알바 · 주말알바 등)
        </option>
        {EMPLOYMENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div>
        {!payNegotiable && (
          <input
            ref={payRef}
            name="pay_min"
            type="number"
            required
            defaultValue={job?.pay_min ?? undefined}
            placeholder="급여 (만원, 예: 280)"
            className="mb-1.5 w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
          />
        )}
        <label className="flex items-center gap-2 text-[12.5px] text-ink-soft">
          <input type="checkbox" checked={payNegotiable} onChange={(e) => setPayNegotiable(e.target.checked)} />
          급여 협의 (금액 비공개, &quot;급여 협의&quot;로 표시)
        </label>
      </div>
      <input
        ref={hoursRef}
        name="work_hours"
        defaultValue={job?.work_hours || ""}
        placeholder="근무시간 (예: 09:30 ~ 18:30)"
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      />
      <input
        ref={welfareRef}
        name="welfare"
        defaultValue={job?.welfare?.join(", ") || ""}
        placeholder="복지 (쉼표로 구분, 예: 4대보험, 명절상여)"
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      />

      <div className="rounded-sm border border-line bg-paper-dim p-3 space-y-2.5">
        <p className="text-[12px] font-bold text-ink-soft">상세 채용정보 (선택)</p>

        <input
          name="duties"
          defaultValue={job?.duties || ""}
          placeholder="담당업무 (예: 진료보조, 상담, 보험청구)"
          className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
        />

        <input
          name="headcount"
          defaultValue={job?.headcount || ""}
          placeholder="모집인원 (예: 1명)"
          className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
        />

        <div className="grid grid-cols-2 gap-2.5">
          <select
            name="education_level"
            defaultValue={job?.education_level || ""}
            className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
          >
            <option value="">학력 선택</option>
            {EDUCATION_LEVELS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <input
            name="career_requirement"
            defaultValue={job?.career_requirement || ""}
            placeholder="경력 (예: 경력 3년 이상)"
            className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11.5px] text-ink-soft">모집기간</label>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="date"
              name="recruit_start_date"
              defaultValue={job?.recruit_start_date || ""}
              className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
            />
            <input
              type="date"
              name="recruit_end_date"
              defaultValue={job?.recruit_end_date || ""}
              className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
            />
          </div>
        </div>

        <input
          name="application_method"
          defaultValue={job?.application_method || ""}
          placeholder="접수방법 (예: 온라인 접수, 이메일 접수)"
          className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
        />
        <input
          type="email"
          name="application_email"
          defaultValue={job?.application_email || ""}
          placeholder="접수 이메일 (선택)"
          className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
        />
        <input
          name="required_documents"
          defaultValue={job?.required_documents || ""}
          placeholder="제출서류 (예: 이력서, 자기소개서)"
          className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
        />
        <input
          name="work_address"
          defaultValue={job?.work_address || ""}
          placeholder="근무지 상세주소"
          className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
        />
        <input
          name="nearby_station"
          defaultValue={job?.nearby_station || ""}
          placeholder="인근 지하철역 (예: 2호선 강남역)"
          className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px]"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-[12px] font-bold text-ink-soft">상세 설명</label>
          <button
            type="button"
            disabled={aiLoading}
            onClick={runAi}
            className="rounded-sm border border-teal px-2.5 py-1 text-[11px] font-bold text-teal hover:bg-teal-tint disabled:opacity-50"
          >
            {aiLoading ? "생성 중..." : "AI로 공고 초안 작성"}
          </button>
        </div>
        <textarea
          ref={descRef}
          name="description"
          defaultValue={job?.description || ""}
          placeholder="위 항목을 채운 뒤 AI 버튼을 누르면 초안을 자동으로 작성합니다."
          rows={5}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        />
        {aiError && <p className="mt-1 text-[11.5px] font-bold text-coral">{aiError}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-bold text-ink-soft">
          공고 사진 <span className="font-normal">(선택, 최대 {MAX_PHOTOS}장)</span>
        </label>
        {photoUrls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {photoUrls.map((url) => (
              <div key={url} className="relative h-16 w-16 overflow-hidden rounded-sm border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="공고 사진" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center bg-ink/70 text-[10px] text-white"
                  aria-label="사진 삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={photoUploading || photoUrls.length >= MAX_PHOTOS}
          onChange={handlePhotoSelect}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[12.5px] file:mr-3 file:rounded-sm file:border-0 file:bg-teal-tint file:px-2.5 file:py-1 file:text-[12px] file:font-bold file:text-teal disabled:opacity-50"
        />
        {photoUploading && <p className="mt-1 text-[11.5px] text-ink-soft">업로드 중...</p>}
        {photoError && <p className="mt-1 text-[11.5px] font-bold text-coral">{photoError}</p>}
        <input type="hidden" name="image_urls" value={JSON.stringify(photoUrls)} />
      </div>

      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" name="is_urgent" defaultChecked={job?.is_urgent} /> 긴급 채용으로 등록
      </label>

      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-coral py-3 text-[14.5px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {pending ? "저장 중..." : isEdit ? "수정 내용 저장" : "공고 등록하기"}
      </button>
      {!isEdit && <p className="text-[11.5px] text-ink-soft">등록한 공고는 관리자 승인 후 목록에 노출됩니다.</p>}
    </form>
  );
}
