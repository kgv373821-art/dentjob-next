import type { Metadata } from "next";
import OperatorInfo from "@/components/OperatorInfo";
import { SITE_INFO } from "@/lib/siteInfo";

export const metadata: Metadata = { title: "개인정보처리방침", alternates: { canonical: "/privacy" } };

const OVERSEAS = [
  {
    to: "Supabase Inc. (미국)",
    purpose: "회원 데이터베이스·파일(사진) 저장, 로그인 인증",
    items: "회원가입·이력서·채용공고·지원 정보 등 서비스에 저장되는 모든 정보",
    where: "대한민국 서울(AWS 서울 리전)에 저장되며, 운영사는 미국 법인입니다",
    period: "회원 탈퇴 또는 위탁 계약 종료 시까지",
  },
  {
    to: "Vercel Inc. (미국)",
    purpose: "웹사이트 호스팅 및 전송(CDN)",
    items: "접속 IP, 접속 일시, 브라우저 정보 등 접속 기록과 서비스 이용 중 전송되는 정보",
    where: "미국 등 Vercel이 운영하는 국가의 서버",
    period: "Vercel 정책에 따른 로그 보관 기간",
  },
  {
    to: "Anthropic, PBC (미국)",
    purpose: "AI 이력서·자기소개서·채용공고 작성 도우미 (이용자가 해당 기능을 사용할 때만)",
    items: "AI 도우미에 이용자가 직접 입력한 내용",
    where: "미국",
    period: "처리 후 Anthropic 정책에 따른 기간(모델 학습에 사용되지 않음)",
  },
];

