"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types";

export type FormState = { error: string | null; success?: boolean };

export async function applyToJob(jobPostId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: seeker } = await supabase.from("seekers").select("id").eq("user_id", user.id).single();
  if (!seeker) return { error: "이력서를 먼저 작성해주세요." };

  const message = String(formData.get("message") || "");
  const { error } = await supabase
    .from("applications")
    .insert({ job_post_id: jobPostId, seeker_id: seeker.id, message: message || null });

  if (error) {
    if (error.code === "23505") return { error: "이미 지원한 공고입니다." };
    return { error: error.message };
  }

  revalidatePath(`/jobs/${jobPostId}`);
  return { error: null, success: true };
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("applications").update({ status }).eq("id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/clinic");
  revalidatePath("/dashboard/lab");
}

export async function scheduleInterview(applicationId: string, scheduledAt: string, location: string) {
  const supabase = await createClient();
  await supabase.from("interviews").insert({ application_id: applicationId, scheduled_at: scheduledAt, location });
  await supabase.from("applications").update({ status: "interview" }).eq("id", applicationId);
  revalidatePath("/dashboard/clinic");
  revalidatePath("/dashboard/lab");
}
