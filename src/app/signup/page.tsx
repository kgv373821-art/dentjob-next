"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { REGIONS, JOB_TYPES, LAB_SPECIALTIES } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

const ROLE_TABS: { value: UserRole; label: string }[] = [
  { value: "seeker", label: "구직자" },
  { value: "clinic", label: "치과" },
  { value: "lab", label: "기공소" },
];

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, { error: null });
  const [role, setRole] = useState<UserRole>("seeker");

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-1 text-[22px] font-extrabold">회원가입</h1>
      <p className="mb-6 text-[13px] text-ink-soft">회원 유형을 선택해주세요.</p>

      <div className="mb-5 flex gap-1.5">
        {ROLE_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setRole(t.value)}
            className={`flex-1 rounded-sm py-2.5 text-[13.5px] font-bold ${
              role === t.value ? "bg-teal text-white" : "border border-line text-ink-soft hover:bg-teal-tint"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="role" value={role} />

        <input name="name" required placeholder={role === "seeker" ? "이름" : "담당자명"} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        <input name="email" type="email" required placeholder="이메일" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        <input name="password" type="password" required placeholder="비밀번호 (8자 이상)" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        <input name="phone" placeholder="휴대폰 번호" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />

        {role === "clinic" && (
          <>
            <input name="clinic_name" required placeholder="치과 이름" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
            <select name="region_main" required defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
              <option value="" disabled>
                지역 선택
              </option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </>
        )}

        {role === "lab" && (
          <>
            <input name="lab_name" required placeholder="기공소 이름" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
            <select name="region_main" required defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
              <option value="" disabled>
                지역 선택
              </option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div>
              <p className="mb-1.5 text-[12px] font-bold text-ink-soft">전문분야 (복수 선택)</p>
              <div className="flex flex-wrap gap-2">
                {LAB_SPECIALTIES.map((s) => (
                  <label key={s} className="flex items-center gap-1.5 rounded-sm border border-line px-2.5 py-1.5 text-[12px]">
                    <input type="checkbox" name="specialties" value={s} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" name="has_cadcam" /> CAD/CAM 장비 보유
            </label>
          </>
        )}

        {role === "seeker" && (
          <>
            <select name="desired_job" defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
              <option value="">희망 직종 (선택)</option>
              {JOB_TYPES.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <select name="lab_specialty" defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
              <option value="">기공 전문분야 (치과기공사/CAD·CAM 지원 시 선택)</option>
              {LAB_SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select name="desired_region" defaultValue="" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
              <option value="">희망 지역 (선택)</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </>
        )}

        {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-sm bg-coral py-3 text-[14.5px] font-bold text-white hover:bg-coral-deep disabled:opacity-60"
        >
          {pending ? "가입 처리 중..." : "회원가입"}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-soft">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-bold text-teal">
          로그인
        </Link>
      </p>
    </div>
  );
}
