import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExpiringJobRow from "@/components/ExpiringJobRow";
import { JOB_EXPIRY_DAYS } from "@/lib/constants";

const WITHIN_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

type Row = {
  id: string;
  title: string;
  org_name: string | null;
  expires_at: string | null;
  recruit_end_date: string | null;
  hr_contact_phone: string | null;
  contact_email: string | null;
  clinics?: { clinic_name: string; profiles?: { phone: string | null } | null } | null;
  labs?: { lab_name: string; profiles?: { phone: string | null } | null } | null;
};

/** 사이트가 공고를 숨기는 기준(등록 후 30일 / 업체가 정한 마감일 중 먼저 오는 쪽)으로 마감 시각을 구합니다. */
function deadlineOf(job: Row): Date | null {
  const candidates = [
    job.expires_at ? new Date(job.expires_at) : null,
    job.recruit_end_date ? new Date(`${job.recruit_end_date}T23:59:59+09:00`) : null,
  ].filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
  if (candidates.length === 0) return null;
  return new Date(Math.min(...candidates.map((d) => d.getTime())));
}

export default async function AdminExpiringJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data } = await supabase
    .from("job_posts")
    .select("id, title, org_name, expires_at, recruit_end_date, hr_contact_phone, contact_email, clinics(clinic_name, profiles(phone)), labs(lab_name, profiles(phone))")
    .eq("status", "approved")
    .limit(500);

  const now = new Date().getTime();
  const rows = ((data || []) as unknown as Row[])
    .map((job) => ({ job, deadline: deadlineOf(job) }))
    .filter((r): r is { job: Row; deadline: Date } => !!r.deadline && r.deadline.getTime() > now && r.deadline.getTime() <= now + WITHIN_DAYS * DAY_MS)
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  const fmt = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" });

  return (
    <div className="mx-auto max-w-4xl px-6 py-9">
      <div className="mb-1.5 flex items-center justify-between border-b-2 border-ink pb-2.5">
        <h1 className="text-[21px] font-extrabold">마감 임박 공고 ({WITHIN_DAYS}일 이내)</h1>
        <Link href="/admin/jobs" className="text-[13px] font-bold text-teal">
          ← 공고 노출 관리
        </Link>
      </div>
      <p className="mb-5 text-[12.5px] text-ink-soft">
        곧 노출이 끝나는 공고입니다. &quot;안내 문구 복사&quot;로 카카오톡·문자에 붙여 업체에 물어보고, 계속 채용한다고 하면 &quot;{JOB_EXPIRY_DAYS}일 연장&quot;을
        누르세요. 업체가 지정한 마감일이 더 빠르면 그 날짜에 내려가므로, 그때는 &quot;공고 노출 관리 → 수정&quot;에서 마감일도 바꿔야 합니다.
      </p>

      <div className="space-y-2">
        {rows.map(({ job, deadline }) => {
          const org = job.org_name || job.clinics?.clinic_name || job.labs?.lab_name || "업체";
          const label = fmt.format(deadline);
          const dDay = Math.floor((deadline.getTime() - now) / DAY_MS);
          const message = `안녕하세요, 덴트잡2804입니다.\n${org}에서 올려주신 「${job.title}」 공고가 ${label}에 마감될 예정입니다.\n계속 채용 중이시면 재등록(연장)해 드릴까요? 회신 주시면 바로 처리해 드리겠습니다.`;
          return (
            <ExpiringJobRow
              key={job.id}
              jobId={job.id}
              title={job.title}
              org={org}
              deadlineLabel={label}
              dDay={dDay}
              phone={job.hr_contact_phone || job.clinics?.profiles?.phone || job.labs?.profiles?.phone || null}
              email={job.contact_email}
              message={message}
            />
          );
        })}
        {rows.length === 0 && <p className="py-16 text-center text-ink-soft">{WITHIN_DAYS}일 안에 마감되는 공고가 없습니다.</p>}
      </div>
    </div>
  );
}
