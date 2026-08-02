import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NoticesSidebar() {
  const supabase = await createClient();
  const { data: notices } = await supabase
    .from("notices")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!notices || notices.length === 0) return null;

  return (
    <div className="rounded-[3px] border border-l-4 border-line border-l-teal bg-white p-4">
      <div className="mb-2.5 flex items-center justify-between border-b border-line pb-2">
        <h3 className="text-[13.5px] font-extrabold text-teal">📢 공지사항</h3>
        <Link href="/notices" className="text-[11px] font-bold text-teal hover:underline">
          더보기 →
        </Link>
      </div>
      <ul className="space-y-2">
        {notices.map((n) => (
          <li key={n.id} className="truncate text-[12.5px]">
            <Link href="/notices" className="hover:text-teal">
              {n.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
