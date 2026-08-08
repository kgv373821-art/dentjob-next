export type UserRole = "clinic" | "lab" | "seeker" | "admin";

export type JobType =
  | "치과의사"
  | "치과위생사"
  | "치과조무사"
  | "치과기공사"
  | "상담실장"
  | "데스크"
  | "CAD/CAM"
  | "기공소 직원";

export const LAB_JOB_TYPES: JobType[] = ["치과기공사", "CAD/CAM", "기공소 직원"];

export type LabSpecialty =
  | "보철 기공"
  | "임플란트 기공"
  | "교정장치 기공"
  | "CAD/CAM 디자인"
  | "심미보철(지르코니아)"
  | "총의치 기공"
  | "CAD/CAM"
  | "지르코니아"
  | "포세린"
  | "덴처"
  | "교정"
  | "임플란트"
  | "밀링센터"
  | "외주 의뢰";

export type LabJobCategory = "기사모집" | "아르바이트모집" | "외주모집";

export type PostStatus = "draft" | "pending" | "approved" | "rejected" | "closed";

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "interview"
  | "passed"
  | "failed"
  | "withdrawn";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone: string | null;
  created_at: string;
}

export interface Clinic {
  id: string;
  user_id: string;
  clinic_name: string;
  region_main: string;
  address: string | null;
  intro: string | null;
  photo_url: string | null;
  lat: number | null;
  lng: number | null;
  is_page_ad?: boolean;
}

export interface Lab {
  id: string;
  user_id: string;
  lab_name: string;
  region_main: string;
  address: string | null;
  specialties: LabSpecialty[];
  has_cadcam: boolean;
  intro: string | null;
  photo_url: string | null;
  lat: number | null;
  lng: number | null;
  is_page_ad?: boolean;
}

export interface Seeker {
  id: string;
  user_id: string;
  desired_job: JobType | null;
  lab_specialty: LabSpecialty | null;
  career_years: number;
  desired_region: string | null;
  desired_pay_min: number | null;
  certifications: string | null;
  self_intro: string | null;
  portfolio_url: string | null;
  photo_url: string | null;
}

export interface JobPost {
  id: string;
  clinic_id: string | null;
  lab_id: string | null;
  job_type: JobType;
  lab_specialty: LabSpecialty | null;
  lab_category: LabJobCategory | null;
  title: string;
  region: string;
  pay_min: number | null;
  pay_note: string | null;
  work_hours: string | null;
  welfare: string[];
  description: string | null;
  status: PostStatus;
  is_urgent: boolean;
  is_main_exposed: boolean;
  is_pinned: boolean;
  view_count: number;
  posted_at: string | null;
  expires_at: string | null;
  created_at: string;
  image_urls: string[];
  // 상세 채용정보
  duties: string | null;
  employment_type: string | null;
  headcount: string | null;
  education_level: string | null;
  career_requirement: string | null;
  recruit_start_date: string | null;
  recruit_end_date: string | null;
  application_method: string | null;
  application_email: string | null;
  required_documents: string | null;
  work_address: string | null;
  nearby_station: string | null;
  homepage_url: string | null;
  hr_contact_name: string | null;
  hr_contact_phone: string | null;
  contact_email: string | null;
  // join된 표시용 필드
  clinic_name?: string;
  lab_name?: string;
}

export interface Application {
  id: string;
  job_post_id: string;
  seeker_id: string;
  status: ApplicationStatus;
  message: string | null;
  applied_at: string;
}

export type ProductCode =
  | "general_post"
  | "premium_post"
  | "main_exposure"
  | "urgent_post"
  | "pinned_post"
  | "banner_ad"
  | "company_page_ad"
  | "talent_recommend";

export type FavoriteTarget = "job_post" | "clinic" | "lab" | "seeker";

export interface ClinicReview {
  id: string;
  clinic_id: string;
  author_id: string;
  rating: number;
  content: string;
  created_at: string;
  author_name?: string;
}

export interface LabReview {
  id: string;
  lab_id: string;
  author_id: string;
  rating: number;
  content: string;
  created_at: string;
  author_name?: string;
}

export type BoardType = "free" | "question" | "job_review" | "clinic_review" | "lab_tips" | "used_equipment";

export const BOARD_LABELS: Record<BoardType, string> = {
  free: "자유게시판",
  question: "질문게시판",
  job_review: "구인 후기",
  clinic_review: "병원 후기",
  lab_tips: "기공 노하우",
  used_equipment: "중고장비",
};

export interface BoardPost {
  id: string;
  board: BoardType;
  author_id: string;
  title: string;
  content: string;
  price: number | null;
  view_count: number;
  created_at: string;
  author_name?: string;
}

export interface BoardComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

export type AdPosition = "main_top" | "main_mid" | "main_bottom" | "sidebar";
export type AdType = "image" | "youtube" | "game" | "blog";

export const AD_POSITION_LABELS: Record<AdPosition, string> = {
  main_top: "메인상단",
  main_mid: "메인중단",
  main_bottom: "메인하단",
  sidebar: "사이드바",
};

export const AD_TYPE_LABELS: Record<AdType, string> = {
  image: "이미지",
  youtube: "유튜브",
  game: "게임",
  blog: "블로그",
};

export interface Ad {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  link: string;
  position: AdPosition;
  type: AdType;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  active: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// Supabase 클라이언트 제네릭에 사용하는 최소 Database 타입.
// 실제 프로젝트에서는 `npx supabase gen types typescript`로 자동 생성해 교체하는 것을 권장합니다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
