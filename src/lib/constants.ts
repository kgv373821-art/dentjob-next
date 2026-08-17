import type { JobType, LabSpecialty, LabJobCategory } from "@/lib/types";

// 서울 25개 구 전체 + 경기 주요 도시
export const REGIONS = [
  // 서울
  "강남", "강동", "강북", "강서", "관악", "광진", "구로", "금천", "노원", "도봉",
  "동대문", "동작", "마포", "서대문", "서초", "성동", "성북", "송파", "양천", "영등포",
  "용산", "은평", "종로", "중구", "중랑",
  // 경기
  "의정부", "성남", "수원", "고양", "용인", "부천", "안양", "남양주", "김포",
];

export const JOB_TYPES: JobType[] = [
  "치과의사", "치과위생사", "치과조무사", "치과기공사", "상담실장", "데스크", "CAD/CAM", "기공소 직원",
];

// 치과기공 특화 필터 — 요청하신 8개 분야를 우선 노출
export const LAB_SPECIALTIES: LabSpecialty[] = [
  "CAD/CAM", "디자인", "지르코니아", "포세린", "덴처", "교정", "임플란트", "밀링센터", "외주 의뢰",
];

export const LAB_JOB_CATEGORIES: LabJobCategory[] = ["정직원", "아르바이트모집", "외주모집"];

// 승인된 공고의 기본 노출 기간(일) — 승인 시 이 기간만큼 뒤를 expires_at으로 설정
export const JOB_EXPIRY_DAYS = 30;

export const EMPLOYMENT_TYPES = ["정규직", "계약직", "파트타임", "주중알바", "주말알바", "인턴"];

// 치과기공사 계열(기공소 관련) 직종 — 구직자 희망직종이 이 중 하나일 때만 "기공 전문분야"를 노출
export const LAB_RELATED_JOB_TYPES = ["치과기공사", "CAD/CAM", "기공소 직원"];

// 업체당 동시에 보유할 수 있는 "긴급 채용" 공고 개수 상한 (승인대기+게시중 기준)
export const URGENT_LIMIT_CLINIC = 5;
export const URGENT_LIMIT_LAB = 2;
export const EDUCATION_LEVELS = ["학력무관", "고졸", "전문대졸업", "대졸", "대학원졸업"];

/** 이름을 "성 + OO"로 가려서 반환합니다 (구직자 목록 사생활 보호용). */
export function maskName(name: string): string {
  if (!name) return "구직자";
  return `${name[0]}OO`;
}

/** pay_min이 null이면(급여 협의) "급여 협의"를, 아니면 "월 000만원"을 반환합니다. */
export function formatPay(pay_min: number | null, suffix = ""): string {
  if (pay_min == null) return "급여 협의";
  return `월 ${pay_min}만원${suffix}`;
}

// 수익 모델 — 요청하신 5개 상품을 반드시 포함
// 가격은 업계 1위 덴탈잡(dentaljob.co.kr) 실제 요금(2026-08 기준)을 참고해, 개설 초기 신생 사이트로서
// 그보다 낮게 책정함 (덴탈잡: 강조상품 8,000~18,000원/주, 배너 135,000~950,000원/7일 등).
export const PRODUCT_LABELS: Record<string, { label: string; price: string; desc: string }> = {
  general_post: { label: "일반 채용", price: "무료", desc: "기본 채용공고 등록" },
  premium_post: { label: "프리미엄 공고", price: "15,000원", desc: "목록 상단 강조 노출 + 골드 뱃지" },
  pinned_post: { label: "상단 고정", price: "30,000원", desc: "목록 최상단 7일간 고정 노출" },
  urgent_post: { label: "긴급 채용", price: "10,000원", desc: "긴급 배지 + 알림 발송" },
  main_exposure: { label: "메인 노출", price: "100,000원", desc: "메인화면 인기공고 배치" },
  banner_ad: { label: "메인 배너 광고", price: "월 200,000원", desc: "메인 페이지 배너 슬롯" },
  company_page_ad: { label: "기업 페이지 광고", price: "월 100,000원", desc: "치과/기공소 소개 페이지 상단 강조" },
  talent_recommend: { label: "인재 추천", price: "월 300,000원", desc: "AI 기반 맞춤 인재 매칭" },
};
