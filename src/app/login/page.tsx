"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/actions/auth";

function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, { error: null });
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "1";

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-1 text-[22px] font-extrabold">로그인</h1>
      <p className="mb-6 text-[13px] text-ink-soft">Job2804 덴트잡 서울경기</p>

      {justRegistered && (
        <p className="mb-4 rounded-sm bg-teal-tint p-3 text-[13px] font-bold text-teal">
          회원가입이 완료되었습니다. 로그인해주세요.
        </p>
      )}

      <form action={formAction} className="space-y-3">
        <input name="email" type="email" required placeholder="이메일" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        <input
          name="password"
          type="password"
          required
          placeholder="비밀번호"
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        />
        {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-sm bg-teal py-3 text-[14.5px] font-bold text-white hover:bg-teal-deep disabled:opacity-60"
        >
          {pending ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-soft">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="font-bold text-teal">
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
