import Link from "next/link";

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
        <Link href="/privacy" className="hover:text-teal">
          개인정보처리방침
        </Link>
        <Link href="/pricing" className="hover:text-teal">
          광고문의
        </Link>
      </nav>
      Job2804 덴트잡 서울경기 (DentJob Seoul&amp;Gyeonggi) — 서울·경기 치과·치과기공사 전용 구인구직 플랫폼
    </footer>
  );
}
