import type { Metadata } from "next";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-[13.5px] leading-relaxed text-ink">
      <h1 className="mb-2 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">개인정보처리방침</h1>
      <p className="mb-6 rounded-sm border border-dashed border-gold bg-teal-tint p-3 text-[12px] text-ink-soft">
        아래는 서비스 운영을 위한 표준 초안입니다. 실제 게시 전 개인정보보호책임자·수집항목·보관기간 등 실제 운영 값으로
        채우고 개인정보보호법에 따른 검토를 받으시기 바랍니다.
      </p>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">1. 수집하는 개인정보 항목</h2>
        <p>
          회원가입 시 이메일, 비밀번호, 이름, 휴대폰번호를 수집하며, 역할(치과/기공소/구직자)에 따라 병원명·기공소명·경력
          등 추가 프로필 정보를 수집합니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">2. 개인정보의 수집 및 이용 목적</h2>
        <p>회원 식별 및 서비스 제공, 채용공고 지원·매칭, 고객 문의 응대, 유료 서비스 결제 처리를 위해 이용합니다.</p>
      </section>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">3. 개인정보의 보유 및 이용 기간</h2>
        <p>회원 탈퇴 시 지체 없이 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
      </section>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">4. 개인정보의 제3자 제공</h2>
        <p>
          회원이 채용공고에 지원하는 경우 지원 정보가 해당 병원/기공소에 제공되며, 그 외에는 법령에 근거하지 않는 한
          제3자에게 제공하지 않습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="mb-1.5 text-[15px] font-bold">5. 이용자의 권리</h2>
        <p>회원은 언제든지 자신의 개인정보를 조회·수정하거나 가입 해지(동의 철회)를 요청할 수 있습니다.</p>
      </section>

      <section>
        <h2 className="mb-1.5 text-[15px] font-bold">6. 개인정보 보호책임자</h2>
        <p>개인정보 관련 문의는 하단 광고문의 채널을 통해 접수해주시기 바랍니다.</p>
      </section>
    </div>
  );
}
