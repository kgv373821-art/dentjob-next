export type SeoLandingPage = {
  slug: string;
  title: string;
  description: string;
  regions: string[];
  jobTypes: string[];
  intro: string;
};

const SEOUL_REGIONS = [
  "강남", "강동", "강북", "강서", "관악", "광진", "구로", "금천", "노원", "도봉",
  "동대문", "동작", "마포", "서대문", "서초", "성동", "성북", "송파", "양천", "영등포",
  "용산", "은평", "종로", "중구", "중랑",
];

const GYEONGGI_REGIONS = ["의정부", "성남", "수원", "고양", "용인", "부천", "안양", "남양주", "김포"];
const LAB_JOB_TYPES = ["치과기공사", "CAD/CAM", "기공소 직원"];

export const seoLandingPages: SeoLandingPage[] = [
  {
    slug: "seoul-dental-technician-jobs",
    title: "서울 치과기공사 구인·구직",
    description: "서울 지역 치과기공사와 기공소 직원 채용공고를 확인하세요. 근무 지역, 급여, 전문분야별로 비교하고 바로 지원할 수 있습니다.",
    regions: SEOUL_REGIONS,
    jobTypes: LAB_JOB_TYPES,
    intro: "서울 지역 기공소와 치과 내 기공실의 최신 채용공고입니다.",
  },
  {
    slug: "gyeonggi-dental-technician-jobs",
    title: "경기 치과기공사 구인·구직",
    description: "경기 지역 치과기공사와 기공소 직원 채용공고를 확인하세요. 전문분야와 근무조건을 비교해 맞는 일자리를 찾아보세요.",
    regions: GYEONGGI_REGIONS,
    jobTypes: LAB_JOB_TYPES,
    intro: "경기 지역 기공소와 치과 내 기공실의 최신 채용공고입니다.",
  },
  {
    slug: "seoul-cad-cam-jobs",
    title: "서울 CAD/CAM 기공사 채용",
    description: "서울 CAD/CAM 디자인, 밀링센터, 치과기공사 채용공고를 모았습니다. 경력과 근무조건에 맞는 공고를 확인하세요.",
    regions: SEOUL_REGIONS,
    jobTypes: ["CAD/CAM"],
    intro: "서울 지역 CAD/CAM 디자인 및 밀링 관련 최신 채용공고입니다.",
  },
  {
    slug: "gyeonggi-cad-cam-jobs",
    title: "경기 CAD/CAM 기공사 채용",
    description: "경기 CAD/CAM 기공사와 디자인 직원 채용공고를 확인하세요. 지역과 근무형태에 따라 빠르게 비교할 수 있습니다.",
    regions: GYEONGGI_REGIONS,
    jobTypes: ["CAD/CAM"],
    intro: "경기 지역 CAD/CAM 디자인 및 밀링 관련 최신 채용공고입니다.",
  },
  {
    slug: "seoul-dental-lab-jobs",
    title: "서울 기공소 직원 채용",
    description: "서울 기공소 직원, 보철·지르코니아·덴처 분야 치과기공사 채용공고를 확인하고 바로 지원하세요.",
    regions: SEOUL_REGIONS,
    jobTypes: ["기공소 직원", "치과기공사"],
    intro: "서울 기공소의 보철, 지르코니아, 덴처 등 전문분야 채용공고입니다.",
  },
  {
    slug: "gyeonggi-dental-lab-jobs",
    title: "경기 기공소 직원 채용",
    description: "경기 기공소 직원과 치과기공사 채용공고를 모았습니다. 공고별 전문분야와 급여 조건을 비교해 보세요.",
    regions: GYEONGGI_REGIONS,
    jobTypes: ["기공소 직원", "치과기공사"],
    intro: "경기 기공소의 최신 직원 및 치과기공사 채용공고입니다.",
  },
  {
    slug: "seoul-dental-hygienist-jobs",
    title: "서울 치과위생사 채용",
    description: "서울 치과위생사 채용공고를 지역과 근무형태별로 확인하세요. 치과의원과 병원의 최신 공고를 한곳에서 비교할 수 있습니다.",
    regions: SEOUL_REGIONS,
    jobTypes: ["치과위생사"],
    intro: "서울 치과의원과 병원의 최신 치과위생사 채용공고입니다.",
  },
  {
    slug: "gyeonggi-dental-hygienist-jobs",
    title: "경기 치과위생사 채용",
    description: "경기 치과위생사 채용공고를 지역과 근무형태별로 확인하세요. 조건에 맞는 치과 일자리를 빠르게 찾아볼 수 있습니다.",
    regions: GYEONGGI_REGIONS,
    jobTypes: ["치과위생사"],
    intro: "경기 치과의원과 병원의 최신 치과위생사 채용공고입니다.",
  },
];

export function getSeoLandingPage(slug: string) {
  return seoLandingPages.find((page) => page.slug === slug);
}
