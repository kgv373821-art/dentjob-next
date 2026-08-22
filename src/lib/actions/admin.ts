"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JOB_EXPIRY_DAYS } from "@/lib/constants";
import { parseJobDetailFields } from "@/lib/jobFields";
import type { FormState } from "@/lib/actions/jobs";

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("관리자만 접근할 수 있습니다.");
}

/**
 * 관리자가 치과/기공소 계정을 대신해 공고를 등록합니다.
 * (전화 접수 등 사이트 밖에서 요청받은 공고를 관리자가 대리 입력할 때 사용 — 등록된 공고는 그 계정 소유가 되어
 * 해당 치과/기공소가 나중에 직접 로그인해도 자기 공고로 조회·수정할 수 있습니다.)
 */
export async function adminCreateJobPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  await assertAdmin(supabase);

  const target_role = String(formData.get("target_role") || "");
  const target_id = String(formData.get("target_id") || "");
  if (target_role !== "clinic" && target_role !== "lab") return { error: "치과 또는 기공소를 선택해주세요." };

  // target_id가 있으면(기존 가입 계정 선택) 실제로 존재하는지 확인 — 없으면(계정 없이 등록) clinic_id/lab_id를 비워둡니다.
  if (target_id) {
    const { data: target } = await supabase
      .from(target_role === "clinic" ? "clinics" : "labs")
      .select("id")
      .eq("id", target_id)
      .single();
    if (!target) return { error: "선택한 계정을 찾을 수 없습니다." };
  }

  const org_name = String(formData.get("org_name") || "").trim() || null;
  if (!target_id && !org_name) return { error: "계정을 연결하지 않는 경우 업체명은 필수입니다." };
  const job_type = String(formData.get("job_type") || "");
  const title = String(formData.get("title") || "");
  const region = String(formData.get("region") || "");
  const payMinRaw = formData.get("pay_min");
  const pay_min = payMinRaw ? Number(payMinRaw) : null;
  const work_hours = String(formData.get("work_hours") || "") || null;
  const description = String(formData.get("description") || "") || null;
  const welfare = String(formData.get("welfare") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const is_urgent = formData.get("is_urgent") === "on";

  let image_urls: string[] = [];
  try {
    const raw = JSON.parse(String(formData.get("image_urls") || "[]"));
    if (Array.isArray(raw)) image_urls = raw.filter((u) => typeof u === "string").slice(0, 5);
  } catch {
    image_urls = [];
  }

  const lab_specialty = target_role === "lab" ? String(formData.get("lab_specialty") || "") || null : null;
  const lab_category = target_role === "lab" ? String(formData.get("lab_category") || "") || null : null;
  const pay_note = target_role === "lab" ? "+ 기공 수당 별도" : null;

  if (!job_type || !title || !region) return { error: "필수 항목을 입력해주세요." };

  const now = new Date();
  const expiresAt = new Date(now.getTime() + JOB_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("job_posts").insert({
    clinic_id: target_id && target_role === "clinic" ? target_id : null,
    lab_id: target_id && target_role === "lab" ? target_id : null,
    job_type,
    lab_specialty,
    lab_category,
    title,
    region,
    pay_min,
    pay_note,
    work_hours,
    welfare,
    description,
    is_urgent,
    image_urls,
    org_name,
    status: "approved",
    posted_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    ...parseJobDetailFields(formData),
  });
  if (error) return { error: error.message };

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
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
