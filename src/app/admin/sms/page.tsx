"use client";

import { useActionState } from "react";
import { broadcastSms } from "@/lib/actions/admin";

export default function AdminSmsPage() {
  const [state, formAction, pending] = useActionState(broadcastSms, { error: null });

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">문자 발송</h1>
      <form action={formAction} className="space-y-3">
        <select name="target_group" required defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
          <option value="" disabled>
            대상 선택
          </option>
          <option value="all_seekers">전체 구직자</option>
          <option value="all_clinics">전체 치과</option>
          <option value="all_labs">전체 기공소</option>
        </select>
        <textarea name="content" required placeholder="문자 내용" rows={4} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
        <button disabled={pending} className="rounded-sm bg-coral px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60">
          {pending ? "발송 중..." : "발송"}
        </button>
      </form>
    </div>
  );
}
