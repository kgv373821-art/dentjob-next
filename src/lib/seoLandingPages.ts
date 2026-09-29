export type SeoLandingPage = {
  slug: string;
  title: string;
  description: string;
  regions: string[];
  jobTypes: string[];
  intro: string;
  /** 본문 섹션 — 지역 특징 / 직종별 급여·근무조건 */
  sections: { heading: string; body: string }[];
  /** 지원 전 체크포인트 */
  checklist: string[];
  areaLabel: string;
  kindLabel: string;
};

const SEOUL_REGIONS = [
  "강남", "강동", "강북", "강서", "관악", "광진", "구로", "금천", "노원", "도봉",
  "동대문", "동작", "마포", "서대문", "서초", "성동", "성북", "송파", "양천", "영등포",
  "용산", "은평", "종로", "중구", "중랑",
];
const GYEONGGI_REGIONS = ["의정부", "성남", "수원", "고양", "용인", "부천", "안양", "남양주", "김포"];
const INCHEON_REGIONS = ["인천중구", "동구", "미추홀", "연수", "남동", "부평", "계양", "서구", "강화", "옹진"];
const LAB_JOB_TYPES = ["치과기공사", "CAD/CAM", "기공소 직원"];

type AreaKey = "seoul" | "gyeonggi" | "incheon" | "suwon" | "seongnam" | "bucheon" | "goyang";
type KindKey = "dental-technician" | "cad-cam" | "dental-lab" | "dental-hygienist";

