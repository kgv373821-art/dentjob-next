import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SeekerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: seeker } = await supabase.from("seekers").select("*, profiles(name)").eq("id", id).single();
  if (!seeker) notFound();

  const name = (seeker as unknown as { profiles?: { name: string } }).profiles?.name || "구직자";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="overflow-hidden rounded border border-line">
        <div
          className="flex h-[150px] items-center justify-center font-mono text-[12px] tracking-widest text-white"
          style={{ background: `linear-gradient(135deg, var(--color-ink), var(--color-teal-deep))` }}
        >
          {name}
        </div>
        <div className="p-7">
          <h1 className="mb-1 text-[20px] font-extrabold">{name}</h1>
          <div className="mb-4 text-[13px] text-ink-soft">
            {seeker.desired_job} · 경력 {seeker.career_years}년
          </div>

          <dl className="mb-4.5 grid grid-cols-[90px_1fr] gap-y-2 gap-x-3 text-[13.5px]">
            {seeker.certifications && (
              <>
                <dt className="font-semibold text-ink-soft">자격증</dt>
                <dd>{seeker.certifications}</dd>
              </>
            )}
            {seeker.desired_region && (
              <>
                <dt className="font-semibold text-ink-soft">희망지역</dt>
                <dd>{seeker.desired_region}</dd>
              </>
            )}
            {seeker.desired_pay_min && (
              <>
                <dt className="font-semibold text-ink-soft">희망급여</dt>
                <dd className="font-mono">월 {seeker.desired_pay_min}만원 이상</dd>
              </>
            )}
            {seeker.portfolio_url && (
              <>
                <dt className="font-semibold text-ink-soft">포트폴리오</dt>
                <dd>
                  <a href={seeker.portfolio_url} className="text-teal underline" target="_blank" rel="noreferrer">
                    포트폴리오 보기
                  </a>
                </dd>
              </>
            )}
          </dl>

          {seeker.self_intro && (
            <div className="whitespace-pre-line rounded-sm border border-line bg-paper p-3.5 text-[13.5px] leading-relaxed">
              {seeker.self_intro}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
