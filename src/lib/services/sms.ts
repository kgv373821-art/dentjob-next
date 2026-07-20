import crypto from "crypto";

function makeSignature(method: string, url: string, timestamp: string, accessKey: string, secretKey: string) {
  const message = [method, " ", url, "\n", timestamp, "\n", accessKey].join("");
  return crypto.createHmac("sha256", secretKey).update(message).digest("base64");
}

export async function sendSms(recipients: string[], content: string) {
  const serviceId = process.env.NCP_SENS_SERVICE_ID!;
  const accessKey = process.env.NCP_ACCESS_KEY!;
  const secretKey = process.env.NCP_SECRET_KEY!;
  const from = process.env.NCP_SENDER_PHONE!;

  const url = `/sms/v2/services/${serviceId}/messages`;
  const timestamp = Date.now().toString();
  const signature = makeSignature("POST", url, timestamp, accessKey, secretKey);

  const res = await fetch(`https://sens.apigw.ntruss.com${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-ncp-apigw-timestamp": timestamp,
      "x-ncp-iam-access-key": accessKey,
      "x-ncp-apigw-signature-v2": signature,
    },
    body: JSON.stringify({
      type: content.length > 90 ? "LMS" : "SMS",
      from,
      content,
      messages: recipients.map((to) => ({ to })),
    }),
  });

  if (!res.ok) throw new Error(`SENS 발송 실패: ${res.status}`);
  return res.json();
}
