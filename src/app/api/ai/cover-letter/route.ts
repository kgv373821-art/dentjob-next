import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/services/claude";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { desired_job, lab_specialty, career_years, motivation, job_title } = await req.json();

  const system =
    "당신은 서울·경기 치과·치과기공사 채용 플랫폼의 자기소개서 작성 도우미입니다. 지원자 정보를 바탕으로 " +
    "진솔하고 구체적인 한국어 자기소개서를 작성합니다. 상투적인 표현을 피하고, 지원 직무와의 연결성을 드러내세요.";

  const userPrompt = `지원 직무: ${job_title || desired_job || "미입력"}
전문분야: ${lab_specialty || "해당없음"}
경력: ${career_years || 0}년
지원 동기/강조하고 싶은 점: ${motivation || "미입력"}

위 정보로 600자 내외의 자기소개서를 작성해주세요.`;

  try {
    const text = await generateWithClaude(system, userPrompt);
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
