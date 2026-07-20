"use client";

import { useActionState } from "react";
import { createBoardPost } from "@/lib/actions/community";
import { BOARD_LABELS } from "@/lib/types";
import type { BoardType } from "@/lib/types";

export default function BoardPostForm({ board }: { board: BoardType }) {
  const [state, formAction, pending] = useActionState(createBoardPost.bind(null, board), { error: null });

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">{BOARD_LABELS[board]} 글쓰기</h1>
      <form action={formAction} className="space-y-3">
        <input name="title" required placeholder="제목" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        {board === "used_equipment" && (
          <input name="price" type="number" placeholder="가격 (원)" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        )}
        <textarea name="content" required placeholder="내용" rows={8} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-sm bg-coral py-3 text-[14.5px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
        >
          {pending ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
