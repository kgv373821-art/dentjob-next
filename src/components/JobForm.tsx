"use client";

import { useActionState, useRef, useState } from "react";
import { createJobPost } from "@/lib/actions/jobs";
import { REGIONS, JOB_TYPES, LAB_SPECIALTIES, LAB_JOB_CATEGORIES } from "@/lib/constants";

export default function JobForm({ role, orgName }: { role: "clinic" | "lab"; orgName?: string }) {
  const [state, formAction, pending] = useActionState(createJobPost, { error: null });
  const jobTypeOptions = role === "lab" ? ["치과기공사", "CAD/CAM", "기공소 직원"] : JOB_TYPES;

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
      <select ref={jobTypeRef} name="job_type" required defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
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
          <select ref={specialtyRef} name="lab_specialty" defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
            <option value="">전문분야 선택 (CAD/CAM · 지르코니아 · 포세린 · 덴처 · 교정 · 임플란트 · 밀링센터 · 외주 의뢰)</option>
            {LAB_SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select name="lab_category" defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
            <option value="">모집 구분 선택</option>
            {LAB_JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </>
      )}

      <input name="title" required placeholder="공고 제목" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />

      <select ref={regionRef} name="region" required defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
        <option value="" disabled>
          지역 선택
        </option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <input ref={payRef} name="pay_min" type="number" required placeholder="급여 (만원, 예: 280)" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
      <input ref={hoursRef} name="work_hours" placeholder="근무시간 (예: 09:30 ~ 18:30)" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
      <input ref={welfareRef} name="welfare" placeholder="복지 (쉼표로 구분, 예: 4대보험, 명절상여)" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />

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
        <textarea ref={descRef} name="description" placeholder="위 항목을 채운 뒤 AI 버튼을 누르면 초안을 자동으로 작성합니다." rows={5} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        {aiError && <p className="mt-1 text-[11.5px] font-bold text-coral">{aiError}</p>}
      </div>

      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" name="is_urgent" /> 긴급 채용으로 등록
      </label>

      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-coral py-3 text-[14.5px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {pending ? "등록 중..." : "공고 등록하기"}
      </button>
      <p className="text-[11.5px] text-ink-soft">등록한 공고는 관리자 승인 후 목록에 노출됩니다.</p>
    </form>
  );
}
