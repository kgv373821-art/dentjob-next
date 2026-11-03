"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type OfferFormState = { error: string | null; success?: boolean };

/** 치과·기공소가 인재정보에서 구직자에게 면접을 제안합니다. 구직자가 수락해야 실명·연락처가 공개됩니다. */
export async function sendJobOffer(seekerId: string, _prev: OfferFormState, formData: FormData): Promise<OfferFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "clinic" && profile?.role !== "lab") return { error: "치과·기공소 회원만 면접을 제안할 수 있습니다." };

  const { data: org } =
    profile.role === "clinic"
      ? await supabase.from("clinics").select("name:clinic_name").eq("user_id", user.id).maybeSingle()
      : await supabase.from("labs").select("name:lab_name").eq("user_id", user.id).maybeSingle();
  if (!org?.name) return { error: "업체 정보가 없습니다. 마이페이지에서 업체 정보를 먼저 등록해주세요." };

  const message = String(formData.get("message") || "").trim();
  const contactPhone = String(formData.get("contact_phone") || "").trim();
  const jobPostId = String(formData.get("job_post_id") || "") || null;
  if (message.length < 5) return { error: "제안 내용을 5자 이상 적어주세요." };
  if (message.length > 1000) return { error: "제안 내용은 1,000자 이내로 적어주세요." };
  if (!/^[0-9-]{9,14}$/.test(contactPhone)) return { error: "연락받을 전화번호를 숫자와 - 로 입력해주세요." };

  const { error } = await supabase.from("job_offers").insert({
    seeker_id: seekerId,
    sender_id: user.id,
    org_name: org.name,
    job_post_id: jobPostId,
    message,
    contact_phone: contactPhone,
  });
  if (error) {
    if (error.code === "23505") return { error: "이 구직자에게 보낸 제안이 아직 답을 기다리고 있습니다." };
    return { error: error.message };
  }

  revalidatePath(`/seekers/${seekerId}`);
  revalidatePath(`/dashboard/${profile.role}`);
  return { error: null, success: true };
}

/** 구직자가 받은 면접 제안을 수락하거나 거절합니다. 수락하면 제안한 업체에 실명·연락처가 공개됩니다. */
export async function respondJobOffer(offerId: string, accept: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_job_offer", { offer_id: offerId, accept });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/seeker");
}
