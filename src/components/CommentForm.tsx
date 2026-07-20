"use client";

import { useRef } from "react";
import { submitComment } from "@/lib/actions/community";

export default function CommentForm({ postId, board }: { postId: string; board: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        formRef.current?.reset();
        await submitComment(postId, board, formData);
      }}
      className="flex gap-2"
    >
      <input name="content" required placeholder="댓글을 입력하세요" className="flex-1 rounded-sm border border-line px-3 py-2.5 text-[13px]" />
      <button type="submit" className="rounded-sm bg-teal px-4 py-2.5 text-[13px] font-bold text-white hover:bg-teal-deep">
        등록
      </button>
    </form>
  );
}
