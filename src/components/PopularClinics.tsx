import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PopularClinics() {
  const supabase = await createClient();

  const { data: reviews } = await supabase.from("clinic_reviews").select("clinic_id, rating");

  type Ranked = { id: string; clinic_name: string; region_main: string; avg: number; count: number };
  let ranked: Ranked[] = [];

  if (reviews && reviews.length > 0) {
    const byClinic = new Map<string, { sum: number; count: number }>();
    for (const r of reviews) {
      const cur = byClinic.get(r.clinic_id) || { sum: 0, count: 0 };
      cur.sum += r.rating;
      cur.count += 1;
      byClinic.set(r.clinic_id, cur);
    }
    const topIds = [...byClinic.entries()]
      .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count || b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id]) => id);

    if (topIds.length > 0) {
      const { data: clinics } = await supabase.from("clinics").select("id, clinic_name, region_main").in("id", topIds);
      ranked = topIds
        .map((id) => {
          const c = clinics?.find((c) => c.id === id);
          const stat = byClinic.get(id)!;
          return c ? { id, clinic_name: c.clinic_name, region_main: c.region_main, avg: stat.sum / stat.count, count: stat.count } : null;
        })
        .filter((x): x is Ranked => !!x);
    }
  }

  if (ranked.length === 0) {
    const { data: clinics } = await supabase
      .from("clinics")
      .select("id, clinic_name, region_main")
      .order("id", { ascending: false })
      .limit(5);
    ranked = (clinics || []).map((c) => ({ ...c, avg: 0, count: 0 }));
  }

  if (ranked.length === 0) return null;

  return (
    <div className="rounded-[3px] border border-l-4 border-line border-l-gold bg-white p-4">
      <h3 className="mb-2.5 border-b border-line pb-2 text-[13.5px] font-extrabold text-gold">🏆 인기 병원</h3>
      <ul className="space-y-2">
        {ranked.map((c, i) => (
          <li key={c.id}>
            <Link href={`/clinics/${c.id}`} className="flex items-center justify-between text-[12.5px] hover:text-teal">
              <span className="flex items-center gap-1.5 truncate font-semibold">
                <span className="text-[10px] font-mono font-bold text-gold">{i + 1}</span>
                {c.clinic_name}
              </span>
              <span className="ml-2 flex-shrink-0 text-[11px] text-ink-soft">
                {c.count > 0 ? `★ ${c.avg.toFixed(1)}` : c.region_main}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
