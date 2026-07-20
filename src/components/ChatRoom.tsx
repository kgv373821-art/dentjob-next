"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/lib/actions/chat";
import type { ChatMessage } from "@/lib/types";

export default function ChatRoom({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[70vh] flex-col rounded border border-line bg-white">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-sm px-3 py-2 text-[13.5px] ${
                  mine ? "bg-teal text-white" : "bg-paper-dim text-ink"
                }`}
              >
                {m.content}
                <div className={`mt-0.5 text-[10px] ${mine ? "text-white/70" : "text-ink-soft"}`}>
                  {new Date(m.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="py-10 text-center text-[13px] text-ink-soft">대화를 시작해보세요.</p>}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        action={async (formData) => {
          formRef.current?.reset();
          await sendMessage(conversationId, formData);
        }}
        className="flex gap-2 border-t border-line p-3"
      >
        <input
          name="content"
          required
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
          autoComplete="off"
        />
        <button type="submit" className="rounded-sm bg-coral px-4 py-2.5 text-[13px] font-bold text-white hover:bg-coral-deep">
          전송
        </button>
      </form>
    </div>
  );
}
