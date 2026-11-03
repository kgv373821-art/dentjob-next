import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SentOffer = {
  id: string;
  seeker_id: string;
  status: "pending" | "accepted" | "declined";
  message: string;
  job_title: string | null;
  created_at: string;
  responded_at: string | null;
  masked_name: string;
  desired_job: string | null;
  career_years: number | null;
  seeker_name: string | null;
  seeker_phone: string | null;
  seeker_email: string | null;
};

const STATUS: Record<SentOffer["status"], { label: string; cls: string }> = {
  pending: { label: "답변 대기", cls: "bg-[#FFF1CE] text-[#946200]" },
  accepted: { label: "수락", cls: "bg-[#DCF3E5] text-[#1D7A45]" },
  declined: { label: "거절", cls: "bg-paper-dim text-ink-soft" },
};

const fmt = (s: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(new Date(s));

/** 치과·기공소 마이페이지의 "보낸 면접 제안" 목록. 수락된 제안만 구직자 실명·연락처가 보입니다. */
export default async function SentOffers() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_sent_offers");
  const offers = (data || []) as SentOffer[];

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[16px] font-extrabold">보낸 면접 제안</h2>
        <Link href="/seekers" className="text-[12.5px] font-bold text-teal">
          인재정보에서 제안하기 →
        </Link>
      </div>
      <div className="space-y-2">
        {offers.map((o) => (
          <div key={o.id} className="rounded-sm border border-line bg-white p-3.5 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
              <Link href={`/seekers/${o.seeker_id}`} className="font-bold hover:text-teal">
                {o.seeker_name || o.masked_name}
              </Link>
              <span className="text-ink-soft">
                {o.desired_job || "직종 미정"} · 경력 {o.career_years ?? 0}년
              </span>
              <span className="ml-auto text-[11.5px] text-ink-soft">
                {fmt(o.created_at)} 제안{o.job_title ? ` · ${o.job_title}` : ""}
              </span>
            </div>
            {o.status === "accepted" && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 rounded-sm bg-teal-tint px-3 py-2 font-semibold">
                {o.seeker_phone ? (
                  <a href={`tel:${o.seeker_phone}`} className="font-mono text-teal">
                    {o.seeker_phone}
                  </a>
                ) : (
                  <span className="text-ink-soft">전화번호 미등록</span>
                )}
                {o.seeker_email && (
                  <a href={`mailto:${o.seeker_email}`} className="text-teal">
                    {o.seeker_email}
                  </a>
                )}
              </div>
            )}
            {o.status === "pending" && <p className="mt-1.5 text-[12px] text-ink-soft">구직자가 수락하면 여기에 실명과 연락처가 나타납니다.</p>}
          </div>
        ))}
        {offers.length === 0 && (
          <p className="rounded-sm border border-dashed border-line py-6 text-center text-[13px] text-ink-soft">
            아직 보낸 제안이 없습니다. 인재정보에서 마음에 드는 이력서를 열고 &quot;면접 제안하기&quot;를 눌러보세요.
          </p>
        )}
      </div>
    </section>
  );
}
