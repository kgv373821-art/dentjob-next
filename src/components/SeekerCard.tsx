import Link from "next/link";
import type { Seeker } from "@/lib/types";
import FavoriteButton from "@/components/FavoriteButton";

export default function SeekerCard({
  seeker,
  name,
  isLoggedIn = false,
  isFavorited = false,
}: {
  seeker: Seeker;
  name: string;
  isLoggedIn?: boolean;
  isFavorited?: boolean;
}) {
  const isLab = !!seeker.lab_specialty;
  return (
    <Link
      href={`/seekers/${seeker.id}`}
      className={`relative block rounded-[3px] border border-line bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-teal hover:shadow-lg ${
        isLab ? "border-t-[3px] border-t-gold" : ""
      }`}
    >
      <div className="absolute right-2.5 top-2.5">
        <FavoriteButton targetType="seeker" targetId={seeker.id} initialFavorited={isFavorited} isLoggedIn={isLoggedIn} />
      </div>

      <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-teal-tint text-[17px] font-extrabold text-teal">
        {name[0]}
      </div>
      <h4 className="text-[14px] font-bold">{name}</h4>
      <div className="mb-1.5 text-[12px] text-ink-soft">
        {seeker.desired_job || "직종 미정"} · 경력 {seeker.career_years}년
      </div>
      {seeker.self_intro && (
        <p className="mb-2 line-clamp-1 text-[11.5px] text-ink-soft">{seeker.self_intro}</p>
      )}
      <div className="flex flex-wrap justify-center gap-1.5 text-[10.5px]">
        {seeker.desired_region && (
          <span className="rounded-full border border-line bg-paper-dim px-2 py-0.5 text-ink-soft">{seeker.desired_region}</span>
        )}
        {seeker.desired_pay_min && (
          <span className="rounded-full border border-line bg-paper-dim px-2 py-0.5 text-ink-soft">
            월 {seeker.desired_pay_min}만+
          </span>
        )}
        {seeker.lab_specialty && (
          <span className="rounded-full border border-gold bg-paper-dim px-2 py-0.5 text-gold">{seeker.lab_specialty}</span>
        )}
      </div>
    </Link>
  );
}
