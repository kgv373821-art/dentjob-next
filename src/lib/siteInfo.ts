// 사이트 운영자 정보 — 약관·개인정보처리방침·푸터가 모두 이 값을 씁니다.
// 사업자등록을 마치면 여기만 채우면 푸터와 약관에 자동으로 표시됩니다. (비어 있는 항목은 화면에 나오지 않음)
export const SITE_INFO = {
  serviceName: "덴트잡2804",
  /** 상호 (사업자등록 후 입력) */
  companyName: "",
  /** 대표자 성명 */
  representative: "",
  /** 사업자등록번호 (예: 123-45-67890) */
  businessNumber: "",
  /** 통신판매업 신고번호 — 유료 상품 판매 시 필요 */
  mailOrderNumber: "",
  address: "",
  phone: "",
  email: "contact@dentjob2804.co.kr",
  /** 개인정보 보호책임자 성명 (비어 있으면 "운영 책임자"로 표시) */
  privacyOfficer: "",
  /** 약관·개인정보처리방침 시행일 */
  effectiveDate: "2026년 9월 29일",
};

// 유료 상품(요금 안내) 노출 여부 — 사업자등록 전까지는 요금표와 유료 상품 안내를 숨깁니다.
// true로 바꾸기 전에 약관의 환불 조항과 푸터 사업자정보(상호·대표자·사업자번호·통신판매업 번호)를 먼저 채울 것.
export const SHOW_PRICING = false;
