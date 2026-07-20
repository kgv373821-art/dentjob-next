"use client";

import { useTransition } from "react";
import { updateApplicationStatus } from "@/lib/actions/applications";
import type { ApplicationStatus } from "@/lib/types";

const STEPS: { status: ApplicationStatus; label: string }[] = [
  { status: "reviewing", label: "서류검토" },
  { status: "interview", label: "면접확정" },
  { status: "passed", label: "합격" },
  { status: "failed", label: "불합격" },
];

export default function ApplicantActions({ applicationId }: { applicationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1.5">
      {STEPS.map((s) => (
        <button
          key={s.status}
          disabled={pending}
          onClick={() => startTransition(() => updateApplicationStatus(applicationId, s.status))}
          className="rounded-sm border border-line px-2.5 py-1 text-[11.5px] font-bold text-ink-soft hover:border-teal hover:text-teal disabled:opacity-50"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
