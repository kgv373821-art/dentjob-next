"use client";

import { useTransition } from "react";
import { approveJobPost, rejectJobPost } from "@/lib/actions/admin";

export default function ApprovalActions({ jobId }: { jobId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => approveJobPost(jobId))}
        className="rounded-sm bg-teal px-3 py-1.5 text-[12px] font-bold text-white hover:bg-teal-deep disabled:opacity-50"
      >
        승인
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => rejectJobPost(jobId))}
        className="rounded-sm border border-coral px-3 py-1.5 text-[12px] font-bold text-coral hover:bg-coral/10 disabled:opacity-50"
      >
        반려
      </button>
    </div>
  );
}
