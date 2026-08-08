"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

export type ContentRow = { id: string; title: string; meta: string; href: string };

export default function AdminContentTable({
  title,
  items,
  onDelete,
  emptyLabel,
}: {
  title: string;
  items: ContentRow[];
  onDelete: (ids: string[]) => Promise<void>;
  emptyLabel: string;
}) {
  const [rows, setRows] = useState(items);
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelected((prev) => (prev.length === rows.length ? [] : rows.map((r) => r.id)));
  }

  function remove(ids: string[]) {
    if (ids.length === 0) return;
    if (!confirm(`${ids.length}건을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    startTransition(() => onDelete(ids));
  }

  return (
    <div className="rounded-sm border border-line bg-white p-4">
      <div className="mb-2.5 flex items-center justify-between border-b border-line pb-2">
        <h3 className="text-[14px] font-extrabold">
          {title} <span className="font-normal text-ink-soft">({rows.length})</span>
        </h3>
        <button
          type="button"
          disabled={pending || selected.length === 0}
          onClick={() => remove(selected)}
          className="rounded-sm border border-coral px-3 py-1.5 text-[12px] font-bold text-coral hover:bg-coral/10 disabled:opacity-40"
        >
          선택 삭제 ({selected.length})
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-[12.5px] text-ink-soft">{emptyLabel}</p>
      ) : (
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-line text-[11px] text-ink-soft">
              <th className="w-8 p-2">
                <input type="checkbox" checked={selected.length === rows.length} onChange={toggleAll} />
              </th>
              <th className="p-2 text-left">제목</th>
              <th className="p-2 text-left">정보</th>
              <th className="w-16 p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line">
                <td className="p-2">
                  <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                </td>
                <td className="p-2">
                  <Link href={r.href} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-teal hover:underline">
                    {r.title}
                  </Link>
                </td>
                <td className="p-2 text-ink-soft">{r.meta}</td>
                <td className="p-2 text-right">
                  <button type="button" onClick={() => remove([r.id])} className="text-[11.5px] font-bold text-coral hover:underline">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
