import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatRoom from "@/components/ChatRoom";

export default async function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, applications(job_posts(title))")
    .eq("id", conversationId)
    .single();
  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const jobTitle = (conversation as unknown as { applications?: { job_posts?: { title: string } } }).applications?.job_posts?.title;

  return (
    <div className="mx-auto max-w-2xl px-6 py-9">
      <h1 className="mb-4 border-b-2 border-ink pb-2.5 text-[18px] font-extrabold">{jobTitle || "채팅"}</h1>
      <ChatRoom conversationId={conversationId} currentUserId={user.id} initialMessages={messages || []} />
    </div>
  );
}
