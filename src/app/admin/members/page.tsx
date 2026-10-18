import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { regionLabel } from "@/lib/constants";

type Member = {
  id: string;
  role: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  org_name: string | null;
  org_region: string | null;
  org_address: string | null;
  seeker_id: string | null;
  desired_job: string | null;
  lab_specialty: string | null;
  career_years: number | null;
  desired_region: string | null;
  desired_pay_min: number | null;
  certifications: string | null;
  self_intro: string | null;
  portfolio_url: string | null;
  resume_updated_at: string | null;
  post_count: number;
  application_count: number;
};

const ROLE_TABS = [
  { key: "all", label: "전체" },
  { key: "seeker", label: "구직자" },
  { key: "clinic", label: "치과" },
  { key: "lab", label: "기공소" },
  { key: "admin", label: "관리자" },
] as const;

const ROLE_LABEL: Record<string, string> = { seeker: "구직자", clinic: "치과", lab: "기공소", admin: "관리자" };

const fmtDate = (s: string | null) =>
  s ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric" }).format(new Date(s)) : "-";

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const { role = "all", q = "" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data } = await supabase.rpc("admin_members");
  const all = (data || []) as Member[];

  const counts = all.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  const keyword = q.trim().toLowerCase();
  const members = all.filter((m) => {
    if (role !== "all" && m.role !== role) return false;
    if (!keyword) return true;
    return [m.name, m.phone, m.email, m.org_name].some((v) => v?.toLowerCase().includes(keyword));
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-9">
      <div className="mb-1.5 flex items-center justify-between border-b-2 border-ink pb-2.5">
        <h1 className="text-[21px] font-extrabold">회원 관리</h1>
        <Link href="/admin" className="text-[13px] font-bold text-teal">
          ← 관리자
        </Link>
      </div>
      <p className="mb-5 text-[12.5px] text-ink-soft">
        관리자만 볼 수 있는 화면입니다. 회원 실명·연락처가 그대로 보이니 화면 캡처나 외부 공유에 주의하세요.
      </p>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1.5">
          {ROLE_TABS.map((t) => {
            const n = t.key === "all" ? all.length : counts[t.key] || 0;
            const active = role === t.key;
            const href = `/admin/members?role=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
            return (
              <Link
                key={t.key}
                href={href}
                className={`rounded-sm border px-3 py-1.5 text-[13px] font-bold ${active ? "border-teal bg-teal text-white" : "border-line bg-white text-ink-soft hover:border-teal"}`}
              >
                {t.label} {n}
              </Link>
            );
          })}
        </nav>
        <form action="/admin/members" className="flex gap-1.5">
          <input type="hidden" name="role" value={role} />
          <input
            name="q"
            defaultValue={q}
            placeholder="이름·전화·이메일·업체명"
            className="w-56 rounded-sm border border-line px-2.5 py-1.5 text-[13px]"
          />
          <button className="rounded-sm bg-ink px-3 py-1.5 text-[13px] font-bold text-white">검색</button>
        </form>
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="rounded-sm border border-line bg-white p-3.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="rounded-sm bg-paper px-1.5 py-0.5 text-[11.5px] font-bold text-teal">{ROLE_LABEL[m.role] || m.role}</span>
              <span className="text-[15px] font-extrabold">{m.name || "(이름 없음)"}</span>
              {m.org_name && <span className="text-[13px] font-semibold">{m.org_name}</span>}
              <span className="ml-auto text-[12px] text-ink-soft">
                가입 {fmtDate(m.created_at)} · 최근 로그인 {fmtDate(m.last_sign_in_at)}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
              {m.phone ? (
                <a href={`tel:${m.phone}`} className="font-mono text-teal">
                  {m.phone}
                </a>
              ) : (
                <span className="text-ink-soft">전화번호 없음</span>
              )}
              {m.email && (
                <a href={`mailto:${m.email}`} className="text-teal">
                  {m.email}
                </a>
              )}
              {(m.role === "clinic" || m.role === "lab") && (
                <span className="text-ink-soft">
                  {m.org_region ? regionLabel(m.org_region) : ""} {m.org_address || ""} · 공고 {m.post_count}건
                </span>
              )}
              {m.role === "seeker" && <span className="text-ink-soft">지원 {m.application_count}건</span>}
            </div>

            {m.role === "seeker" &&
              (m.seeker_id ? (
                <details className="mt-2.5 rounded-sm border border-line bg-paper">
                  <summary className="cursor-pointer px-3 py-2 text-[13px] font-bold">
                    이력서 보기 — {m.desired_job || "희망직종 미입력"}
                    {m.lab_specialty ? `(${m.lab_specialty})` : ""} · 경력 {m.career_years ?? 0}년
                  </summary>
                  <dl className="grid grid-cols-[90px_1fr] gap-x-3 gap-y-1.5 px-3 pb-3 text-[13px]">
                    <dt className="font-semibold text-ink-soft">희망지역</dt>
                    <dd>{m.desired_region || "-"}</dd>
                    <dt className="font-semibold text-ink-soft">희망급여</dt>
                    <dd>{m.desired_pay_min ? `월 ${m.desired_pay_min}만원 이상` : "-"}</dd>
                    <dt className="font-semibold text-ink-soft">자격증</dt>
                    <dd>{m.certifications || "-"}</dd>
                    {m.portfolio_url && (
                      <>
                        <dt className="font-semibold text-ink-soft">포트폴리오</dt>
                        <dd>
                          <a href={m.portfolio_url} target="_blank" rel="noreferrer" className="text-teal underline">
                            포트폴리오 보기
                          </a>
                        </dd>
                      </>
                    )}
                    <dt className="font-semibold text-ink-soft">수정일</dt>
                    <dd>{fmtDate(m.resume_updated_at)}</dd>
                    {m.self_intro && (
                      <dd className="col-span-2 mt-1 whitespace-pre-line rounded-sm border border-line bg-white p-2.5 leading-relaxed">{m.self_intro}</dd>
                    )}
                  </dl>
                </details>
              ) : (
                <p className="mt-2 text-[12.5px] text-ink-soft">이력서를 아직 작성하지 않았습니다.</p>
              ))}
          </div>
        ))}
        {members.length === 0 && <p className="py-10 text-center text-ink-soft">조건에 맞는 회원이 없습니다.</p>}
      </div>
    </div>
  );
}
