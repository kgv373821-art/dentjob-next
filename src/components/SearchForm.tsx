"use client";

import { useRouter } from "next/navigation";
import { REGIONS, JOB_TYPES } from "@/lib/constants";

export default function SearchForm() {
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const params = new URLSearchParams();
    const region = String(formData.get("region") || "");
    const job_type = String(formData.get("job_type") || "");
    if (region && region !== "전체") params.set("region", region);
    if (job_type && job_type !== "전체") params.set("job_type", job_type);
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <form action={handleSubmit} className="relative rounded border border-line bg-white p-[22px] shadow-lg shadow-teal/10">
      <span className="absolute -top-[11px] right-[18px] rotate-1 rounded-sm bg-gold px-[9px] py-[3px] font-mono text-[11px] font-bold tracking-widest text-white">
        접수
      </span>

      <label className="mb-1 block text-[11.5px] font-bold tracking-wide text-ink-soft">지역 선택</label>
      <select name="region" className="mb-3 w-full rounded-sm border border-line bg-paper-dim px-3 py-2.5 text-[13.5px]">
        <option value="전체">전체 지역</option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-[11.5px] font-bold tracking-wide text-ink-soft">직종 선택</label>
      <select name="job_type" className="mb-4 w-full rounded-sm border border-line bg-paper-dim px-3 py-2.5 text-[13.5px]">
        <option value="전체">전체 직종</option>
        {JOB_TYPES.map((j) => (
          <option key={j} value={j}>
            {j}
          </option>
        ))}
      </select>

      <button type="submit" className="w-full rounded-sm bg-coral py-3 text-[14.5px] font-bold text-white hover:bg-coral-deep">
        공고 검색
      </button>
    </form>
  );
}
