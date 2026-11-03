import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OfferForm from "@/components/OfferForm";

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

  const [{ data: seeker }, { data: names }] = await Promise.all([
    supabase.from("seekers").select("*").eq("id", id).single(),
    supabase.rpc("seeker_masked_names"),
  ]);
  if (!seeker) notFound();

  const name = ((names || []) as { seeker_id: string; masked_name: string }[]).find((n) => n.seeker_id === id)?.masked_name || "구직자";

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

      {(role === "clinic" || role === "lab") && user && <OfferBox seekerId={id} userId={user.id} role={role} />}
    </div>
  );
}

async function OfferBox({ seekerId, userId, role }: { seekerId: string; userId: string; role: "clinic" | "lab" }) {
  const supabase = await createClient();
  const [{ data: org }, { data: me }, { data: offers }] = await Promise.all([
    role === "clinic"
      ? supabase.from("clinics").select("id, name:clinic_name").eq("user_id", userId).maybeSingle()
      : supabase.from("labs").select("id, name:lab_name").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("phone").eq("id", userId).single(),
    supabase.from("job_offers").select("status, created_at").eq("seeker_id", seekerId).eq("sender_id", userId).order("created_at", { ascending: false }).limit(1),
  ]);

  const { data: jobs } = org
    ? await supabase
        .from("job_posts")
        .select("id, title")
        .eq(role === "clinic" ? "clinic_id" : "lab_id", org.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
    : { data: [] };

  const last = offers?.[0];
  const dashboard = `/dashboard/${role}`;

  return (
    <div className="mt-5 rounded border border-line bg-white p-5">
      <h2 className="mb-1 text-[16px] font-extrabold">면접 제안하기</h2>
      <p className="mb-3.5 text-[12.5px] leading-relaxed text-ink-soft">
        구직자에게 제안이 전달되고, 구직자가 <b>수락하면</b> 실명과 연락처가 공개됩니다. 거절하면 연락처는 공개되지 않습니다.
      </p>

      {!org ? (
        <p className="text-[13px] text-ink-soft">업체 정보가 없어 제안할 수 없습니다. 마이페이지에서 업체 정보를 먼저 등록해주세요.</p>
      ) : last?.status === "pending" ? (
        <p className="rounded-sm bg-paper p-3 text-[13px] font-semibold">
          이미 보낸 제안이 답을 기다리고 있습니다.{" "}
          <Link href={dashboard} className="text-teal underline">
            보낸 제안 보기
          </Link>
        </p>
      ) : last?.status === "accepted" ? (
        <p className="rounded-sm bg-teal-tint p-3 text-[13px] font-semibold text-teal">
          구직자가 제안을 수락했습니다.{" "}
          <Link href={dashboard} className="underline">
            마이페이지에서 연락처 확인하기
          </Link>
        </p>
      ) : (
        <>
          {last?.status === "declined" && (
            <p className="mb-3 text-[12.5px] text-ink-soft">지난번 제안은 구직자가 거절했습니다. 다시 제안할 수 있습니다.</p>
          )}
          <OfferForm seekerId={seekerId} orgName={org.name} defaultPhone={me?.phone || ""} jobs={jobs || []} />
        </>
      )}
    </div>
  );
}