const AREAS: Record<AreaKey, { label: string; regions: string[]; overview: string; pay: string }> = {
  seoul: {
    label: "서울",
    regions: SEOUL_REGIONS,
    overview:
      "서울은 전국에서 치과의원이 가장 많이 모여 있는 지역입니다. 강남·서초·송파 일대에는 임플란트·교정·심미 진료를 하는 중대형 치과가 많고, 마포·영등포·광진·노원 등 주거 밀집 지역에는 동네 단골 환자 위주의 치과가 고르게 분포합니다. 치과기공소는 금천구 가산동, 구로구 디지털단지, 성동구 성수동처럼 지식산업센터가 많은 곳에 모여 있는 편이라, 기공 분야 구직자는 이 권역 공고를 함께 살펴보면 선택지가 넓어집니다. 지하철 노선이 촘촘해 거주지와 다른 구로 출퇴근하는 경우도 흔합니다.",
    pay:
      "서울은 임대료와 인건비 수준이 높아 같은 연차라도 경기·인천보다 제시 급여가 다소 높게 형성되는 경우가 많습니다. 다만 강남권 대형 치과는 인센티브·야간진료 수당 비중이 크고, 주거지역 치과는 근무시간이 안정적인 대신 기본급 위주인 경우가 많아 총액만이 아니라 급여 구성까지 비교하는 것이 좋습니다.",
  },
  gyeonggi: {
    label: "경기",
    regions: GYEONGGI_REGIONS,
    overview:
      "경기도는 수원·성남·고양·용인·부천 같은 대도시와 함께 화성 동탄, 하남 미사, 김포 한강, 남양주 다산 등 신도시에서 신규 개원이 꾸준히 이어지는 지역입니다. 새로 문을 여는 치과는 개원 멤버를 한 번에 여러 명 뽑는 경우가 많아 경력직뿐 아니라 신입에게도 기회가 열려 있습니다. 치과와 기공소가 도시별로 분산되어 있어 거주지 가까운 일자리를 찾기 쉽고, 서울 출퇴근 부담을 줄이려는 구직자에게도 좋은 선택지가 됩니다.",
    pay:
      "경기 지역 급여는 서울과 비슷하거나 소폭 낮은 수준에서 형성되는 경우가 많지만, 출퇴근 시간이 줄어드는 만큼 실질적인 조건은 오히려 나을 수 있습니다. 신도시 치과는 인력 확보를 위해 개원 멤버 인센티브나 교통·주거 관련 지원을 제시하기도 하므로 공고의 복리후생 항목을 꼼꼼히 확인해 보세요.",
  },
  incheon: {
    label: "인천",
    regions: INCHEON_REGIONS,
    overview:
      "인천은 송도국제도시(연수구), 청라국제도시(서구), 구월동 상권(남동구), 부평역 일대처럼 인구가 몰리는 생활권마다 치과가 밀집해 있습니다. 신도시 지역은 비교적 최근 개원한 치과가 많고, 원도심인 미추홀·부평·계양은 오래 운영해 온 동네 치과 비중이 높습니다. 서울 서남부·부천과 생활권이 이어져 있어 인천에서 서울로, 서울에서 인천으로 출퇴근하는 경우도 적지 않습니다.",
    pay:
      "인천 공고의 제시 급여는 서울과 비슷하거나 약간 낮은 수준에서 형성되는 경우가 많습니다. 신도시 치과 가운데는 야간·주말 진료를 하는 곳이 있어 같은 월급이라도 근무 요일과 수당 조건에 따라 체감 조건이 크게 달라지므로, 근무 시간표와 수당 기준을 함께 비교해 보세요.",
  },
  suwon: {
    label: "수원",
    regions: ["수원"],
    overview:
      "수원은 인구 약 120만 명으로 경기도에서 가장 큰 도시입니다. 인계동·권선동 상권, 영통·광교 신도시, 수원역과 장안구 일대에 치과가 고르게 분포하며, 광교·영통권은 비교적 규모가 큰 치과가 많은 편입니다. 용인 수지·기흥, 화성 동탄과 생활권이 이어져 있어 인접 도시 공고까지 함께 보면 선택 폭이 넓어집니다.",
    pay:
      "수원 지역 급여는 경기 평균 수준에서 형성되는 경우가 많으며, 신도시 대형 치과일수록 인센티브나 직급 수당 등 급여 구성이 다양한 편입니다. 수원역·영통 등 역세권 치과는 출퇴근이 편한 대신 진료 시간이 긴 경우가 있으니 근무 시간표를 함께 확인하세요.",
  },
  seongnam: {
    label: "성남",
    regions: ["성남"],
    overview:
      "성남은 분당·판교 신도시와 수정·중원 원도심으로 나뉩니다. 분당 서현·정자·야탑역 주변과 판교 테크노밸리 인근에는 직장인 수요를 겨냥한 치과가 많고, 수정·중원구에는 오래 운영해 온 동네 치과가 많습니다. 서울 강남·송파와 가까워 강남권 공고와 조건을 비교해 보고 지원하는 구직자도 많습니다.",
    pay:
      "분당·판교권은 서울 강남권과 인력 채용 경쟁을 하는 만큼 경기도 안에서는 급여 수준이 높은 편에 속하는 경우가 많습니다. 판교 인근 치과는 직장인 환자를 위해 야간진료를 운영하는 곳이 있어, 야간 근무 요일과 수당 조건을 꼭 확인하세요.",
  },
  bucheon: {
    label: "부천",
    regions: ["부천"],
    overview:
      "부천은 경기 서부의 대표 도시로, 중동·상동 신도시와 부천역·송내역 역세권에 치과가 밀집해 있습니다. 서울 구로·강서와 인천 부평·계양 사이에 있어 세 지역 어디로든 출퇴근이 편한 것이 장점입니다. 1호선·7호선이 지나 서울·인천 공고와 겹쳐 보는 구직자가 많으니 인접 지역 공고도 함께 확인해 보세요.",
    pay:
      "부천 지역 급여는 경기 평균 수준에서 형성되는 경우가 많고, 서울·인천과 인력 채용이 겹치는 만큼 경력직에게는 조건을 조율할 여지가 있는 편입니다. 역세권 치과는 진료 시간이 길 수 있으니 점심시간과 퇴근 시간을 함께 비교하세요.",
  },
  goyang: {
    label: "고양",
    regions: ["고양"],
    overview:
      "고양은 일산동구·일산서구·덕양구로 이루어져 있습니다. 일산 신도시의 정발산·주엽·대화역 주변 상권과 삼송·원흥·지축 등 덕양구 신도시에 치과가 많이 있습니다. 서울 은평·마포·서대문과 가까워 3호선·경의중앙선을 이용해 서울로 출퇴근하는 경우도 흔합니다.",
    pay:
      "고양 지역 급여는 경기 평균 수준에서 형성되는 경우가 많습니다. 삼송·원흥 등 신도시 치과는 개원 초기 인력을 모집하며 인센티브를 제시하는 경우가 있고, 일산 원도심 치과는 오래 근무한 직원이 많아 근무 환경이 안정적인 편인 곳이 많습니다.",
  },
};

