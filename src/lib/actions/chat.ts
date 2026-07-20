"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function openConversation(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();

  let conversationId = existing?.id;
  if (!conversationId) {
    const { data, error } = await supabase.from("conversations").insert({ application_id: applicationId }).select("id").single();
    if (error) throw new Error(error.message);
    conversationId = data.id;
  }

  redirect(`/chat/${conversationId}`);
}

export async function sendMessage(conversationId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const content = String(formData.get("content") || "").trim();
  if (!content) return;

  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, content });
  if (error) throw new Error(error.message);

  revalidatePath(`/chat/${conversationId}`);
}
