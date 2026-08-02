import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdForm from "@/components/AdForm";

export default async function NewAdPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">광고 등록</h1>
      <AdForm />
    </div>
  );
}
