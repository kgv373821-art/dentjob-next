"use client";

import { useState, useTransition } from "react";
import { togglePromotion } from "@/lib/actions/admin";

export default function AdminPromotionToggle({
  jobId,
  field,
  label,
  initialValue,
}: {
  jobId: string;
  field: "is_pinned" | "is_main_exposed" | "is_urgent";
  label: string;
  initialValue: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !value;
        setValue(next);
        startTransition(() => togglePromotion(jobId, field, next));
      }}
      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-50 ${
        value ? "border-teal bg-teal text-white" : "border-line text-ink-soft hover:border-teal hover:text-teal"
      }`}
    >
      {label} {value ? "ON" : "OFF"}
    </button>
  );
}
