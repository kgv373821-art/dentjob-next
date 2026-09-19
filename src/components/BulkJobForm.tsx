"use client";

import { useActionState } from "react";
import { adminBulkCreateJobPosts, type BulkJobState } from "@/lib/actions/admin";

const initial: BulkJobState = { error: null, problems: [], message: null };

export default function BulkJobForm() {
  const [state, formAction, pending] = useActionState(adminBulkCreateJobPosts, initial);

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="data"
        required
        rows={12}
        placeholder="엑셀에서 채운 칸들을 드래그해서 복사(Ctrl+C)한 뒤 여기에 붙여넣기(Ctrl+V) 하세요."
        className="w-full rounded-sm border border-line px-3 py-2.5 font-mono text-[12.5px]"
      />
      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      {state.problems.length > 0 && (
        <ul className="list-disc space-y-1 rounded-sm border border-coral/30 bg-coral/5 py-3 pl-8 pr-3 text-[12.5px] text-coral">
          {state.problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {state.message && <p className="rounded-sm bg-teal/10 px-3 py-2.5 text-[12.5px] font-bold text-teal">{state.message}</p>}
      <div className="flex gap-2">
        <button
          name="mode"
          value="check"
          disabled={pending}
          className="rounded-sm border border-teal px-4 py-2.5 text-[13.5px] font-bold text-teal disabled:opacity-60"
        >
          {pending ? "처리 중..." : "먼저 검사만 하기"}
        </button>
        <button
          name="mode"
          value="create"
          disabled={pending}
          className="rounded-sm bg-coral px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
        >
          등록하기
        </button>
      </div>
    </form>
  );
}
