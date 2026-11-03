"use client";

import { useActionState } from "react";
import { sendJobOffer } from "@/lib/actions/offers";

export default function OfferForm({
  seekerId,
  orgName,
  defaultPhone,
  jobs,
}: {
  seekerId: string;
  orgName: string;
  defaultPhone: string;
  jobs: { id: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(sendJobOffer.bind(null, seekerId), { error: null });

  if (state.success) {
    return (
      <p className="rounded-sm border border-teal-tint bg-teal-tint p-3.5 text-center text-[13.5px] font-bold text-teal">
        면접 제안을 보냈습니다. 구직자가 수락하면 마이페이지 &quot;보낸 면접 제안&quot;에서 연락처를 확인할 수 있습니다.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2.5">
      {jobs.length > 0 && (
        <label className="block text-[12.5px] font-semibold text-ink-soft">
          어떤 공고로 제안할까요? (선택)
          <select name="job_post_id" defaultValue="" className="mt-1 w-full rounded-sm border border-line bg-white px-2.5 py-2 text-[13.5px] text-ink">
            <option value="">공고 없이 제안</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-[12.5px] font-semibold text-ink-soft">
        제안 내용
        <textarea
          name="message"
          required
          rows={4}
          defaultValue={`안녕하세요, ${orgName}입니다.\n이력서를 보고 연락드립니다. 면접 한번 보실 수 있을까요?`}
          className="mt-1 w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px] text-ink"
        />
      </label>
      <label className="block text-[12.5px] font-semibold text-ink-soft">
        구직자에게 알려줄 연락처
        <input
          name="contact_phone"
          required
          defaultValue={defaultPhone}
          placeholder="010-0000-0000"
          className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-[13.5px] text-ink"
        />
      </label>
      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-coral py-3 text-[14.5px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {pending ? "보내는 중..." : "면접 제안 보내기"}
      </button>
    </form>
  );
}
