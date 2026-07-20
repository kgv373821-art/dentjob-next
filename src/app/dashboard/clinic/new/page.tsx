import { createClient } from "@/lib/supabase/server";
import JobForm from "@/components/JobForm";

export default async function NewClinicJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: clinic } = user ? await supabase.from("clinics").select("clinic_name").eq("user_id", user.id).single() : { data: null };

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">채용 등록</h1>
      <JobForm role="clinic" orgName={clinic?.clinic_name} />
    </div>
  );
}
