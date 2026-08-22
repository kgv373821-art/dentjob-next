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
