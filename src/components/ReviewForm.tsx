"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/actions/reviews";

export default function ReviewForm({
  action,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [rating, setRating] = useState(5);

  return (
    <form action={formAction} className="mb-6 rounded-sm border border-line bg-white p-4">
      <div className="mb-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-[20px] ${n <= rating ? "text-gold" : "text-line"}`}
          >
            ★
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>
      <textarea
        name="content"
        required
        placeholder="근무 경험이나 이용 후기를 남겨주세요."
        rows={3}
        className="mb-2 w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
      />
      {state.error && <p className="mb-2 text-[12.5px] font-bold text-coral">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-teal px-4 py-2 text-[13px] font-bold text-white hover:bg-teal-deep disabled:opacity-60"
      >
        {pending ? "등록 중..." : "리뷰 등록"}
      </button>
    </form>
  );
}
