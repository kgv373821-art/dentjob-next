"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function submitClinicReview(clinicId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const rating = Number(formData.get("rating") || 0);
  const content = String(formData.get("content") || "");
  if (!rating || !content) return { error: "별점과 후기 내용을 입력해주세요." };

  const { error } = await supabase.from("clinic_reviews").upsert(
    { clinic_id: clinicId, author_id: user.id, rating, content },
    { onConflict: "clinic_id,author_id" }
  );
  if (error) return { error: error.message };

  revalidatePath(`/clinics/${clinicId}`);
  return { error: null };
}

export async function submitLabReview(labId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const rating = Number(formData.get("rating") || 0);
  const content = String(formData.get("content") || "");
  if (!rating || !content) return { error: "별점과 후기 내용을 입력해주세요." };

  const { error } = await supabase.from("lab_reviews").upsert(
    { lab_id: labId, author_id: user.id, rating, content },
    { onConflict: "lab_id,author_id" }
  );
  if (error) return { error: error.message };

  revalidatePath(`/labs/${labId}`);
  return { error: null };
}
