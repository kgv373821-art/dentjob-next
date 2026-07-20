import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/services/sms";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });

  const { target_group, content } = await req.json();
  const roleMap: Record<string, string> = { all_seekers: "seeker", all_clinics: "clinic", all_labs: "lab" };
  const role = roleMap[target_group];
  if (!role) return NextResponse.json({ error: "알 수 없는 대상 그룹입니다." }, { status: 400 });

  const { data: profiles } = await supabase.from("profiles").select("phone").eq("role", role).not("phone", "is", null);
  const recipients = (profiles || []).map((p) => p.phone!).filter(Boolean);

  try {
    const providerResponse = recipients.length ? await sendSms(recipients, content) : { skipped: true };
    await supabase.from("sms_logs").insert({
      target_group,
      recipient_count: recipients.length,
      content,
      sent_by: user.id,
      provider_response: providerResponse,
    });
    return NextResponse.json({ ok: true, recipient_count: recipients.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
