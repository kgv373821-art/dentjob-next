"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { deleteAd, toggleAdActive, reorderAds } from "@/lib/actions/ads";
import { AD_POSITION_LABELS, AD_TYPE_LABELS, type Ad, type AdPosition } from "@/lib/types";

const POSITIONS: AdPosition[] = ["main_top", "main_mid", "main_bottom", "sidebar"];

function isCurrentlyInRange(ad: Ad) {
  const today = new Date().toISOString().slice(0, 10);
  if (ad.start_date && today < ad.start_date) return false;
  if (ad.end_date && today > ad.end_date) return false;
  return true;
}

export default function AdsListClient({ ads: initialAds }: { ads: Ad[] }) {
  const [ads, setAds] = useState(initialAds);
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ads;
    return ads.filter((a) => a.title.toLowerCase().includes(q));
  }, [ads, query]);

  const grouped = useMemo(() => {
    const map = new Map<AdPosition, Ad[]>();
    for (const p of POSITIONS) map.set(p, []);
    for (const ad of filtered) map.get(ad.position)?.push(ad);
    for (const list of map.values()) list.sort((a, b) => b.priority - a.priority);
    return map;
  }, [filtered]);

  function handleToggle(ad: Ad) {
    setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, active: !a.active } : a)));
    startTransition(() => toggleAdActive(ad.id, !ad.active));
  }

  function handleDelete(ad: Ad) {
    if (!confirm(`"${ad.title}" 광고를 삭제할까요?`)) return;
    setAds((prev) => prev.filter((a) => a.id !== ad.id));
    startTransition(() => deleteAd(ad.id));
  }

  function handleDrop(position: AdPosition, targetId: string) {
    if (!dragId || dragId === targetId) return;
    const list = grouped.get(position) || [];
    const ids = list.map((a) => a.id);
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    ids.splice(toIdx, 0, ids.splice(fromIdx, 1)[0]);

    const n = ids.length;
    setAds((prev) =>
      prev.map((a) => {
        const idx = ids.indexOf(a.id);
        return idx === -1 ? a : { ...a, priority: n - idx };
      })
    );
    startTransition(() => reorderAds(ids));
    setDragId(null);
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="제목으로 검색"
        className="mb-5 w-full max-w-xs rounded-sm border border-line px-3 py-2 text-[13px]"
      />

      {POSITIONS.map((position) => {
        const list = grouped.get(position) || [];
        return (
          <div key={position} className="mb-7">
            <h2 className="mb-2 text-[14px] font-bold text-ink-soft">
              {AD_POSITION_LABELS[position]} <span className="font-normal">({list.length})</span>
            </h2>
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper-dim text-[11.5px] text-ink-soft">
                  <th className="w-6 p-2.5"></th>
                  <th className="p-2.5 text-left">제목</th>
                  <th className="p-2.5 text-left">종류</th>
                  <th className="p-2.5 text-left">우선순위</th>
                  <th className="p-2.5 text-left">상태</th>
                  <th className="p-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((ad) => (
                  <tr
                    key={ad.id}
                    draggable={!query}
                    onDragStart={() => setDragId(ad.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(position, ad.id)}
                    className={`border-b border-line ${!query ? "cursor-grab" : ""}`}
                  >
                    <td className="p-2.5 text-ink-soft">{!query && "⠿"}</td>
                    <td className="p-2.5 font-semibold">{ad.title}</td>
                    <td className="p-2.5">{AD_TYPE_LABELS[ad.type]}</td>
                    <td className="p-2.5 font-mono">{ad.priority}</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => handleToggle(ad)}
                        className={`relative h-5 w-9 rounded-full transition ${ad.active ? "bg-teal" : "bg-line"}`}
                        aria-label="노출 여부 전환"
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${ad.active ? "left-4.5" : "left-0.5"}`}
                        />
                      </button>
                      {ad.active && !isCurrentlyInRange(ad) && (
                        <span className="ml-2 text-[10.5px] font-bold text-coral">기간 외</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      <Link href={`/admin/ads/edit/${ad.id}`} className="mr-2 text-[12px] font-bold text-teal hover:underline">
                        수정
                      </Link>
                      <button onClick={() => handleDelete(ad)} className="text-[12px] font-bold text-coral">
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-ink-soft">
                      등록된 광고가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
