"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/actions/auth";

function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, { error: null });
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "1";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-1 text-[22px] font-extrabold">로그인</h1>
      <p className="mb-6 text-[13px] text-ink-soft">덴트잡2804 서울경기</p>

      {justRegistered && (
        <p className="mb-4 rounded-sm bg-teal-tint p-3 text-[13px] font-bold text-teal">
          회원가입이 완료되었습니다. 로그인해주세요.
        </p>
      )}

      <form action={formAction} className="space-y-3">
        <input name="email" type="email" required placeholder="이메일" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="비밀번호"
            className="w-full rounded-sm border border-line px-3 py-2.5 pr-10 text-[13.5px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
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
