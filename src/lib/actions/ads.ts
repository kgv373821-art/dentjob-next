"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdPosition, AdType } from "@/lib/types";

export type FormState = { error: string | null };

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("관리자만 접근할 수 있습니다.");
}

function parseAdFields(formData: FormData) {
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "") || null;
  const image = String(formData.get("image") || "") || null;
  const link = String(formData.get("link") || "");
  const position = String(formData.get("position") || "main_top") as AdPosition;
  const type = String(formData.get("type") || "image") as AdType;
  const start_date = String(formData.get("start_date") || "") || null;
  const end_date = String(formData.get("end_date") || "") || null;
  const priority = Number(formData.get("priority") || 0);
  const active = formData.get("active") === "on";
  return { title, description, image, link, position, type, start_date, end_date, priority, active };
}

export async function createAd(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  try {
    await assertAdmin(supabase);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const fields = parseAdFields(formData);
  if (!fields.title || !fields.link) return { error: "제목과 링크는 필수입니다." };

  const { error } = await supabase.from("ads").insert(fields);
  if (error) return { error: error.message };

  revalidatePath("/admin/ads");
  revalidatePath("/");
  redirect("/admin/ads");
}

export async function updateAd(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  try {
    await assertAdmin(supabase);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const fields = parseAdFields(formData);
  if (!fields.title || !fields.link) return { error: "제목과 링크는 필수입니다." };

  const { error } = await supabase.from("ads").update(fields).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/ads");
  revalidatePath("/");
  redirect("/admin/ads");
}

export async function deleteAd(id: string) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  await supabase.from("ads").delete().eq("id", id);
  revalidatePath("/admin/ads");
  revalidatePath("/");
}

export async function toggleAdActive(id: string, active: boolean) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  await supabase.from("ads").update({ active }).eq("id", id);
  revalidatePath("/admin/ads");
  revalidatePath("/");
}

/** 드래그로 재정렬된 순서(위→아래)를 우선순위 숫자로 변환해 일괄 저장합니다. 목록 맨 위가 가장 높은 우선순위. */
export async function reorderAds(orderedIds: string[]) {
  const supabase = await createClient();
  await assertAdmin(supabase);
  const n = orderedIds.length;
  await Promise.all(orderedIds.map((id, i) => supabase.from("ads").update({ priority: n - i }).eq("id", id)));
  revalidatePath("/admin/ads");
  revalidatePath("/");
}
