/** 채용정보 상세 항목(담당업무/근무형태/모집인원/학력/경력/모집기간/접수방법 등)을 폼에서 읽어옵니다. */
export function parseJobDetailFields(formData: FormData) {
  const str = (key: string) => String(formData.get(key) || "").trim() || null;
  return {
    duties: str("duties"),
    employment_type: str("employment_type"),
    headcount: str("headcount"),
    education_level: str("education_level"),
    career_requirement: str("career_requirement"),
    recruit_start_date: str("recruit_start_date"),
    recruit_end_date: str("recruit_end_date"),
    application_method: str("application_method"),
    application_email: str("application_email"),
    required_documents: str("required_documents"),
    work_address: str("work_address"),
    nearby_station: str("nearby_station"),
    homepage_url: str("homepage_url"),
    hr_contact_name: str("hr_contact_name"),
    hr_contact_phone: str("hr_contact_phone"),
    contact_email: str("contact_email"),
  };
}

/** image_urls와 같은 순서로 매칭되는 사진 설명을 폼에서 읽어옵니다. 개수를 imageCount에 맞춰 자르거나 빈 문자열로 채웁니다. */
export function parseImageCaptions(formData: FormData, imageCount: number): string[] {
  let captions: string[] = [];
  try {
    const raw = JSON.parse(String(formData.get("image_captions") || "[]"));
    if (Array.isArray(raw)) captions = raw.filter((c) => typeof c === "string").slice(0, imageCount);
  } catch {
    captions = [];
  }
  while (captions.length < imageCount) captions.push("");
  return captions;
}
