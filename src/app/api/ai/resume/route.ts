import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/services/claude";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { desired_job, lab_specialty, career_years, certifications, highlights } = await req.json();

  const system =
    "당신은 서울·경기 치과·치과기공사 채용 플랫폼의 이력서 작성 도우미입니다. 지원자가 입력한 정보를 바탕으로 " +
    "채용담당자가 빠르게 훑어볼 수 있는 간결하고 전문적인 한국어 이력서 요약문을 작성합니다. 과장하지 않고 사실 기반으로 작성하세요.";

  const userPrompt = `직종: ${desired_job || "미입력"}
전문분야: ${lab_specialty || "해당없음"}
경력: ${career_years || 0}년
자격증: ${certifications || "미입력"}
강조하고 싶은 경험/역량: ${highlights || "미입력"}

위 정보로 400자 내외의 이력서 자기소개 요약문을 작성해주세요.`;

  try {
    const text = await generateWithClaude(system, userPrompt);
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
