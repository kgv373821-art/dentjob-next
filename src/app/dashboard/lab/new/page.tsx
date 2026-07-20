import { createClient } from "@/lib/supabase/server";
import JobForm from "@/components/JobForm";

export default async function NewLabJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: lab } = user ? await supabase.from("labs").select("lab_name").eq("user_id", user.id).single() : { data: null };

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-5 border-b-2 border-gold pb-2.5 text-[21px] font-extrabold">기공소 채용 등록</h1>
      <JobForm role="lab" orgName={lab?.lab_name} />
    </div>
  );
}
