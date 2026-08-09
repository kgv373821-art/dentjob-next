"use client";

import { useActionState, useRef, useState } from "react";
import { updateResume } from "@/lib/actions/seeker";
import { JOB_TYPES, LAB_SPECIALTIES, LAB_RELATED_JOB_TYPES, REGIONS } from "@/lib/constants";
import type { Seeker } from "@/lib/types";

export default function ResumeForm({ seeker }: { seeker: Seeker }) {
  const [state, formAction, pending] = useActionState(updateResume, { error: null, success: false });
  const introRef = useRef<HTMLTextAreaElement>(null);
  const [desiredJob, setDesiredJob] = useState(seeker.desired_job || "");
  const isLabJob = LAB_RELATED_JOB_TYPES.includes(desiredJob);
  const [aiLoading, setAiLoading] = useState<"resume" | "cover" | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  async function runAi(kind: "resume" | "cover") {
    setAiLoading(kind);
    setAiError(null);
    try {
      const endpoint = kind === "resume" ? "/api/ai/resume" : "/api/ai/cover-letter";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desired_job: seeker.desired_job,
          lab_specialty: seeker.lab_specialty,
          career_years: seeker.career_years,
          certifications: seeker.certifications,
          highlights: introRef.current?.value,
          motivation: introRef.current?.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "생성에 실패했습니다.");
      if (introRef.current) introRef.current.value = data.text;
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiLoading(null);
    }
  }

  return (
    <form action={formAction} className="max-w-lg space-y-3">
      <select
        name="desired_job"
        value={desiredJob}
        onChange={(e) => setDesiredJob(e.target.value)}
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      >
        <option value="">희망 직종</option>
        {JOB_TYPES.map((j) => (
          <option key={j} value={j}>
            {j}
          </option>
        ))}
      </select>
      {isLabJob ? (
        <select name="lab_specialty" defaultValue={seeker.lab_specialty || ""} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
          <option value="">기공 전문분야</option>
          {LAB_SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ) : (
        <input type="hidden" name="lab_specialty" value="" />
      )}
      <select name="desired_region" defaultValue={seeker.desired_region || ""} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
        <option value="">희망 지역</option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input
        name="career_years"
        type="number"
        min={0}
        defaultValue={seeker.career_years}
        placeholder="경력 (년)"
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      />
      <input
        name="desired_pay_min"
        type="number"
        defaultValue={seeker.desired_pay_min ?? undefined}
        placeholder="희망 급여 (만원)"
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      />
      <input name="certifications" defaultValue={seeker.certifications ?? ""} placeholder="자격증" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-[12px] font-bold text-ink-soft">자기소개 / 이력서 요약</label>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={aiLoading !== null}
              onClick={() => runAi("resume")}
              className="rounded-sm border border-teal px-2.5 py-1 text-[11px] font-bold text-teal hover:bg-teal-tint disabled:opacity-50"
            >
              {aiLoading === "resume" ? "생성 중..." : "AI 이력서 초안"}
            </button>
            <button
              type="button"
              disabled={aiLoading !== null}
              onClick={() => runAi("cover")}
              className="rounded-sm border border-coral px-2.5 py-1 text-[11px] font-bold text-coral hover:bg-coral/10 disabled:opacity-50"
            >
              {aiLoading === "cover" ? "생성 중..." : "AI 자기소개서 초안"}
            </button>
          </div>
        </div>
        <textarea
          ref={introRef}
          name="self_intro"
          defaultValue={seeker.self_intro ?? ""}
          placeholder="간단한 강점을 적어두면 AI가 초안을 다듬어드립니다."
          rows={6}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        />
        {aiError && <p className="mt-1 text-[11.5px] font-bold text-coral">{aiError}</p>}
      </div>

      <input name="portfolio_url" defaultValue={seeker.portfolio_url ?? ""} placeholder="포트폴리오 URL" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />

      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      {state.success && <p className="text-[12.5px] font-bold text-teal">저장되었습니다.</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-coral py-3 text-[14.5px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {pending ? "저장 중..." : "이력서 저장"}
      </button>
    </form>
  );
}
