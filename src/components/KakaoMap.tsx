"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void;
        Map: new (container: HTMLElement, options: Record<string, unknown>) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: Record<string, unknown>) => { setMap: (map: unknown) => void };
        InfoWindow: new (options: Record<string, unknown>) => { open: (map: unknown, marker: unknown) => void };
        event: { addListener: (target: unknown, type: string, handler: () => void) => void };
      };
    };
  }
}

export type MapPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "clinic" | "lab";
  region: string;
};

export default function KakaoMap({ pins }: { pins: MapPin[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key) return;

    function render() {
      if (!mapRef.current || !window.kakao) return;
      window.kakao.maps.load(() => {
        const center = pins.length
          ? new window.kakao!.maps.LatLng(pins[0].lat, pins[0].lng)
          : new window.kakao!.maps.LatLng(37.5665, 126.978);
        const map = new window.kakao!.maps.Map(mapRef.current!, { center, level: 8 });

        pins.forEach((pin) => {
          const position = new window.kakao!.maps.LatLng(pin.lat, pin.lng);
          const marker = new window.kakao!.maps.Marker({ position, map });
          const info = new window.kakao!.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:12.5px;">${pin.name}</div>`,
          });
          window.kakao!.maps.event.addListener(marker, "click", () => info.open(map, marker));
        });
      });
    }

    if (window.kakao) {
      render();
    } else {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }
  }, [pins]);

  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center gap-2 rounded border border-line bg-paper-dim text-center text-[13px] text-ink-soft">
        <p>지도를 표시하려면 카카오 지도 JavaScript 키가 필요합니다.</p>
        <p className="font-mono text-[11.5px]">.env의 NEXT_PUBLIC_KAKAO_JS_KEY 값을 설정해주세요.</p>
        <div className="mt-2 grid gap-1.5">
          {pins.map((p) => (
            <Link key={p.id} href={p.type === "clinic" ? `/clinics/${p.id}` : `/labs/${p.id}`} className="text-teal underline">
              {p.name} ({p.region})
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-[420px] w-full rounded border border-line" />;
}
