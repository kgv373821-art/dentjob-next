import type { Metadata } from "next";

export const metadata: Metadata = { title: "이용약관" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-[13.5px] leading-relaxed text-ink">
      <h1 className="mb-2 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">이용약관</h1>
      <p className="mb-6 rounded-sm border border-dashed border-gold bg-teal-tint p-3 text-[12px] text-ink-soft">
        아래는 서비스 운영을 위한 표준 초안입니다. 실제 게시 전 사업자 정보(상호·대표자·사업자등록번호·주소·연락처)를 채우고
        변호사 등 전문가 검토를 받으시기 바랍니다.
      </p>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">제1조 (목적)</h2>
        <p>
          이 약관은 Job2804 덴트잡 서울경기(이하 &quot;회사&quot;)가 제공하는 치과·치과기공사 구인구직 서비스(이하
          &quot;서비스&quot;)의 이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">제2조 (회원가입 및 이용계약)</h2>
        <p>
          회원가입은 이용자가 약관 내용에 동의하고 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이용신청을 하고,
          회사가 이를 승낙함으로써 체결됩니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">제3조 (서비스의 제공 및 변경)</h2>
        <p>
          회사는 채용정보 게재, 지원, 커뮤니티, 유료 광고 상품 등 서비스를 제공하며, 운영상·기술상 필요에 따라 제공하는
          서비스의 내용을 변경할 수 있습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">제4조 (회원의 의무)</h2>
        <p>
          회원은 허위 채용정보 또는 허위 구직정보를 등록해서는 안 되며, 관계 법령과 이 약관의 규정을 준수하여야 합니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">제5조 (유료서비스 및 환불)</h2>
        <p>
          프리미엄 공고, 상단 고정, 긴급 채용 등 유료 상품의 가격·환불 정책은 요금 안내 페이지 및 결제 시 별도
          고지사항에 따릅니다.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 text-[15px] font-bold">제6조 (문의처)</h2>
        <p>서비스 이용 관련 문의는 하단 광고문의 채널을 통해 접수해주시기 바랍니다.</p>
      </section>
    </div>
  );
}
