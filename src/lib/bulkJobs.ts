import { REGIONS, JOB_TYPES, EMPLOYMENT_TYPES, LAB_RELATED_JOB_TYPES } from "@/lib/constants";

/** 엑셀 일괄 등록의 열 순서. 첫 줄이 이 제목 줄이면 자동으로 건너뜁니다. */
export const BULK_COLUMNS = [
  "업체명",
  "구분(치과/기공소)",
  "직종",
  "지역",
  "제목",
  "급여(만원)",
  "고용형태",
  "마감일(YYYY-MM-DD)",
  "연락처",
  "상세내용",
] as const;

export const BULK_MAX_ROWS = 100;

export type BulkJobRow = {
  org_name: string;
  org_type: "clinic" | "lab";
  job_type: string;
  region: string;
  title: string;
  pay_min: number | null;
  employment_type: string;
  recruit_end_date: string | null;
  hr_contact_phone: string | null;
  description: string | null;
};

/** 엑셀에서 복사(탭 구분) 또는 CSV(쉼표 구분) 텍스트를 칸 단위로 나눕니다. 따옴표로 감싼 칸 안의 줄바꿈·구분자도 처리합니다. */
export function parseDelimited(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] || "";
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"' && cell === "") {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function isValidDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** 붙여넣은 텍스트를 검사해 등록 가능한 행과 문제 목록으로 나눕니다. 문제가 하나라도 있으면 호출한 쪽에서 아무것도 등록하지 않아야 합니다. */
export function validateBulkJobs(text: string): { rows: BulkJobRow[]; problems: string[] } {
  const table = parseDelimited(text);
  const problems: string[] = [];
  const rows: BulkJobRow[] = [];

  const hasHeader = table[0]?.[0]?.trim() === "업체명";
  const body = hasHeader ? table.slice(1) : table;
  const lineOffset = hasHeader ? 2 : 1;

  if (body.length === 0) return { rows, problems: ["붙여넣은 내용이 없습니다."] };
  if (body.length > BULK_MAX_ROWS) {
    return { rows, problems: [`한 번에 최대 ${BULK_MAX_ROWS}건까지 등록할 수 있습니다. (현재 ${body.length}건)`] };
  }

  const today = new Date().toISOString().slice(0, 10);

  body.forEach((cells, idx) => {
    const line = idx + lineOffset;
    const c = (i: number) => (cells[i] || "").trim();
    const errs: string[] = [];

    const org_name = c(0);
    if (!org_name) errs.push("업체명이 비어 있습니다");
    else if (org_name.startsWith("예시")) errs.push("양식의 예시 줄입니다. 지우고 다시 붙여넣어 주세요");

    const job_type = c(2);
    if (!JOB_TYPES.includes(job_type as (typeof JOB_TYPES)[number])) {
      errs.push(`직종 "${job_type}"은(는) 사용할 수 없습니다 (${JOB_TYPES.join("/")} 중 하나)`);
    }

    const kind = c(1);
    let org_type: "clinic" | "lab" = LAB_RELATED_JOB_TYPES.includes(job_type) ? "lab" : "clinic";
    if (kind) {
      if (kind === "치과" || kind === "clinic") org_type = "clinic";
      else if (kind === "기공소" || kind === "lab") org_type = "lab";
      else errs.push(`구분 "${kind}"은(는) "치과" 또는 "기공소"만 가능합니다`);
    }

    const region = c(3);
    if (!REGIONS.includes(region)) errs.push(`지역 "${region}"은(는) 사용할 수 없습니다 (예: 강남, 금천, 수원)`);

    const payRaw = c(5).replace(/,/g, "");
    let pay_min: number | null = null;
    if (payRaw) {
      const n = Number(payRaw);
      if (!Number.isInteger(n) || n < 0) errs.push(`급여 "${c(5)}"은(는) 만원 단위 숫자여야 합니다 (예: 300)`);
      else pay_min = n;
    }

    const employment_type = c(6) || "정규직";
    if (!EMPLOYMENT_TYPES.includes(employment_type)) {
      errs.push(`고용형태 "${employment_type}"은(는) 사용할 수 없습니다 (${EMPLOYMENT_TYPES.join("/")} 중 하나)`);
    }

    const end = c(7);
    let recruit_end_date: string | null = null;
    if (end) {
      if (!isValidDate(end)) errs.push(`마감일 "${end}"은(는) 2026-10-31 형식이어야 합니다`);
      else if (end < today) errs.push(`마감일 ${end}은(는) 이미 지난 날짜입니다`);
      else recruit_end_date = end;
    }

    if (errs.length > 0) {
      problems.push(`${line}번째 줄 (${org_name || "업체명 없음"}): ${errs.join(" / ")}`);
      return;
    }

    rows.push({
      org_name,
      org_type,
      job_type,
      region,
      title: c(4) || `${org_name} ${job_type} 모집합니다`,
      pay_min,
      employment_type,
      recruit_end_date,
      hr_contact_phone: c(8) || null,
      description: c(9) || null,
    });
  });

  return { rows, problems };
}
