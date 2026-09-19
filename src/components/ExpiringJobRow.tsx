"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { adminExtendJobPost } from "@/lib/actions/admin";

export default function ExpiringJobRow({
  jobId,
  title,
  org,
  deadlineLabel,
  dDay,
  phone,
  email,
  message,
}: {
  jobId: string;
  title: string;
  org: string;
  deadlineLabel: string;
  dDay: number;
  phone: string | null;
  email: string | null;
  message: string;
}) {
  const [copied, setCopied] = useState(false);
  const [extended, setExtended] = useState(false);
  const [pending, startTransition] = useTransition();

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("아래 문구를 복사하세요", message);
    }
  }

  return (
    <div className="rounded-sm border border-line bg-white p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/jobs/${jobId}`} target="_blank" className="font-semibold hover:text-teal hover:underline">
            {title}
          </Link>
          <div className="text-[12px] text-ink-soft">
            {org} · 마감 {deadlineLabel}{" "}
            <span className={`font-bold ${dDay <= 1 ? "text-coral" : "text-teal"}`}>{dDay <= 0 ? "(24시간 이내 마감)" : `(D-${dDay})`}</span>
          </div>
          <div className="mt-1 text-[12px] text-ink-soft">
            연락처: {phone || "없음"}
            {email ? ` · ${email}` : ""}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={copy}
            className="rounded-full border border-line px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:border-teal hover:text-teal"
          >
            {copied ? "복사됨 ✓" : "안내 문구 복사"}
          </button>
          <button
            type="button"
            disabled={pending || extended}
            onClick={() => startTransition(async () => { await adminExtendJobPost(jobId); setExtended(true); })}
            className="rounded-full border border-teal px-2.5 py-1 text-[11px] font-bold text-teal disabled:opacity-60"
          >
            {extended ? "연장됨 ✓" : pending ? "처리 중..." : "30일 연장"}
          </button>
        </div>
      </div>
    </div>
  );
}
