// Anthropic Claude API를 이용한 AI 이력서 / 자기소개서 / 공고 초안 생성.
// ANTHROPIC_API_KEY 환경변수가 필요합니다 (https://console.anthropic.com 에서 발급).
export async function generateWithClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다.");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Claude API 오류 (${res.status})`);
  }

  const data = await res.json();
  const text = (data.content || []).find((b: { type: string }) => b.type === "text")?.text;
  if (!text) throw new Error("AI 응답을 받지 못했습니다.");
  return text;
}
