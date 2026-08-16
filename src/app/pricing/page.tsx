import type { Metadata } from "next";
import { PRODUCT_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "요금 안내" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">요금 안내</h1>
      <table className="w-full border-collapse border border-line bg-white text-[13.5px]">
        <thead>
          <tr className="bg-ink text-white">
            <th className="p-3.5 text-left text-[12px]">상품</th>
            <th className="p-3.5 text-left text-[12px]">설명</th>
            <th className="p-3.5 text-left text-[12px]">가격</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(PRODUCT_LABELS).map(([code, { label, price, desc }]) => (
            <tr key={code} className="border-b border-line hover:bg-teal-tint">
              <td className="p-3.5 font-semibold">{label}</td>
              <td className="p-3.5 text-ink-soft">{desc}</td>
              <td className="p-3.5 font-mono font-bold text-teal whitespace-nowrap">{price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-[12.5px] text-ink-soft">
        AI 이력서 · AI 자기소개서 · AI 공고 작성은 전 회원 무료로 제공됩니다. 인재 추천 상품 결제 시 우선순위 매칭이 적용됩니다.
      </p>

      <div className="mt-8 rounded-sm border border-teal bg-teal-tint p-5 text-center">
        <h2 className="mb-1.5 text-[15px] font-extrabold text-teal">배너 광고 · 제휴 문의</h2>
        <p className="mb-3 text-[13px] text-ink-soft">메인 페이지 배너 광고, 기업 페이지 광고 등 문의는 아래 이메일로 연락해주세요.</p>
        <a href="mailto:t01028848755@gmail.com" className="inline-block rounded-sm bg-teal px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-teal-deep">
          t01028848755@gmail.com
        </a>
      </div>
    </div>
  );
}
