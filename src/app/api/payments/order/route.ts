import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_PRICES } from "@/lib/services/toss";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { product_code, job_post_id } = await req.json();
  const amount = PRODUCT_PRICES[product_code];
  if (amount === undefined) return NextResponse.json({ error: "알 수 없는 상품입니다." }, { status: 400 });

  const orderId = `DJ-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase
    .from("payments")
    .insert({ user_id: user.id, job_post_id: job_post_id || null, product_code, amount, toss_order_id: orderId, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    payment: data,
    tossClientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    orderId,
    amount,
  });
}
