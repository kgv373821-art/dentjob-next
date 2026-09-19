import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const isProductionDomain = host === "dentjob2804.co.kr" || host === "www.dentjob2804.co.kr";

  // 한 주소만 색인되도록 www 및 HTTP 요청을 대표 HTTPS 도메인으로 통일합니다.
  if (isProductionDomain && (host === "www.dentjob2804.co.kr" || forwardedProtocol === "http")) {
    const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, "https://dentjob2804.co.kr");
    return NextResponse.redirect(destination, 301);
  }

  // canonical은 각 페이지의 metadata(alternates.canonical)에서만 지정합니다.
  // 여기서 HTTP Link 헤더로 또 내보내면 HTML 태그와 주소가 달라 서로 충돌합니다.
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
