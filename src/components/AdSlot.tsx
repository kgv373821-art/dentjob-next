import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Ad, AdPosition } from "@/lib/types";

function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] || null;
}

export default async function AdSlot({ position, className }: { position: AdPosition; className?: string }) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("ads")
    .select("*")
    .eq("position", position)
    .eq("active", true)
    .order("priority", { ascending: false })
    .limit(20);

  const ads = ((data || []) as Ad[])
    .filter((ad) => (!ad.start_date || ad.start_date <= today) && (!ad.end_date || ad.end_date >= today))
    .slice(0, 5);
  if (ads.length === 0) return null;

  const isSidebar = position === "sidebar";

  return (
    <div className={`${isSidebar ? "space-y-3" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"} ${className || ""}`}>
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} compact={isSidebar} />
      ))}
    </div>
  );
}

function AdCard({ ad, compact }: { ad: Ad; compact?: boolean }) {
  if (ad.type === "youtube") {
    const vid = youtubeId(ad.link);
    const thumb = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null;
    return (
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group relative block overflow-hidden rounded-[3px] border border-line bg-black"
      >
        {thumb && (
          <Image
            src={thumb}
            alt={ad.title}
            width={480}
            height={270}
            loading="lazy"
            className={`w-full object-cover opacity-90 transition group-hover:opacity-100 ${compact ? "h-24" : "h-40"}`}
          />
        )}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[15px] text-ink shadow">▶</span>
        </span>
        <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[12px] font-bold text-white">
          {ad.title}
        </span>
      </a>
    );
  }

  const placeholder: Record<string, { bg: string; icon: string }> = {
    game: { bg: "linear-gradient(135deg, var(--color-ink), var(--color-teal-deep))", icon: "🎮" },
    blog: { bg: "linear-gradient(135deg, var(--color-teal-tint), #fff)", icon: "📝" },
    image: { bg: "linear-gradient(135deg, var(--color-teal-tint), rgba(245,158,11,0.12))", icon: "🖼" },
  };
  const ph = placeholder[ad.type] || placeholder.image;

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block overflow-hidden rounded-[3px] border border-line bg-white transition hover:-translate-y-0.5 hover:border-teal hover:shadow-lg"
    >
      {ad.image ? (
        <Image
          src={ad.image}
          alt={ad.title}
          width={480}
          height={270}
          loading="lazy"
          className={`w-full object-cover ${compact ? "h-24" : "h-32"}`}
        />
      ) : (
        <div
          className={`flex w-full items-center justify-center text-[32px] ${compact ? "h-24" : "h-32"}`}
          style={{ background: ph.bg }}
        >
          {ph.icon}
        </div>
      )}
      <div className="p-2.5">
        <div className="mb-0.5 flex items-center gap-1.5">
          <span className="rounded-sm bg-paper-dim px-1.5 py-0.5 text-[9.5px] font-bold text-ink-soft">
            {ad.type === "game" ? "게임" : ad.type === "blog" ? "블로그" : "AD"}
          </span>
          <span className={`truncate font-bold ${compact ? "text-[12px]" : "text-[13px]"}`}>{ad.title}</span>
        </div>
        {ad.description && !compact && <p className="line-clamp-2 text-[11.5px] text-ink-soft">{ad.description}</p>}
      </div>
    </a>
  );
}
