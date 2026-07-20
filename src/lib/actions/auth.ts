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
  if (role === "clinic") {
    const clinic_name = String(formData.get("clinic_name") || "");
    const region_main = String(formData.get("region_main") || "");
    await supabase.from("clinics").insert({ user_id: data.user.id, clinic_name, region_main });
  } else if (role === "lab") {
    const lab_name = String(formData.get("lab_name") || "");
    const region_main = String(formData.get("region_main") || "");
    const specialties = formData.getAll("specialties").map(String);
    const has_cadcam = formData.get("has_cadcam") === "on";
    await supabase.from("labs").insert({ user_id: data.user.id, lab_name, region_main, specialties, has_cadcam });
  } else if (role === "seeker") {
    const desired_job = String(formData.get("desired_job") || "") || null;
    const lab_specialty = String(formData.get("lab_specialty") || "") || null;
    const desired_region = String(formData.get("desired_region") || "") || null;
    await supabase
      .from("seekers")
      .insert({ user_id: data.user.id, desired_job, lab_specialty, desired_region });
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
