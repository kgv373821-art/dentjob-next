// 카카오 알림톡(비즈메시지) 발송 스캐폴드.
//
// 카카오 알림톡은 SMS와 달리 카카오 비즈니스에 채널을 개설하고, 발송 대행사(Solapi, NHN Toast,
// 알리고 등)를 통해 "템플릿"을 사전 등록·승인받아야 발송할 수 있습니다. 이 저장소만으로는
// 승인 절차를 대신할 수 없어, 아래는 Solapi 기준 REST 연동 스캐폴드입니다.
// 실제 사용 전 https://solapi.com (또는 선택한 대행사) 가입 → 카카오 채널 연결 → 템플릿 승인이 필요합니다.
import crypto from "crypto";

interface AlimtalkParams {
  to: string;
  templateId: string;
  variables: Record<string, string>;
}

function solapiSignature(apiKey: string, apiSecret: string) {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha256", apiSecret).update(date + salt).digest("hex");
  return { authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}` };
}

export async function sendAlimtalk({ to, templateId, variables }: AlimtalkParams) {
  const apiKey = process.env.KAKAO_ALIMTALK_PROVIDER_API_KEY;
  const apiSecret = process.env.KAKAO_ALIMTALK_PROVIDER_API_SECRET;
  const senderKey = process.env.KAKAO_ALIMTALK_SENDER_KEY;
  if (!apiKey || !apiSecret || !senderKey) {
    throw new Error("카카오 알림톡 연동 정보가 설정되지 않았습니다 (.env의 KAKAO_ALIMTALK_* 값을 채워주세요).");
  }

  const { authorization } = solapiSignature(apiKey, apiSecret);
  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authorization },
    body: JSON.stringify({
      message: {
        to,
        from: process.env.NCP_SENDER_PHONE,
        kakaoOptions: { pfId: senderKey, templateId, variables },
      },
    }),
  });
  if (!res.ok) throw new Error(`알림톡 발송 실패: ${res.status}`);
  return res.json();
}

/** 지원 접수 알림톡 (구직자가 지원 완료 시 치과/기공소에 발송) */
export async function notifyNewApplication(to: string, clinicOrLabName: string, jobTitle: string) {
  const templateId = process.env.KAKAO_ALIMTALK_TEMPLATE_APPLY;
  if (!templateId) throw new Error("KAKAO_ALIMTALK_TEMPLATE_APPLY 템플릿 ID가 설정되지 않았습니다.");
  return sendAlimtalk({ to, templateId, variables: { "#{기관명}": clinicOrLabName, "#{공고명}": jobTitle } });
}

/** 합격/불합격 등 상태 변경 알림톡 (구직자에게 발송) */
export async function notifyApplicationStatus(to: string, jobTitle: string, status: string) {
  const templateId = process.env.KAKAO_ALIMTALK_TEMPLATE_STATUS;
  if (!templateId) throw new Error("KAKAO_ALIMTALK_TEMPLATE_STATUS 템플릿 ID가 설정되지 않았습니다.");
  return sendAlimtalk({ to, templateId, variables: { "#{공고명}": jobTitle, "#{상태}": status } });
}
