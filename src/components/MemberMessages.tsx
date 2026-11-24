import { createClient } from "@/lib/supabase/server";
import { markMemberMessagesRead } from "@/lib/actions/messages";

type Msg = { id: string; body: string; created_at: string; read_at: string | null };

const fmt = (s: string) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

/** 마이페이지 맨 위 "덴트잡2804 운영자 메시지". 메시지가 없으면 아무것도 표시하지 않습니다. */
export default async function MemberMessages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("member_messages")
    .select("id, body, created_at, read_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const msgs = (data || []) as Msg[];
  if (msgs.length === 0) return null;
  const unread = msgs.filter((m) => !m.read_at).length;

  return (
    <section className={`mb-6 rounded border p-4 ${unread ? "border-coral bg-[#FFF6F3]" : "border-line bg-white"}`}>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-[15px] font-extrabold">덴트잡2804 운영자 메시지</h2>
        {unread > 0 && <span className="rounded-full bg-coral px-2 py-0.5 text-[11px] font-bold text-white">새 메시지 {unread}</span>}
        {unread > 0 && (
          <form action={markMemberMessagesRead} className="ml-auto">
            <button className="rounded-sm border border-line bg-white px-2.5 py-1 text-[12px] font-bold text-ink-soft hover:bg-paper-dim">확인했어요</button>
          </form>
        )}
      </div>
      <div className="space-y-2.5">
        {msgs.map((m) => (
          <div key={m.id} className="rounded-sm bg-white p-3 text-[13.5px] leading-relaxed">
            <div className="mb-1 text-[11.5px] text-ink-soft">{fmt(m.created_at)}</div>
            <p className="whitespace-pre-line">{m.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
