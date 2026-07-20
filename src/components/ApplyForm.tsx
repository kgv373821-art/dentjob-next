"use client";

import { useActionState } from "react";
import { applyToJob } from "@/lib/actions/applications";

export default function ApplyForm({ jobPostId, isLoggedIn }: { jobPostId: string; isLoggedIn: boolean }) {
  const [state, formAction, pending] = useActionState(applyToJob.bind(null, jobPostId), { error: null });

  if (!isLoggedIn) {
    return (
      <a href="/login" className="block w-full rounded-sm bg-coral py-3.5 text-center text-[15px] font-bold text-white hover:bg-coral-deep">
        로그인 후 지원하기
      </a>
    );
  }

  if (state.success) {
    return <p className="rounded-sm border border-teal-tint bg-teal-tint p-3.5 text-center text-[14px] font-bold text-teal">지원이 접수되었습니다.</p>;
  }

  return (
    <form action={formAction} className="space-y-2.5">
      <textarea
        name="message"
        placeholder="간단한 지원 메시지를 남겨보세요 (선택)"
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        rows={3}
      />
      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-coral py-3.5 text-[15px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {pending ? "지원 접수 중..." : "지원하기"}
      </button>
    </form>
  );
}