export default function PrivacyPage() {
  const officer = SITE_INFO.privacyOfficer || "운영 책임자";
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-[13.5px] leading-relaxed text-ink">
      <h1 className="mb-1 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">개인정보처리방침</h1>
      <p className="mb-6 text-[12px] text-ink-soft">시행일: {SITE_INFO.effectiveDate}</p>

      <p className="mb-5">
        {SITE_INFO.serviceName}(이하 &quot;운영자&quot;)는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 고충을 신속하게
        처리하기 위해 다음과 같이 개인정보처리방침을 둡니다.
      </p>

      <Section title="1. 수집하는 개인정보 항목">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b>회원가입(필수)</b>: 이메일, 비밀번호, 이름(업체 회원은 담당자명), 회원 유형 / 치과·기공소 회원은 업체명, 지역
          </li>
          <li>
            <b>회원가입(선택)</b>: 휴대폰 번호, 희망 직종·지역·기공 전문분야(구직자), 전문분야·CAD/CAM 장비 보유 여부(기공소)
          </li>
          <li>
            <b>이력서 작성 시(선택)</b>: 경력 연수, 자격증, 자기소개, 희망 급여, 포트폴리오 주소, 사진
          </li>
          <li>
            <b>채용공고 등록 시</b>: 업체 주소, 연락처, 근무조건, 업체 사진
          </li>
          <li>
            <b>자동 수집</b>: 접속 IP, 접속 일시, 브라우저 정보, 로그인 유지를 위한 쿠키
          </li>
        </ul>
      </Section>

      <Section title="2. 개인정보의 수집·이용 목적">
        <p>회원 식별 및 가입 관리, 채용공고 게재·검색·지원 등 구인구직 서비스 제공, 맞춤 공고 추천, 문의 응대, 부정 이용 방지, 서비스 개선을 위해 이용합니다.</p>
      </Section>

      <Section title="3. 보유 및 이용 기간">
        <p className="mb-1.5">회원 탈퇴 시 지체 없이 파기합니다. 다만 관계 법령에 따라 보존해야 하는 경우 해당 기간 동안 보관합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>접속 기록: 3개월 (통신비밀보호법)</li>
          <li>유료 서비스 도입 시 계약·청약철회 및 대금 결제 기록 5년, 소비자 불만·분쟁 처리 기록 3년 (전자상거래법)</li>
        </ul>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <ul className="list-disc space-y-1 pl-5">
          <li>구직자가 채용공고에 지원하면 이름·연락처·이력서 내용이 해당 치과·기공소에 제공됩니다(채용 절차 진행 목적, 채용 절차 종료 시까지).</li>
          <li>구직자가 등록한 이력서는 로그인한 치과·기공소 회원이 열람할 수 있으며, 이때 이름은 가려서(성+OO) 표시됩니다.</li>
          <li>그 밖에는 이용자의 동의가 있거나 법령에 근거한 경우를 제외하고 제3자에게 제공하지 않습니다.</li>
        </ul>
      </Section>

      <Section title="5. 개인정보 처리 위탁 및 국외 이전">
        <p className="mb-2">
          운영자는 서비스 제공을 위해 아래 해외 업체에 개인정보 처리를 위탁하고 있으며, 이 과정에서 개인정보가 국외로 이전되거나 국외
          업체가 접근할 수 있습니다. 이전은 서비스 이용 시 네트워크를 통해 수시로 이루어집니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse border border-line text-[12.5px]">
            <thead>
              <tr className="bg-paper-dim text-left">
                <th className="border border-line p-2">이전받는 자</th>
                <th className="border border-line p-2">목적</th>
                <th className="border border-line p-2">항목</th>
                <th className="border border-line p-2">저장 위치</th>
                <th className="border border-line p-2">보유 기간</th>
              </tr>
            </thead>
            <tbody>
              {OVERSEAS.map((o) => (
                <tr key={o.to} className="align-top">
                  <td className="border border-line p-2 font-semibold">{o.to}</td>
                  <td className="border border-line p-2">{o.purpose}</td>
                  <td className="border border-line p-2">{o.items}</td>
                  <td className="border border-line p-2">{o.where}</td>
                  <td className="border border-line p-2">{o.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2">
          국외 이전을 원하지 않으시면 회원 탈퇴를 요청하실 수 있습니다. 다만 Supabase·Vercel은 서비스 운영에 꼭 필요하므로 이전을
          거부하시면 서비스를 이용하실 수 없습니다. AI 도우미는 사용하지 않으면 정보가 전송되지 않습니다.
        </p>
      </Section>

      <Section title="6. 개인정보의 파기">
        <p>보유 기간이 끝나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자 파일은 복구할 수 없는 방법으로 삭제합니다.</p>
      </Section>

      <Section title="7. 이용자의 권리와 행사 방법">
        <p>
          이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며, 삭제·처리정지·회원 탈퇴(동의 철회)를 이메일({SITE_INFO.email})로
          요청할 수 있습니다. 운영자는 본인 확인 후 지체 없이 조치합니다.
        </p>
      </Section>

      <Section title="8. 개인정보의 안전성 확보 조치">
        <p>비밀번호 암호화 저장, 전 구간 HTTPS 암호화 통신, 데이터베이스 접근 권한 제한(본인·권한 있는 회원만 조회), 관리자 계정 최소화 등의 조치를 하고 있습니다.</p>
      </Section>

      <Section title="9. 쿠키의 사용">
        <p>
          로그인 상태 유지를 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나 이 경우 로그인이 필요한 서비스를 이용할
          수 없습니다. &quot;최근 본 공고&quot; 목록은 이용자 기기의 브라우저에만 저장됩니다.
        </p>
      </Section>

      <Section title="10. 만 14세 미만 아동">
        <p>서비스는 만 14세 이상만 가입할 수 있으며, 만 14세 미만 아동의 개인정보는 수집하지 않습니다.</p>
      </Section>

      <Section title="11. 개인정보 보호책임자">
        <ul className="list-disc space-y-1 pl-5">
          <li>개인정보 보호책임자: {officer}</li>
          <li>
            연락처: <a href={`mailto:${SITE_INFO.email}`} className="text-teal hover:underline">{SITE_INFO.email}</a>
          </li>
        </ul>
        <p className="mt-2">
          개인정보 침해에 대한 신고·상담은 개인정보분쟁조정위원회(1833-6972), 개인정보침해신고센터(118), 대검찰청(1301), 경찰청(182)에도
          하실 수 있습니다.
        </p>
      </Section>

      <Section title="12. 운영자 정보">
        <OperatorInfo />
      </Section>

      <Section title="부칙">
        <p>이 개인정보처리방침은 {SITE_INFO.effectiveDate}부터 시행합니다.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="mb-1.5 text-[15px] font-bold">{title}</h2>
      {children}
    </section>
  );
}
