"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null; success?: boolean };

export async function updateResume(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const patch: Record<string, unknown> = {};
  for (const key of ["desired_job", "lab_specialty", "desired_region", "certifications", "self_intro", "portfolio_url"]) {
    const v = formData.get(key);
    if (v !== null) patch[key] = v === "" ? null : v;
  }
  if (formData.get("career_years")) patch.career_years = Number(formData.get("career_years"));
  if (formData.get("desired_pay_min")) patch.desired_pay_min = Number(formData.get("desired_pay_min"));

  const { error } = await supabase.from("seekers").update(patch).eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/seeker");
  return { error: null, success: true };
}
