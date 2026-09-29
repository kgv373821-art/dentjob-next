"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { REGIONS, JOB_TYPES, LAB_SPECIALTIES, regionLabel } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

const ROLE_TABS: { value: UserRole; label: string }[] = [
  { value: "seeker", label: "구직자" },
  { value: "clinic", label: "치과" },
  { value: "lab", label: "기공소" },
];

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, { error: null });
  const [role, setRole] = useState<UserRole>("seeker");
  const [agree, setAgree] = useState({ age: false, terms: false, privacy: false });
  const allAgreed = agree.age && agree.terms && agree.privacy;

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
                  {regionLabel(r)}
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
                  {regionLabel(r)}
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
                  {regionLabel(r)}
                </option>
              ))}
            </select>
          </>
        )}

        <div className="space-y-2 rounded-sm border border-line bg-white p-3.5 text-[13px]">
          <label className="flex items-center gap-2 border-b border-line pb-2.5 font-bold">
            <input type="checkbox" checked={allAgreed} onChange={(e) => setAgree({ age: e.target.checked, terms: e.target.checked, privacy: e.target.checked })} />
            전체 동의
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="agree_age" checked={agree.age} onChange={(e) => setAgree({ ...agree, age: e.target.checked })} />
            <span><span className="font-bold text-coral">[필수]</span> 만 14세 이상입니다</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="agree_terms" checked={agree.terms} onChange={(e) => setAgree({ ...agree, terms: e.target.checked })} />
            <span className="flex-1"><span className="font-bold text-coral">[필수]</span> 이용약관 동의</span>
            <Link href="/terms" target="_blank" className="text-[12px] text-ink-soft underline">보기</Link>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="agree_privacy" checked={agree.privacy} onChange={(e) => setAgree({ ...agree, privacy: e.target.checked })} />
            <span className="flex-1"><span className="font-bold text-coral">[필수]</span> 개인정보 수집·이용 동의</span>
            <Link href="/privacy" target="_blank" className="text-[12px] text-ink-soft underline">보기</Link>
          </label>
          <details className="rounded-sm bg-paper-dim px-3 py-2 text-[11.5px] leading-relaxed text-ink-soft">
            <summary className="cursor-pointer font-semibold">수집·이용 내용 요약</summary>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
              <li>항목: 이메일, 비밀번호, 이름(담당자명), 회원 유형, 업체명·지역(업체 회원) / 선택: 휴대폰 번호, 희망 직종·지역</li>
              <li>목적: 회원 관리, 채용공고 게재·지원 등 구인구직 서비스 제공, 문의 응대</li>
              <li>보유 기간: 회원 탈퇴 시까지 (법령상 보존 의무가 있는 정보는 해당 기간)</li>
              <li>서비스 운영을 위해 Supabase·Vercel(미국 업체)에 처리를 위탁하며, 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.</li>
              <li>동의를 거부할 수 있으나, 거부 시 회원가입이 제한됩니다.</li>
            </ul>
          </details>
        </div>

        {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
        <button
          type="submit"
          disabled={pending || !allAgreed}
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
