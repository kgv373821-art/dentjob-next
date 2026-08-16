"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export type AuthState = { error: string | null };

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const role = String(formData.get("role") || "seeker") as UserRole;

  if (!email || !password || !name) return { error: "필수 항목을 입력해주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, name, phone } },
  });
  if (error) return { error: error.message };
  if (!data.user) return { error: "회원가입에 실패했습니다." };

  // 역할별 프로필 레코드 생성 (치과기공사 지원자는 desired_job/lab_specialty를 함께 저장)
  // upsert를 써서, 재시도나 이중 제출로 동일 user_id 레코드가 이미 있어도 에러 없이 최신 값으로 갱신되게 한다.
  let profileError: string | null = null;
  if (role === "clinic") {
    const clinic_name = String(formData.get("clinic_name") || "");
    const region_main = String(formData.get("region_main") || "");
    const { error: e } = await supabase.from("clinics").upsert({ user_id: data.user.id, clinic_name, region_main }, { onConflict: "user_id" });
    if (e) profileError = e.message;
  } else if (role === "lab") {
    const lab_name = String(formData.get("lab_name") || "");
    const region_main = String(formData.get("region_main") || "");
    const specialties = formData.getAll("specialties").map(String);
    const has_cadcam = formData.get("has_cadcam") === "on";
    const { error: e } = await supabase
      .from("labs")
      .upsert({ user_id: data.user.id, lab_name, region_main, specialties, has_cadcam }, { onConflict: "user_id" });
    if (e) profileError = e.message;
  } else if (role === "seeker") {
    const desired_job = String(formData.get("desired_job") || "") || null;
    const lab_specialty = String(formData.get("lab_specialty") || "") || null;
    const desired_region = String(formData.get("desired_region") || "") || null;
    const { error: e } = await supabase
      .from("seekers")
      .upsert({ user_id: data.user.id, desired_job, lab_specialty, desired_region }, { onConflict: "user_id" });
    if (e) profileError = e.message;
  }
  if (profileError) return { error: `회원 정보는 생성되었지만 프로필 저장에 실패했습니다: ${profileError}` };

  // 이메일 인증 없이 가입 즉시 로그인되는 설정이면, 로그인 화면을 또 거치지 않고
  // 바로 본론(치과/기공소는 공고 등록, 구직자는 이력서 작성)으로 이동시킨다.
  if (data.session) {
    if (role === "clinic") redirect("/dashboard/clinic/new");
    if (role === "lab") redirect("/dashboard/lab/new");
    redirect("/dashboard/seeker");
  }

  redirect("/login?registered=1");
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
