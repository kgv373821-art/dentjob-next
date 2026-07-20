import { notFound } from "next/navigation";
import { BOARD_LABELS } from "@/lib/types";
import type { BoardType } from "@/lib/types";
import BoardPostForm from "@/components/BoardPostForm";

const VALID_BOARDS = Object.keys(BOARD_LABELS);

export default async function NewBoardPostPage({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  if (!VALID_BOARDS.includes(board)) notFound();
  return <BoardPostForm board={board as BoardType} />;
}
