"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { JOB_EXPIRY_DAYS } from "@/lib/constants";

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("관리자만 접근할 수 있습니다.");
}

export async function approveJobPost(id: string) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + JOB_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await supabase
    .from("job_posts")
    .update({ status: "approved", posted_at: now.toISOString(), expires_at: expiresAt.toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/jobs");
}

export async function rejectJobPost(id: string) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  await supabase.from("job_posts").update({ status: "rejected" }).eq("id", id);
  revalidatePath("/admin");
}

/** 결제 없이(계좌이체 등 사이트 밖에서 대금을 받은 뒤) 관리자가 상단고정/프리미엄/긴급 강조를 수동으로 켜고 끕니다. */
export async function togglePromotion(id: string, field: "is_pinned" | "is_main_exposed" | "is_urgent", value: boolean) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  await supabase.from("job_posts").update({ [field]: value }).eq("id", id);
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/");
}

export async function deleteBoardPosts(ids: string[]) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  if (ids.length === 0) return;
  await supabase.from("board_posts").delete().in("id", ids);
  revalidatePath("/admin/community");
  revalidatePath("/community");
  revalidatePath("/");
}

export async function deleteJobPostsAdmin(ids: string[]) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  if (ids.length === 0) return;
  await supabase.from("job_posts").delete().in("id", ids);
  revalidatePath("/admin/community");
  revalidatePath("/jobs");
  revalidatePath("/");
}

export async function resolveReport(id: string, status: "resolved" | "dismissed") {
  const supabase = await createClient();
  await assertAdmin(supabase);
  await supabase.from("reports").update({ status }).eq("id", id);
  revalidatePath("/admin/reports");
}

export async function createNotice(_prev: { error: string | null }, formData: FormData) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  const title = String(formData.get("title") || "");
  const content = String(formData.get("content") || "");
  if (!title || !content) return { error: "제목과 내용을 입력해주세요." };
  await supabase.from("notices").insert({ title, content });
  revalidatePath("/admin/notices");
  return { error: null };
}

/**
 * 문자 발송 — 실제 발송은 서버리스 함수(Route Handler)에서 네이버클라우드 SENS API를 호출합니다.
 * (Server Action에서 외부 HTTP 연동을 처리해도 되지만, 재시도/타임아웃 제어를 위해 Route Handler로 분리)
 */
export async function broadcastSms(_prev: { error: string | null }, formData: FormData) {
  const supabase = await createClient();
  await assertAdmin(supabase);

  const target_group = String(formData.get("target_group") || "");
  const content = String(formData.get("content") || "");
  if (!target_group || !content) return { error: "대상과 내용을 입력해주세요." };

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_group, content }),
  });
  if (!res.ok) return { error: "문자 발송에 실패했습니다." };
  revalidatePath("/admin/sms");
  return { error: null };
}
