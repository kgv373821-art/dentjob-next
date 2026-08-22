import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminJobForm from "@/components/AdminJobForm";

export default async function AdminNewJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const [{ data: clinics }, { data: labs }] = await Promise.all([
    supabase.from("clinics").select("id, clinic_name, region_main").order("clinic_name"),
    supabase.from("labs").select("id, lab_name, region_main").order("lab_name"),
  ]);

  const accounts = [
    ...(clinics || []).map((c) => ({ id: c.id, role: "clinic" as const, name: c.clinic_name, region: c.region_main })),
    ...(labs || []).map((l) => ({ id: l.id, role: "lab" as const, name: l.lab_name, region: l.region_main })),
  ];

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-1.5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">공고 대리 등록</h1>
      <p className="mb-5 text-[12.5px] text-ink-soft">
        전화 등으로 요청받은 공고를 관리자가 대신 등록합니다. 등록된 공고는 선택한 치과/기공소 계정 소유가 되어, 해당 업체가
        직접 로그인해도 대시보드에서 그대로 수정·마감할 수 있습니다.
      </p>
      <AdminJobForm accounts={accounts} />
    </div>
  );
}
