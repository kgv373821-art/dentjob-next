"use client";

import { useEffect } from "react";

const STORAGE_KEY = "dentjob_recently_viewed";
const MAX_ITEMS = 5;

export type RecentlyViewedJob = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  pay_min: number;
};

export default function RecentlyViewedTracker({ job }: { job: RecentlyViewedJob }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: RecentlyViewedJob[] = raw ? JSON.parse(raw) : [];
      const next = [job, ...list.filter((j) => j.id !== job.id)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage 접근 불가 환경(시크릿 모드 등)에서는 조용히 무시
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id]);

  return null;
}

export { STORAGE_KEY };
