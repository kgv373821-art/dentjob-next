"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { STORAGE_KEY, type RecentlyViewedJob } from "@/components/RecentlyViewedTracker";
import { formatPay } from "@/lib/constants";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

export default function RecentlyViewedJobs() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let jobs: RecentlyViewedJob[] = [];
  try {
    jobs = JSON.parse(raw);
  } catch {
    jobs = [];
  }

  if (jobs.length === 0) return null;

  return (
    <div className="rounded-[3px] border border-l-4 border-line border-l-coral bg-white p-4">
      <h3 className="mb-2.5 border-b border-line pb-2 text-[13.5px] font-extrabold text-coral">🕘 최근 본 공고</h3>
      <ul className="space-y-2">
        {jobs.map((j) => (
          <li key={j.id}>
            <Link href={`/jobs/${j.id}`} className="block text-[12.5px] hover:text-teal">
              <div className="truncate font-semibold">{j.title}</div>
              <div className="text-[11px] text-ink-soft">
                {j.region} · {j.job_type} · {formatPay(j.pay_min)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
