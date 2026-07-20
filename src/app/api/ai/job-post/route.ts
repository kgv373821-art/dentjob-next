import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/services/claude";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { org_name, job_type, lab_specialty, region, pay_min, work_hours, welfare, notes } = await req.json();

  const system =
    "당신은 서울·경기 치과·기공소 채용공고 작성 도우미입니다. 입력된 정보를 바탕으로 지원자의 지원 결정에 " +
    "도움이 되는 명확하고 매력적인 한국어 채용공고 본문을 작성합니다. 근무 환경, 우대사항, 조직 분위기를 자연스럽게 녹여내세요.";

  const userPrompt = `등록 기관: ${org_name || "미입력"}
모집분야: ${job_type || "미입력"}${lab_specialty ? ` (${lab_specialty})` : ""}
지역: ${region || "미입력"}
급여: 월 ${pay_min || "협의"}만원
근무시간: ${work_hours || "미입력"}
복지: ${welfare || "미입력"}
추가로 강조하고 싶은 내용: ${notes || "없음"}

위 정보로 500자 내외의 채용공고 상세설명을 작성해주세요.`;

  try {
    const text = await generateWithClaude(system, userPrompt);
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
