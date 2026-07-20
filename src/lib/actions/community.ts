"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BoardType } from "@/lib/types";

export type FormState = { error: string | null };

export async function createBoardPost(board: BoardType, _prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const title = String(formData.get("title") || "");
  const content = String(formData.get("content") || "");
  const priceRaw = formData.get("price");
  if (!title || !content) return { error: "제목과 내용을 입력해주세요." };

  const { data, error } = await supabase
    .from("board_posts")
    .insert({
      board,
      author_id: user.id,
      title,
      content,
      price: board === "used_equipment" && priceRaw ? Number(priceRaw) : null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath(`/community/${board}`);
  redirect(`/community/${board}/${data.id}`);
}

export async function submitComment(postId: string, board: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const content = String(formData.get("content") || "").trim();
  if (!content) return;

  const { error } = await supabase.from("board_comments").insert({ post_id: postId, author_id: user.id, content });
  if (error) throw new Error(error.message);

  revalidatePath(`/community/${board}/${postId}`);
}

export async function incrementBoardView(postId: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_board_view", { post_id: postId });
}
