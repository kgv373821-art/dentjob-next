"use client";

import { useState, useTransition } from "react";
import { applyToJob } from "@/lib/actions/applications";

export default function QuickApplyButton({ jobPostId }: { jobPostId: string }) {
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [pending, startTransition] = useTransition();

  if (status === "done") {
    return <span className="rounded-sm bg-teal-tint px-2.5 py-1.5 text-[11.5px] font-bold text-teal">지원 완료</span>;
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          const fd = new FormData();
          const res = await applyToJob(jobPostId, { error: null }, fd);
          setStatus(res.error ? "error" : "done");
        });
      }}
      className="rounded-sm bg-coral px-2.5 py-1.5 text-[11.5px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
    >
      {pending ? "지원 중..." : status === "error" ? "다시 시도" : "원터치 지원"}
    </button>
  );
}
