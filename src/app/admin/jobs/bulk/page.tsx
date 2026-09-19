import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BulkJobForm from "@/components/BulkJobForm";
import { BULK_COLUMNS, BULK_MAX_ROWS } from "@/lib/bulkJobs";
import { JOB_TYPES, EMPLOYMENT_TYPES } from "@/lib/constants";

export default async function AdminBulkJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-6 py-9">
      <div className="mb-1.5 flex items-center justify-between border-b-2 border-ink pb-2.5">
        <h1 className="text-[21px] font-extrabold">공고 엑셀 일괄 등록</h1>
        <Link href="/admin/jobs" className="text-[13px] font-bold text-teal">
          ← 공고 노출 관리
        </Link>
      </div>
      <p className="mb-5 text-[12.5px] text-ink-soft">
        여러 업체의 공고를 엑셀에 정리해 한 번에 올립니다. 업체명만 입력하는 대리등록 방식이라 계정 연결은 나중에 &quot;공고 노출 관리&quot;에서 할 수
        있습니다. 등록 즉시 게시됩니다.
      </p>

      <ol className="mb-5 list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed">
        <li>
          <a href="/bulk-jobs-template.csv" download className="font-bold text-teal underline">
            엑셀 양식 내려받기
          </a>{" "}
          → 엑셀로 열어서 아래 열 순서대로 채웁니다. (첫 줄 제목은 그대로 두어도 되고 지워도 됩니다)
        </li>
        <li>채운 칸들을 드래그해서 복사한 뒤 아래 칸에 붙여넣습니다.</li>
        <li>&quot;먼저 검사만 하기&quot;로 문제가 없는지 확인하고, 이상 없으면 &quot;등록하기&quot;를 누릅니다.</li>
      </ol>

      <div className="mb-5 rounded-sm border border-line bg-white p-3.5 text-[12.5px] leading-relaxed text-ink-soft">
        <p className="mb-1 font-bold text-ink">열 순서 ({BULK_MAX_ROWS}건까지 한 번에 가능)</p>
        <p>{BULK_COLUMNS.map((c, i) => `${i + 1}. ${c}`).join("  ·  ")}</p>
        <p className="mt-2">
          <b>필수</b>: 업체명, 직종, 지역 · <b>직종</b>: {JOB_TYPES.join(", ")} · <b>지역</b>: 강남, 금천, 수원 등 사이트의 지역 이름 그대로
        </p>
        <p className="mt-1">
          <b>구분</b>은 비우면 직종으로 자동 판단 · <b>제목</b>을 비우면 &quot;업체명 직종 모집합니다&quot;로 자동 생성 · <b>고용형태</b>는 비우면 정규직 (
          {EMPLOYMENT_TYPES.join(", ")})
        </p>
      </div>

      <BulkJobForm />
    </div>
  );
}
