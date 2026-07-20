import type { JobType, LabSpecialty, LabJobCategory } from "@/lib/types";

export const REGIONS = [
  "강남", "송파", "서초", "의정부", "성남", "수원", "고양", "용인", "부천", "안양", "남양주", "김포",
];

export const JOB_TYPES: JobType[] = [
  "치과의사", "치과위생사", "치과조무사", "치과기공사", "상담실장", "데스크", "CAD/CAM", "기공소 직원",
];

// 치과기공 특화 필터 — 요청하신 8개 분야를 우선 노출
export const LAB_SPECIALTIES: LabSpecialty[] = [
  "CAD/CAM", "지르코니아", "포세린", "덴처", "교정", "임플란트", "밀링센터", "외주 의뢰",
];

export const LAB_JOB_CATEGORIES: LabJobCategory[] = ["기사모집", "아르바이트모집", "외주모집"];

// 수익 모델 — 요청하신 5개 상품을 반드시 포함
export const PRODUCT_LABELS: Record<string, { label: string; price: string; desc: string }> = {
  general_post: { label: "일반 채용", price: "무료", desc: "기본 채용공고 등록" },
  premium_post: { label: "프리미엄 공고", price: "50,000원", desc: "목록 상단 강조 노출 + 골드 뱃지" },
  pinned_post: { label: "상단 고정", price: "70,000원", desc: "목록 최상단 7일간 고정 노출" },
  urgent_post: { label: "긴급 채용", price: "30,000원", desc: "긴급 배지 + 알림 발송" },
  main_exposure: { label: "메인 노출", price: "100,000원", desc: "메인화면 인기공고 배치" },
  banner_ad: { label: "메인 배너 광고", price: "월 300,000원", desc: "메인 페이지 배너 슬롯" },
  company_page_ad: { label: "기업 페이지 광고", price: "월 150,000원", desc: "치과/기공소 소개 페이지 상단 강조" },
  talent_recommend: { label: "인재 추천", price: "월 500,000원", desc: "AI 기반 맞춤 인재 매칭" },
};
