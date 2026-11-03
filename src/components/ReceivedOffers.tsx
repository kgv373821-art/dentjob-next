import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { respondJobOffer } from "@/lib/actions/offers";

type ReceivedOffer = {
  id: string;
  org_name: string;
  message: string;
  contact_phone: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  job_post_id: string | null;
  job_posts: { title: string } | null;
};

const fmt = (s: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(new Date(s));

/** 구직자 마이페이지의 "받은 면접 제안". 수락하면 제안한 업체에 내 실명·연락처가 공개됩니다. */
export default async function ReceivedOffers({ seekerId }: { seekerId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_offers")
    .select("id, org_name, message, contact_phone, status, created_at, job_post_id, job_posts(title)")
    .eq("seeker_id", seekerId)
    .order("created_at", { ascending: false });
  const offers = (data || []) as unknown as ReceivedOffer[];
  const pendingCount = offers.filter((o) => o.status === "pending").length;

  return (
    <section className="mb-8">
      <h2 className="mb-1 text-[16px] font-extrabold">
        받은 면접 제안
        {pendingCount > 0 && <span className="ml-2 rounded-full bg-coral px-2 py-0.5 align-middle text-[11px] font-bold text-white">새 제안 {pendingCount}</span>}
      </h2>
      <p className="mb-3 text-[12.5px] text-ink-soft">
        치과·기공소가 내 이력서를 보고 보낸 제안입니다. <b>수락하면</b> 그 업체에만 내 이름과 연락처가 공개됩니다.
      </p>
      <div className="space-y-2">
        {offers.map((o) => (
          <div key={o.id} className={`rounded-sm border bg-white p-4 text-[13px] ${o.status === "pending" ? "border-coral" : "border-line"}`}>
            <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5">
              <span className="text-[14.5px] font-extrabold">{o.org_name}</span>
              {o.job_post_id && o.job_posts?.title && (
                <Link href={`/jobs/${o.job_post_id}`} className="text-teal underline">
                  {o.job_posts.title}
                </Link>
              )}
              <span className="ml-auto text-[11.5px] text-ink-soft">{fmt(o.created_at)}</span>
            </div>
            <p className="mb-2.5 whitespace-pre-line leading-relaxed">{o.message}</p>
            <div className="mb-2.5 text-[12.5px]">
              업체 연락처:{" "}
              <a href={`tel:${o.contact_phone}`} className="font-mono font-bold text-teal">
                {o.contact_phone}
              </a>
            </div>
            {o.status === "pending" ? (
              <div className="flex gap-2">
                <form action={respondJobOffer.bind(null, o.id, true)}>
                  <button className="rounded-sm bg-teal px-4 py-2 text-[13px] font-bold text-white hover:bg-teal-deep">수락하고 연락처 공개</button>
                </form>
                <form action={respondJobOffer.bind(null, o.id, false)}>
                  <button className="rounded-sm border border-line px-4 py-2 text-[13px] font-bold text-ink-soft hover:bg-paper-dim">거절</button>
                </form>
              </div>
            ) : (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  o.status === "accepted" ? "bg-[#DCF3E5] text-[#1D7A45]" : "bg-paper-dim text-ink-soft"
                }`}
              >
                {o.status === "accepted" ? "수락함 · 업체에 연락처가 공개되었습니다" : "거절함"}
              </span>
            )}
          </div>
        ))}
        {offers.length === 0 && (
          <p className="rounded-sm border border-dashed border-line py-5 text-center text-[13px] text-ink-soft">
            아직 받은 제안이 없습니다. 이력서를 자세히 채울수록 제안 받을 가능성이 높아집니다.
          </p>
        )}
      </div>
    </section>
  );
}