const KINDS: Record<
  KindKey,
  { label: string; jobTypes: string[]; heading: string; body: string; checklist: string[]; isLab: boolean }
> = {
  "dental-technician": {
    label: "치과기공사",
    jobTypes: LAB_JOB_TYPES,
    heading: "치과기공사 급여·근무조건",
    isLab: true,
    body:
      "치과기공사는 기공소에서 근무하거나 치과 안의 원내 기공실에서 근무합니다. 기공소는 크라운·브릿지, 지르코니아, 포세린, 덴처, 교정 장치 등 분야별로 파트가 나뉘는 경우가 많고, 최근에는 exocad·3Shape 같은 CAD 프로그램으로 디자인하는 CAD/CAM 인력 수요가 꾸준히 늘고 있습니다. 급여는 경력 연차와 담당 파트, 처리하는 케이스 수에 따라 차이가 크며 기본급에 케이스 단가나 성과급을 더하는 구조도 흔합니다. 원내 기공실은 진료실과 바로 소통하며 당일 수정이 잦은 대신, 근무시간이 치과 진료시간에 맞춰져 있어 야근이 적은 편입니다.",
    checklist: [
      "담당 파트(지르코니아·포세린·덴처 등)와 사용 장비·CAD 프로그램",
      "급여 구성 — 기본급, 케이스 단가, 성과급 비중",
      "평균 퇴근 시간과 연장 근무 수당 기준",
      "4대보험·퇴직금 적용 여부와 수습 기간 조건",
    ],
  },
  "cad-cam": {
    label: "CAD/CAM 기공사",
    jobTypes: ["CAD/CAM"],
    heading: "CAD/CAM 기공사 급여·근무조건",
    isLab: true,
    body:
      "CAD/CAM 기공사는 구강 스캐너나 모델 스캔 데이터를 받아 exocad·3Shape 등으로 보철물을 디자인하고, 밀링기·3D 프린터로 가공하는 업무를 맡습니다. 디자인 전담, 밀링 장비 운영, 디자인과 마무리 작업 병행 등 기공소마다 역할 범위가 달라 공고에서 담당 업무를 꼭 확인해야 합니다. 급여는 사용할 수 있는 프로그램과 하루 처리 유닛 수, 경력에 따라 달라지며 숙련된 디자이너는 일반 기공사보다 높은 조건을 제시받는 경우가 많습니다. 디자인만 따로 맡는 외주·재택 형태로 일하는 방식도 늘고 있습니다.",
    checklist: [
      "사용하는 CAD 프로그램(exocad·3Shape 등)과 장비",
      "디자인 전담인지, 밀링·마무리까지 맡는지",
      "하루 평균 처리 유닛 수와 성과급 기준",
      "외주·재택 병행 가능 여부",
    ],
  },
  "dental-lab": {
    label: "기공소 직원",
    jobTypes: ["기공소 직원", "치과기공사"],
    heading: "기공소 직원 급여·근무조건",
    isLab: true,
    body:
      "기공소에서는 치과기공사 면허를 가진 기공사 외에도 배송·접수, 모델 작업, 사무 등 다양한 직원을 채용합니다. 지르코니아·포세린·덴처처럼 분야별 전문 기공소가 많아 한 분야에서 경력을 쌓으면 이직할 때 유리합니다. 급여는 담당 업무와 경력, 처리 케이스 수에 따라 달라지며 기본급에 수당이나 성과급이 붙는 구조가 흔합니다. 납기가 몰리는 시기에는 연장 근무가 생길 수 있으므로 평균 퇴근 시간과 연장 수당 기준을 면접에서 확인하는 것이 좋습니다.",
    checklist: [
      "담당 업무 범위(기공 작업·배송·접수·사무)",
      "주력 분야와 거래 치과 규모",
      "연장 근무 빈도와 수당 기준",
      "4대보험·퇴직금 적용 여부",
    ],
  },
  "dental-hygienist": {
    label: "치과위생사",
    jobTypes: ["치과위생사"],
    heading: "치과위생사 급여·근무조건",
    isLab: false,
    body:
      "치과위생사는 스케일링·예방 처치, 진료 보조, 환자 교육, 방사선 촬영 등을 담당하며 면허가 필수입니다. 급여는 연차에 따라 차이가 크고, 임플란트·교정 전문 치과나 대형 치과에서는 상담·코디네이터 업무를 겸하면 수당이 붙는 경우도 있습니다. 야간진료 요일, 토요일 근무 여부, 점심시간, 연차 사용 방식에 따라 실제 근무 강도가 크게 달라지므로 급여 숫자와 함께 근무 형태를 비교해 보세요. 신입은 교육 체계가 있는 치과를, 경력자는 담당 파트와 직급 체계를 확인하는 것이 좋습니다.",
    checklist: [
      "야간진료 요일과 토요일 근무 여부",
      "제시 급여가 세전인지 세후인지",
      "연차·휴가 사용 방식과 점심시간",
      "신입 교육 체계 또는 경력자 직급·수당 체계",
    ],
  },
};

