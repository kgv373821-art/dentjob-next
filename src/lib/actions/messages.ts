"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MessageFormState = { error: string | null; success?: boolean };

/** 관리자가 회원 한 명에게 운영자 메시지를 보냅니다. 회원은 마이페이지 맨 위에서 봅니다. */
export async function sendMemberMessage(userId: string, _prev: MessageFormState, formData: FormData): Promise<MessageFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "관리자만 보낼 수 있습니다." };

  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "내용을 입력해주세요." };
  if (body.length > 2000) return { error: "2,000자 이내로 적어주세요." };

  const { error } = await supabase.from("member_messages").insert({ user_id: userId, sender_id: user.id, body });
  if (error) return { error: error.message };

  revalidatePath("/admin/members");
  return { error: null, success: true };
}

/** 회원이 마이페이지에서 운영자 메시지를 확인했다고 표시합니다. */
export async function markMemberMessagesRead() {
  const supabase = await createClient();
  await supabase.rpc("mark_member_messages_read");
  revalidatePath("/", "layout");
}
