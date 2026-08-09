import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { maskName } from "@/lib/constants";

export default async function SeekerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }
  const isEmployer = role === "clinic" || role === "lab" || role === "admin";

  if (!isEmployer) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="mb-3 text-[19px] font-extrabold">구직자 정보는 치과·기공소 회원만 볼 수 있습니다</h1>
        <p className="mb-6 text-[13.5px] text-ink-soft">구직자 개인정보 보호를 위해 사업자(치과·기공소) 계정으로 로그인해야 열람할 수 있습니다.</p>
        <Link href="/login" className="inline-block rounded-sm bg-teal px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-teal-deep">
          로그인하기
        </Link>
      </div>
    );
  }

  const { data: seeker } = await supabase.from("seekers").select("*, profiles(name)").eq("id", id).single();
  if (!seeker) notFound();

  const name = maskName((seeker as unknown as { profiles?: { name: string } }).profiles?.name || "");

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
