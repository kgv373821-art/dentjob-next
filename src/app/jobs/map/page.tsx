import { createClient } from "@/lib/supabase/server";
import KakaoMap, { type MapPin } from "@/components/KakaoMap";

export const metadata = { title: "지도 검색" };

export default async function JobsMapPage() {
  const supabase = await createClient();
  const [{ data: clinics }, { data: labs }] = await Promise.all([
    supabase.from("clinics").select("id, clinic_name, region_main, lat, lng").not("lat", "is", null),
    supabase.from("labs").select("id, lab_name, region_main, lat, lng").not("lat", "is", null),
  ]);

  const pins: MapPin[] = [
    ...(clinics || []).map((c) => ({ id: c.id, name: c.clinic_name, lat: c.lat!, lng: c.lng!, region: c.region_main, type: "clinic" as const })),
    ...(labs || []).map((l) => ({ id: l.id, name: l.lab_name, lat: l.lat!, lng: l.lng!, region: l.region_main, type: "lab" as const })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">지도 기반 검색</h1>
      <KakaoMap pins={pins} />
      {pins.length === 0 && (
        <p className="mt-4 text-center text-[13px] text-ink-soft">
          아직 좌표가 등록된 치과·기공소가 없습니다. 마이페이지에서 위치 정보를 등록하면 지도에 표시됩니다.
        </p>
      )}
    </div>
  );
}
