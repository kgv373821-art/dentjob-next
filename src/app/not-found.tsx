import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="mb-2 font-mono text-[13px] text-ink-soft">404</p>
      <h1 className="mb-3 text-[20px] font-extrabold">페이지를 찾을 수 없습니다</h1>
      <p className="mb-6 text-[13.5px] text-ink-soft">요청하신 페이지가 삭제되었거나 주소가 변경되었습니다.</p>
      <Link href="/" className="rounded-sm bg-teal px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-teal-deep">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
