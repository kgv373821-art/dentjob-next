import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dentjob.example.com"),
  title: {
    default: "Job2804 덴트잡 서울경기 | 서울·경기 치과·치과기공사 전용 구인구직",
    template: "%s | Job2804 덴트잡",
  },
  description:
    "서울·경기 지역 치과, 치과기공사·기공소 채용에 특화된 구인구직 플랫폼. 치과의사, 치과위생사, 치과기공사, CAD/CAM, 상담실장 채용정보를 지역·급여별로 빠르게 찾아보세요.",
  keywords: ["치과 구인구직", "치과기공사 채용", "기공소 채용", "치과위생사 채용", "서울 치과 채용", "경기 치과 채용"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "Job2804 덴트잡 서울경기",
    description: "서울·경기 치과·치과기공사 전용 구인구직 플랫폼",
    siteName: "Job2804 덴트잡",
  },
  robots: { index: true, follow: true },
  verification: {
    other: { "naver-site-verification": "33233772043dc751d8dfccbe4f299e6917005098" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard(한글) + IBM Plex Mono(숫자/코드) — next/font 대신 CDN 사용:
            next/font/google은 빌드 타임에 Google Fonts에 접근해야 하므로
            사내망/방화벽 환경에서 빌드가 실패할 수 있어 CDN 링크 방식을 채택했습니다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ibm-plex-mono/1.0.0/ibmplexmono.min.css" />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
