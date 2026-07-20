"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: { sendDefault: (opts: Record<string, unknown>) => void };
    };
  }
}

export default function KakaoShareButton({ title, description, url, imageUrl }: { title: string; description: string; url: string; imageUrl?: string }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key || window.Kakao) return;
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(key);
    };
    document.head.appendChild(script);
  }, []);

  function share() {
    if (!window.Kakao) {
      alert("카카오 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!window.Kakao.isInitialized()) window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!);
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: imageUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.png`,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [{ title: "공고 보기", link: { mobileWebUrl: url, webUrl: url } }],
    });
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex items-center justify-center gap-1.5 rounded-sm border border-line bg-[#FEE500] px-3.5 py-2.5 text-[13px] font-bold text-[#3C1E1E] hover:opacity-90"
    >
      카카오톡 공유
    </button>
  );
}
