"use client";

import { useActionState } from "react";
import { createNotice } from "@/lib/actions/admin";

export default function NoticeForm() {
  const [state, formAction, pending] = useActionState(createNotice, { error: null });
  return (
    <form action={formAction} className="max-w-lg space-y-2.5">
      <input name="title" required placeholder="제목" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
      <textarea name="content" required placeholder="내용" rows={4} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      <button disabled={pending} className="rounded-sm bg-teal px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60">
        {pending ? "등록 중..." : "공지 등록"}
      </button>
    </form>
  );
}