const PAGES: [AreaKey, KindKey][] = [
  ["seoul", "dental-technician"],
  ["gyeonggi", "dental-technician"],
  ["seoul", "cad-cam"],
  ["gyeonggi", "cad-cam"],
  ["seoul", "dental-lab"],
  ["gyeonggi", "dental-lab"],
  ["seoul", "dental-hygienist"],
  ["gyeonggi", "dental-hygienist"],
  ["incheon", "dental-technician"],
  ["incheon", "dental-hygienist"],
  ["suwon", "dental-technician"],
  ["suwon", "dental-hygienist"],
  ["seongnam", "dental-technician"],
  ["seongnam", "dental-hygienist"],
  ["bucheon", "dental-technician"],
  ["bucheon", "dental-hygienist"],
  ["goyang", "dental-technician"],
  ["goyang", "dental-hygienist"],
];

function buildPage(areaKey: AreaKey, kindKey: KindKey): SeoLandingPage {
  const area = AREAS[areaKey];
  const kind = KINDS[kindKey];
  const title =
    kindKey === "dental-technician"
      ? `${area.label} 치과기공사 구인·구직`
      : kindKey === "dental-lab"
        ? `${area.label} 기공소 직원 채용`
        : `${area.label} ${kind.label} 채용`;
  const workplace = kind.isLab ? "기공소와 치과 내 기공실" : "치과의원과 병원";
  return {
    slug: `${areaKey}-${kindKey}-jobs`,
    title,
    description: `${area.label} 지역 ${kind.label} 채용공고와 지역별 급여·근무조건 정보를 한곳에서 확인하세요. ${workplace}의 최신 공고를 비교하고 바로 지원할 수 있습니다.`,
    regions: area.regions,
    jobTypes: kind.jobTypes,
    intro: `${area.label} 지역 ${workplace}의 최신 ${kind.label} 채용공고입니다.`,
    sections: [
      { heading: `${area.label} 지역 ${kind.isLab ? "치과·기공소" : "치과"} 채용 특징`, body: area.overview },
      { heading: kind.heading, body: `${kind.body} ${area.pay}` },
    ],
    checklist: kind.checklist,
    areaLabel: area.label,
    kindLabel: kind.label,
  };
}

export const seoLandingPages: SeoLandingPage[] = PAGES.map(([a, k]) => buildPage(a, k));

export function getSeoLandingPage(slug: string) {
  return seoLandingPages.find((page) => page.slug === slug);
}
