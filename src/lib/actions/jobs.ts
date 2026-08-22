"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JOB_EXPIRY_DAYS, URGENT_LIMIT_CLINIC, URGENT_LIMIT_LAB } from "@/lib/constants";

export type FormState = { error: string | null };

// 테스트 기간 동안 관리자 승인 없이 공고가 바로 노출되게 하는 스위치.
// 환경변수 AUTO_APPROVE_JOBS=true 로 켜고, 테스트가 끝나면 지우거나 false로 바꾸면 원래대로 승인 절차가 돌아온다.
const AUTO_APPROVE_JOBS = process.env.AUTO_APPROVE_JOBS === "true";

/** 채용정보 상세 항목(담당업무/근무형태/모집인원/학력/경력/모집기간/접수방법 등)을 폼에서 읽어옵니다. */
export function parseJobDetailFields(formData: FormData) {
  const str = (key: string) => String(formData.get(key) || "").trim() || null;
  return {
    duties: str("duties"),
    employment_type: str("employment_type"),
    headcount: str("headcount"),
    education_level: str("education_level"),
    career_requirement: str("career_requirement"),
    recruit_start_date: str("recruit_start_date"),
    recruit_end_date: str("recruit_end_date"),
    application_method: str("application_method"),
    application_email: str("application_email"),
    required_documents: str("required_documents"),
    work_address: str("work_address"),
    nearby_station: str("nearby_station"),
    homepage_url: str("homepage_url"),
    hr_contact_name: str("hr_contact_name"),
    hr_contact_phone: str("hr_contact_phone"),
    contact_email: str("contact_email"),
  };
}

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

/** 이 업체가 지금 이미 보유 중인(승인대기+게시중) 긴급 공고 개수가 상한을 넘는지 확인합니다. */
async function checkUrgentLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  owner: { role: "clinic" | "lab"; id: string },
  excludeId?: string
): Promise<string | null> {
  const limit = owner.role === "clinic" ? URGENT_LIMIT_CLINIC : URGENT_LIMIT_LAB;
  let query = supabase
    .from("job_posts")
    .select("id", { count: "exact", head: true })
    .eq(owner.role === "clinic" ? "clinic_id" : "lab_id", owner.id)
    .eq("is_urgent", true)
    .in("status", ["pending", "approved"]);
  if (excludeId) query = query.neq("id", excludeId);

  const { count } = await query;
  if ((count || 0) >= limit) {
    return `긴급 채용은 ${owner.role === "clinic" ? "치과" : "기공소"} 계정당 동시에 최대 ${limit}개까지만 등록할 수 있습니다. 기존 긴급 공고를 마감한 뒤 다시 시도해주세요.`;
  }
  return null;
}

export async function createJobPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const owner = await getOwner(supabase);
  if (!owner) return { error: "치과 또는 기공소 회원만 공고를 등록할 수 있습니다." };

  const org_name = String(formData.get("org_name") || "").trim() || null;

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

  // 기공소 전용 필드 (치과기공사 채용 축)
  const lab_specialty = owner.role === "lab" ? String(formData.get("lab_specialty") || "") || null : null;
  const lab_category = owner.role === "lab" ? String(formData.get("lab_category") || "") || null : null;
  const pay_note = owner.role === "lab" ? "+ 기공 수당 별도" : null;

  if (!job_type || !title || !region) return { error: "필수 항목을 입력해주세요." };

  if (is_urgent) {
    const urgentError = await checkUrgentLimit(supabase, owner);
    if (urgentError) return { error: urgentError };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + JOB_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

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
    org_name,
    status: AUTO_APPROVE_JOBS ? "approved" : "pending",
    posted_at: AUTO_APPROVE_JOBS ? now.toISOString() : null,
    expires_at: AUTO_APPROVE_JOBS ? expiresAt.toISOString() : null,
    ...parseJobDetailFields(formData),
  });
  if (error) return { error: error.message };

  revalidatePath("/jobs");
  redirect(owner.role === "clinic" ? "/dashboard/clinic" : "/dashboard/lab");
}

export async function updateJobPost(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const owner = await getOwner(supabase);
  if (!owner) return { error: "권한이 없습니다." };

  const org_name = String(formData.get("org_name") || "").trim() || null;

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

  const lab_specialty = owner.role === "lab" ? String(formData.get("lab_specialty") || "") || null : null;
  const lab_category = owner.role === "lab" ? String(formData.get("lab_category") || "") || null : null;
  const pay_note = owner.role === "lab" ? "+ 기공 수당 별도" : null;

  if (!job_type || !title || !region) return { error: "필수 항목을 입력해주세요." };

  if (is_urgent) {
    const urgentError = await checkUrgentLimit(supabase, owner, id);
    if (urgentError) return { error: urgentError };
  }

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
      org_name,
      ...parseJobDetailFields(formData),
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

/** 노출 기간을 오늘부터 다시 JOB_EXPIRY_DAYS일로 연장합니다. */
export async function extendJobPost(id: string) {
  const supabase = await createClient();
  const owner = await getOwner(supabase);
  if (!owner) throw new Error("권한이 없습니다.");

  const expiresAt = new Date(Date.now() + JOB_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await supabase
    .from("job_posts")
    .update({ expires_at: expiresAt.toISOString() })
    .eq("id", id)
    .eq(owner.role === "clinic" ? "clinic_id" : "lab_id", owner.id);

  revalidatePath("/jobs");
  revalidatePath(owner.role === "clinic" ? "/dashboard/clinic" : "/dashboard/lab");
}

export async function incrementViewCount(id: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_view_count", { post_id: id }).select();
}
