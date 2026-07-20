export const PRODUCT_PRICES: Record<string, number> = {
  general_post: 0,
  premium_post: 50000,
  main_exposure: 100000,
  urgent_post: 30000,
  pinned_post: 70000,
  banner_ad: 300000,
  company_page_ad: 150000,
  talent_recommend: 500000,
};

function authHeader() {
  const secretKey = process.env.TOSS_SECRET_KEY || "";
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return { Authorization: `Basic ${encoded}`, "Content-Type": "application/json" };
}

export async function confirmTossPayment(params: { paymentKey: string; orderId: string; amount: number }) {
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || "결제 승인 실패"), { data });
  return data;
}

export async function cancelTossPayment(paymentKey: string, cancelReason: string) {
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ cancelReason }),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || "결제 취소 실패"), { data });
  return data;
}
