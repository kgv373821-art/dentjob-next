import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { incrementBoardView } from "@/lib/actions/community";
import { BOARD_LABELS } from "@/lib/types";
import type { BoardType } from "@/lib/types";
import CommentForm from "@/components/CommentForm";

export default async function BoardPostDetailPage({ params }: { params: Promise<{ board: string; postId: string }> }) {
  const { board, postId } = await params;
  if (!Object.keys(BOARD_LABELS).includes(board)) notFound();

  const supabase = await createClient();
  const { data: post } = await supabase.from("board_posts").select("*, profiles(name)").eq("id", postId).single();
  if (!post) notFound();

  await incrementBoardView(postId);

  const { data: comments } = await supabase
    .from("board_comments")
    .select("*, profiles(name)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl px-6 py-9">
      <p className="mb-2 font-mono text-[11.5px] text-ink-soft">{BOARD_LABELS[board as BoardType]}</p>
      <h1 className="mb-2 text-[19px] font-extrabold">{post.title}</h1>
      <div className="mb-4 flex items-center gap-2 text-[12px] text-ink-soft">
        <span>{(post as unknown as { profiles?: { name: string } }).profiles?.name}</span>
        <span>·</span>
        <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
        <span>·</span>
        <span>조회 {post.view_count}</span>
        {post.price != null && (
          <>
            <span>·</span>
            <span className="font-mono font-bold text-teal">{post.price.toLocaleString()}원</span>
          </>
        )}
      </div>

      <div className="mb-8 whitespace-pre-line rounded-sm border border-line bg-white p-4 text-[13.5px] leading-relaxed">
        {post.content}
      </div>

      <h2 className="mb-3 text-[14px] font-bold">댓글 {comments?.length || 0}개</h2>
      <div className="mb-4 space-y-2">
        {(comments || []).map((c) => (
          <div key={c.id} className="rounded-sm border border-line bg-white p-3 text-[13px]">
            <div className="mb-1 flex items-center gap-2 text-[11.5px] text-ink-soft">
              <span className="font-bold text-ink">{(c as unknown as { profiles?: { name: string } }).profiles?.name}</span>
              <span>{new Date(c.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
            {c.content}
          </div>
        ))}
        {(!comments || comments.length === 0) && <p className="text-[13px] text-ink-soft">첫 댓글을 남겨보세요.</p>}
      </div>

      {user ? (
        <CommentForm postId={postId} board={board} />
      ) : (
        <p className="text-[13px] text-ink-soft">로그인 후 댓글을 작성할 수 있습니다.</p>
      )}
    </div>
  );
}
