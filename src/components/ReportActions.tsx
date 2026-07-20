"use client";

import { useTransition } from "react";
import { resolveReport } from "@/lib/actions/admin";

export default function ReportActions({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => resolveReport(reportId, "resolved"))}
        className="rounded-sm bg-teal px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
      >
        처리완료
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => resolveReport(reportId, "dismissed"))}
        className="rounded-sm border border-line px-3 py-1.5 text-[12px] font-bold text-ink-soft disabled:opacity-50"
      >
        반려
      </button>
    </div>
  );
}
