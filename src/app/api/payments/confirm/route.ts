import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { confirmTossPayment } from "@/lib/services/toss";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { paymentKey, orderId, amount } = await req.json();

  const { data: record } = await supabase.from("payments").select("*").eq("toss_order_id", orderId).single();
  if (!record) return NextResponse.json({ error: "주문 정보를 찾을 수 없습니다." }, { status: 404 });
  if (record.amount !== amount) return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });

  try {
    const tossData = await confirmTossPayment({ paymentKey, orderId, amount });
    const { data: updated } = await supabase
      .from("payments")
      .update({ status: "paid", toss_payment_key: paymentKey, raw_response: tossData, paid_at: new Date().toISOString() })
      .eq("toss_order_id", orderId)
      .select()
      .single();

    if (updated?.job_post_id) {
      if (updated.product_code === "urgent_post") {
        await supabase.from("job_posts").update({ is_urgent: true }).eq("id", updated.job_post_id);
      } else if (updated.product_code === "pinned_post") {
        await supabase.from("job_posts").update({ is_pinned: true }).eq("id", updated.job_post_id);
      } else if (["main_exposure", "premium_post"].includes(updated.product_code)) {
        await supabase.from("job_posts").update({ is_main_exposed: true }).eq("id", updated.job_post_id);
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    const e = err as Error & { data?: unknown };
    await supabase.from("payments").update({ status: "failed", raw_response: e.data ?? { message: e.message } }).eq("toss_order_id", orderId);
    return NextResponse.json({ error: "결제 승인에 실패했습니다.", detail: e.data }, { status: 400 });
  }
}
