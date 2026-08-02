import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdForm from "@/components/AdForm";
import type { Ad } from "@/lib/types";

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: ad } = await supabase.from("ads").select("*").eq("id", id).single();
  if (!ad) notFound();

  return (
    <div className="mx-auto max-w-lg px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">광고 수정</h1>
      <AdForm ad={ad as Ad} />
    </div>
  );
}
