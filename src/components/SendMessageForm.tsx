"use client";

import { useActionState, useState } from "react";
import { sendMemberMessage } from "@/lib/actions/messages";

/** 관리자 회원 관리 화면의 "메시지 보내기" (펼쳐서 쓰기) */
export default function SendMessageForm({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(sendMemberMessage.bind(null, userId), { error: null });

  if (state.success) {
    return <p className="mt-2 text-[12.5px] font-bold text-teal">{name} 님께 메시지를 보냈습니다. 마이페이지에 알림으로 표시됩니다.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 rounded-sm border border-teal px-2.5 py-1 text-[12px] font-bold text-teal hover:bg-teal-tint"
      >
        메시지 보내기
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 space-y-1.5">
      <textarea
        name="body"
        required
        rows={5}
        placeholder={`${name} 님께 보낼 운영자 메시지`}
        className="w-full rounded-sm border border-line px-3 py-2 text-[13px]"
      />
      {state.error && <p className="text-[12px] font-bold text-coral">{state.error}</p>}
      <div className="flex gap-1.5">
        <button disabled={pending} className="rounded-sm bg-teal px-3 py-1.5 text-[12.5px] font-bold text-white disabled:opacity-60">
          {pending ? "보내는 중..." : "보내기"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-sm border border-line px-3 py-1.5 text-[12.5px] font-bold text-ink-soft">
          닫기
        </button>
      </div>
    </form>
  );
}
