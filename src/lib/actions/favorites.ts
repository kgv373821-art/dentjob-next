"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FavoriteTarget } from "@/lib/types";

export async function toggleFavorite(targetType: FavoriteTarget, targetId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, target_type: targetType, target_id: targetId });
  }

  revalidatePath("/jobs");
  revalidatePath("/favorites");
}

export async function getMyFavoriteIds(targetType: FavoriteTarget): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.from("favorites").select("target_id").eq("user_id", user.id).eq("target_type", targetType);
  return (data || []).map((d) => d.target_id);
}
