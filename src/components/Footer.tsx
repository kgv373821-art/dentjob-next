import Link from "next/link";
import { operatorInfoRows } from "@/components/OperatorInfo";
import { SHOW_PRICING, SITE_INFO } from "@/lib/siteInfo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line px-6 py-8 text-center text-[12.5px] text-ink-soft">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5 font-semibold">
        <Link href="/notices" className="hover:text-teal">
          공지사항
        </Link>
        <Link href="/terms" className="hover:text-teal">
          이용약관
        </Link>
        <Link href="/privacy" className="font-extrabold text-ink hover:text-teal">
          개인정보처리방침
        </Link>
        {SHOW_PRICING && (
          <Link href="/pricing" className="hover:text-teal">
            광고문의
          </Link>
        )}
        <a href={`mailto:${SITE_INFO.email}`} className="hover:text-teal">
          문의하기
        </a>
      </nav>
      <p className="mb-2 text-[11.5px] leading-relaxed">
        {operatorInfoRows()
          .filter((r) => r.label !== "서비스명")
          .map((r) => `${r.label}: ${r.value}`)
          .join(" | ")}
      </p>
      덴트잡2804 서울경기 (DentJob2804 Seoul&amp;Gyeonggi) — 서울·경기·인천 치과·치과기공사 전용 구인구직 플랫폼
    </footer>
  );
}
