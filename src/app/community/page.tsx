import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BOARD_LABELS } from "@/lib/types";
import type { BoardType } from "@/lib/types";

export const metadata = { title: "커뮤니티" };

export default async function CommunityPage() {
  const supabase = await createClient();
  const boards = Object.keys(BOARD_LABELS) as BoardType[];

  const counts = await Promise.all(
    boards.map(async (b) => {
      const { count } = await supabase.from("board_posts").select("*", { count: "exact", head: true }).eq("board", b);
      return [b, count || 0] as const;
    })
  );
  const countMap = Object.fromEntries(counts);

  return (
    <div className="mx-auto max-w-4xl px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">커뮤니티</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((b) => (
          <Link key={b} href={`/community/${b}`} className="rounded-sm border border-line bg-white p-4 hover:border-teal">
            <div className="mb-1 text-[14.5px] font-bold">{BOARD_LABELS[b]}</div>
            <div className="font-mono text-[12px] text-ink-soft">게시글 {countMap[b]}개</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
