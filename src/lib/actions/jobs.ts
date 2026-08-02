"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

// 테스트 기간 동안 관리자 승인 없이 공고가 바로 노출되게 하는 스위치.
// 환경변수 AUTO_APPROVE_JOBS=true 로 켜고, 테스트가 끝나면 지우거나 false로 바꾸면 원래대로 승인 절차가 돌아온다.
const AUTO_APPROVE_JOBS = process.env.AUTO_APPROVE_JOBS === "true";

/** 현재 로그인한 사용자의 clinic 또는 lab 소유 레코드를 반환 */
async function getOwner(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) return null;

  if (profile.role === "clinic") {
    const { data } = await supabase.from("clinics").select("id").eq("user_id", user.id).single();
    return data ? { role: "clinic" as const, id: data.id } : null;
  }
  if (profile.role === "lab") {
    const { data } = await supabase.from("labs").select("id").eq("user_id", user.id).single();
    return data ? { role: "lab" as const, id: data.id } : null;
  }
  return null;
}

export async function createJobPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const owner = await getOwner(supabase);
  if (!owner) return { error: "치과 또는 기공소 회원만 공고를 등록할 수 있습니다." };

  const job_type = String(formData.get("job_type") || "");
  const title = String(formData.get("title") || "");
  const region = String(formData.get("region") || "");
  const pay_min = Number(formData.get("pay_min") || 0);
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

  // 기공소 전용 필드 (치과기공사 채용 축)
  const lab_specialty = owner.role === "lab" ? String(formData.get("lab_specialty") || "") || null : null;
  const lab_category = owner.role === "lab" ? String(formData.get("lab_category") || "") || null : null;
  const pay_note = owner.role === "lab" ? "+ 기공 수당 별도" : null;

  if (!job_type || !title || !region || !pay_min) return { error: "필수 항목을 입력해주세요." };

  const { error } = await supabase.from("job_posts").insert({
    clinic_id: owner.role === "clinic" ? owner.id : null,
    lab_id: owner.role === "lab" ? owner.id : null,
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
    status: AUTO_APPROVE_JOBS ? "approved" : "pending",
  });
  if (error) return { error: error.message };

  revalidatePath("/jobs");
  redirect(owner.role === "clinic" ? "/dashboard/clinic" : "/dashboard/lab");
}

export async function updateJobPost(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const owner = await getOwner(supabase);
  if (!owner) return { error: "권한이 없습니다." };

  const job_type = String(formData.get("job_type") || "");
  const title = String(formData.get("title") || "");
  const region = String(formData.get("region") || "");
  const pay_min = Number(formData.get("pay_min") || 0);
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

  const lab_specialty = owner.role === "lab" ? String(formData.get("lab_specialty") || "") || null : null;
  const lab_category = owner.role === "lab" ? String(formData.get("lab_category") || "") || null : null;
  const pay_note = owner.role === "lab" ? "+ 기공 수당 별도" : null;

  if (!job_type || !title || !region || !pay_min) return { error: "필수 항목을 입력해주세요." };

  const { error } = await supabase
    .from("job_posts")
    .update({
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
    })
    .eq("id", id)
    .eq(owner.role === "clinic" ? "clinic_id" : "lab_id", owner.id);
  if (error) return { error: error.message };

  revalidatePath(`/jobs/${id}`);
  revalidatePath("/jobs");
  redirect(owner.role === "clinic" ? "/dashboard/clinic" : "/dashboard/lab");
}

export async function deleteJobPost(id: string) {
  const supabase = await createClient();
  const owner = await getOwner(supabase);
  if (!owner) throw new Error("권한이 없습니다.");

  await supabase.from("job_posts").delete().eq("id", id);
  revalidatePath("/jobs");
  revalidatePath(owner.role === "clinic" ? "/dashboard/clinic" : "/dashboard/lab");
}

export async function closeJobPost(id: string) {
  const supabase = await createClient();
  await supabase.from("job_posts").update({ status: "closed" }).eq("id", id);
  revalidatePath("/jobs");
}

export async function incrementViewCount(id: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_view_count", { post_id: id }).select();
}
