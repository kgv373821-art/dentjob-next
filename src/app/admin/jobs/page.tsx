import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminPromotionToggle from "@/components/AdminPromotionToggle";
import LinkJobAccount from "@/components/LinkJobAccount";
import type { JobPost } from "@/lib/types";

export default async function AdminJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const [{ data: jobs }, { data: clinics }, { data: labs }] = await Promise.all([
    supabase
      .from("job_posts")
      .select("*, clinics(clinic_name), labs(lab_name)")
      .eq("status", "approved")
      .order("posted_at", { ascending: false })
      .limit(100),
    supabase.from("clinics").select("id, clinic_name, region_main").order("clinic_name"),
    supabase.from("labs").select("id, lab_name, region_main").order("lab_name"),
  ]);

  const accounts = [
    ...(clinics || []).map((c) => ({ id: c.id, role: "clinic" as const, name: c.clinic_name, region: c.region_main })),
    ...(labs || []).map((l) => ({ id: l.id, role: "lab" as const, name: l.lab_name, region: l.region_main })),
  ];

  const rows = (jobs || []).map((j) => ({
    ...j,
    org:
      (j as unknown as { org_name?: string }).org_name ||
      (j as unknown as { clinics?: { clinic_name: string } }).clinics?.clinic_name ||
      (j as unknown as { labs?: { lab_name: string } }).labs?.lab_name,
  })) as (JobPost & { org?: string })[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-9">
      <div className="mb-5 flex items-center justify-between border-b-2 border-ink pb-2.5">
        <div>
          <h1 className="text-[21px] font-extrabold">공고 노출 관리</h1>
          <p className="text-[12.5px] text-ink-soft">
            결제 없이(계좌이체 등 사이트 밖 입금 확인 후) 상단고정·프리미엄(메인노출)·긴급을 수동으로 켜고 끌 수 있습니다.
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="whitespace-nowrap rounded-sm bg-coral px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-coral-deep"
        >
          + 공고 대리 등록
        </Link>
      </div>

      <div className="space-y-2">
        {rows.map((job) => (
          <div key={job.id} className="rounded-sm border border-line bg-white p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/jobs/${job.id}`} target="_blank" className="font-semibold hover:text-teal hover:underline">
                  {job.title}
                </Link>
                <div className="text-[12px] text-ink-soft">
                  {job.org} · {job.region} · {job.job_type}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {!job.clinic_id && !job.lab_id && <LinkJobAccount jobId={job.id} accounts={accounts} />}
                <Link
                  href={`/admin/jobs/edit/${job.id}`}
                  className="rounded-full border border-line px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:border-teal hover:text-teal"
                >
                  수정
                </Link>
                <AdminPromotionToggle jobId={job.id} field="is_urgent" label="긴급" initialValue={!!job.is_urgent} />
                <AdminPromotionToggle jobId={job.id} field="is_pinned" label="상단고정" initialValue={!!job.is_pinned} />
                <AdminPromotionToggle jobId={job.id} field="is_main_exposed" label="프리미엄" initialValue={!!job.is_main_exposed} />
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="py-16 text-center text-ink-soft">게시 중인 공고가 없습니다.</p>}
      </div>
    </div>
  );
}
