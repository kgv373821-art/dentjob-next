"use client";

import { useMemo, useState, useTransition } from "react";
import { linkJobPostToAccount } from "@/lib/actions/admin";

type Account = { id: string; role: "clinic" | "lab"; name: string; region: string };

export default function LinkJobAccount({ jobId, accounts }: { jobId: string; accounts: Account[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [linkedName, setLinkedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return accounts.slice(0, 20);
    return accounts.filter((a) => a.name.includes(q) || a.region.includes(q)).slice(0, 20);
  }, [accounts, query]);

  if (linkedName) {
    return <span className="rounded-sm bg-teal-tint px-1.5 py-0.5 text-[11px] font-bold text-teal">{linkedName} 계정에 연결됨</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-coral px-2.5 py-1 text-[11px] font-bold text-coral hover:bg-coral/10"
      >
        미연결 · 계정 연결
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="치과/기공소 이름 검색"
        disabled={pending}
        className="w-48 rounded-sm border border-line px-2 py-1 text-[12px]"
      />
      <div className="absolute z-10 mt-1 max-h-56 w-56 overflow-y-auto rounded-sm border border-line bg-white shadow-md">
        {filtered.length === 0 && <p className="p-2 text-[11.5px] text-ink-soft">검색 결과가 없습니다.</p>}
        {filtered.map((a) => (
          <button
            key={`${a.role}-${a.id}`}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setError(null);
              startTransition(async () => {
                try {
                  await linkJobPostToAccount(jobId, a.role, a.id);
                  setLinkedName(a.name);
                  setOpen(false);
                } catch (err) {
                  setError((err as Error).message || "연결에 실패했습니다.");
                }
              });
            }}
            className="flex w-full items-center gap-1.5 border-b border-line px-2 py-1.5 text-left text-[12px] last:border-b-0 hover:bg-teal-tint"
          >
            <span className="rounded-sm bg-paper-dim px-1 py-0.5 text-[10px] font-bold text-ink-soft">{a.role === "clinic" ? "치과" : "기공소"}</span>
            <span className="font-semibold">{a.name}</span>
            <span className="text-[10.5px] text-ink-soft">{a.region}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-[11px] font-bold text-coral">{error}</p>}
    </div>
  );
}
