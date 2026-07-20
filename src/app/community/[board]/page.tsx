import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BOARD_LABELS } from "@/lib/types";
import type { BoardType } from "@/lib/types";

const VALID_BOARDS = Object.keys(BOARD_LABELS);

export async function generateMetadata({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  return { title: BOARD_LABELS[board as BoardType] || "커뮤니티" };
}

export default async function BoardListPage({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  if (!VALID_BOARDS.includes(board)) notFound();

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("board_posts")
    .select("*, profiles(name)")
    .eq("board", board)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl px-6 py-9">
      <div className="mb-5 flex items-center justify-between border-b-2 border-ink pb-2.5">
        <h1 className="text-[21px] font-extrabold">{BOARD_LABELS[board as BoardType]}</h1>
        <Link href={`/community/${board}/new`} className="rounded-sm bg-teal px-4 py-2 text-[13px] font-bold text-white hover:bg-teal-deep">
          + 글쓰기
        </Link>
      </div>

      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b border-line text-[11.5px] text-ink-soft">
            <th className="p-2.5 text-left">제목</th>
            <th className="p-2.5 text-left">작성자</th>
            {board === "used_equipment" && <th className="p-2.5 text-left">가격</th>}
            <th className="p-2.5 text-left">조회</th>
            <th className="p-2.5 text-left">작성일</th>
          </tr>
        </thead>
        <tbody>
          {(posts || []).map((p) => (
            <tr key={p.id} className="border-b border-line hover:bg-teal-tint">
              <td className="p-2.5">
                <Link href={`/community/${board}/${p.id}`} className="font-semibold hover:text-teal">
                  {p.title}
                </Link>
              </td>
              <td className="p-2.5 text-ink-soft">{(p as unknown as { profiles?: { name: string } }).profiles?.name}</td>
              {board === "used_equipment" && (
                <td className="p-2.5 font-mono text-teal">{p.price ? `${p.price.toLocaleString()}원` : "-"}</td>
              )}
              <td className="p-2.5 font-mono">{p.view_count}</td>
              <td className="p-2.5 font-mono text-[12px] text-ink-soft">{new Date(p.created_at).toLocaleDateString("ko-KR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(!posts || posts.length === 0) && <p className="py-14 text-center text-ink-soft">등록된 게시글이 없습니다.</p>}
    </div>
  );
}
