import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PendingJobRow from "@/components/PendingJobRow";
import type { JobPost } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const [{ data: pending }, { data: memberRows }, { data: labStats }] = await Promise.all([
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("role"),
    supabase.rpc("lab_job_stats").single(),
  ]);

  const memberCounts = (memberRows || []).reduce<Record<string, number>>((acc, r) => {
    acc[r.role] = (acc[r.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-6 py-9">
      <div className="mb-5 flex items-center justify-between border-b-2 border-ink pb-2.5">
        <h1 className="text-[21px] font-extrabold">관리자</h1>
        <nav className="flex gap-4 text-[13px] font-bold text-teal">
          <Link href="/admin/reports">신고 관리</Link>
          <Link href="/admin/notices">공지사항</Link>
          <Link href="/admin/sms">문자 발송</Link>
          <Link href="/admin/ads">광고관리</Link>
          <Link href="/admin/community">커뮤니티관리</Link>
        </nav>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi n={memberCounts.clinic || 0} l="치과 회원" />
        <Kpi n={memberCounts.lab || 0} l="기공소 회원" />
        <Kpi n={memberCounts.seeker || 0} l="구직자 회원" />
        <Kpi n={(labStats as unknown as { lab_posts: number })?.lab_posts ?? 0} l="기공소 공고" gold />
        <Kpi n={(labStats as unknown as { clinic_posts: number })?.clinic_posts ?? 0} l="치과 공고" />
      </div>

      <h2 className="mb-3 text-[15px] font-bold">채용공고 승인 대기</h2>
      <div className="space-y-2">
        {(pending || []).map((job) => {
          const org =
            (job as unknown as { clinics?: { clinic_name: string } }).clinics?.clinic_name ||
            (job as unknown as { labs?: { lab_name: string } }).labs?.lab_name;
          return <PendingJobRow key={job.id} job={job as JobPost} org={org} />;
        })}
        {(!pending || pending.length === 0) && <p className="py-10 text-center text-ink-soft">승인 대기 중인 공고가 없습니다.</p>}
      </div>
    </div>
  );
}

function Kpi({ n, l, gold }: { n: number; l: string; gold?: boolean }) {
  return (
    <div className="rounded-sm border border-line bg-white p-3.5">
      <div className={`font-mono text-[22px] font-bold ${gold ? "text-gold" : "text-teal"}`}>{n}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-soft">{l}</div>
    </div>
  );
}
