"use client";

import { useActionState } from "react";
import { applyToJob } from "@/lib/actions/applications";

export default function ApplyForm({
  jobPostId,
  isLoggedIn,
  directContact,
}: {
  jobPostId: string;
  isLoggedIn: boolean;
  /** 업체 계정이 연결되지 않은 대리등록 공고면, 사이트 지원이 업체에 전달되지 않으므로 직접 연락처를 안내합니다. */
  directContact?: { phone: string | null; email: string | null } | null;
}) {
  const [state, formAction, pending] = useActionState(applyToJob.bind(null, jobPostId), { error: null });

  if (directContact) {
    return (
      <div className="rounded-sm border border-line bg-paper p-4 text-[13.5px] leading-relaxed">
        <p className="mb-2 font-bold">이 공고는 업체에 직접 지원해 주세요</p>
        <p className="mb-3 text-[12.5px] text-ink-soft">
          덴트잡2804가 업체를 대신해 소개하는 공고라, 사이트의 지원하기 버튼으로는 업체에 전달되지 않습니다. 아래 연락처로 직접 연락해 주세요.
        </p>
        <div className="flex flex-wrap gap-2">
          {directContact.phone && (
            <a href={`tel:${directContact.phone}`} className="rounded-sm bg-coral px-4 py-2.5 font-bold text-white hover:bg-coral-deep">
              전화하기 {directContact.phone}
            </a>
          )}
          {directContact.email && (
            <a href={`mailto:${directContact.email}`} className="rounded-sm border border-coral px-4 py-2.5 font-bold text-coral hover:bg-paper-dim">
              이메일 보내기
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <a href="/login" className="block w-full rounded-sm bg-coral py-3.5 text-center text-[15px] font-bold text-white hover:bg-coral-deep">
        로그인 후 지원하기
      </a>
    );
  }

  if (state.success) {
    return (
      <p className="rounded-sm border border-teal-tint bg-teal-tint p-3.5 text-center text-[14px] font-bold text-teal">
        지원이 접수되었습니다.
        <span className="mt-1 block text-[12px] font-semibold">
          잘못 누르셨다면{" "}
          <a href="/dashboard/seeker" className="underline">
            마이페이지 → 지원 현황
          </a>
          에서 &quot;지원 취소&quot;를 누르시면 됩니다.
        </span>
      </p>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // 버튼을 잘못 눌러 바로 지원되는 일이 없도록 한 번 더 확인
        if (!window.confirm("이 공고에 지원하시겠습니까?\n내 이력서가 업체에 전달됩니다.")) e.preventDefault();
      }}
      className="space-y-2.5"
    >
      <textarea
        name="message"
        placeholder="간단한 지원 메시지를 남겨보세요 (선택)"
        className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        rows={3}
      />
      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-coral py-3.5 text-[15px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {pending ? "지원 접수 중..." : "지원하기"}
      </button>
    </form>
  );
}
