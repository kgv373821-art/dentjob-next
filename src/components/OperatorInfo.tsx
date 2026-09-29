import { SITE_INFO } from "@/lib/siteInfo";

/** 운영자 정보 목록 — 채워진 항목만 보여줍니다. */
export function operatorInfoRows(): { label: string; value: string }[] {
  const rows = [
    { label: "서비스명", value: SITE_INFO.serviceName },
    { label: "상호", value: SITE_INFO.companyName },
    { label: "대표자", value: SITE_INFO.representative },
    { label: "사업자등록번호", value: SITE_INFO.businessNumber },
    { label: "통신판매업 신고번호", value: SITE_INFO.mailOrderNumber },
    { label: "주소", value: SITE_INFO.address },
    { label: "전화", value: SITE_INFO.phone },
    { label: "이메일", value: SITE_INFO.email },
  ];
  return rows.filter((r) => r.value);
}

export default function OperatorInfo() {
  return (
    <ul className="space-y-0.5">
      {operatorInfoRows().map((r) => (
        <li key={r.label}>
          {r.label}: {r.label === "이메일" ? <a href={`mailto:${r.value}`} className="text-teal hover:underline">{r.value}</a> : r.value}
        </li>
      ))}
    </ul>
  );
}
