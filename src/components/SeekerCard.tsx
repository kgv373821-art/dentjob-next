import Link from "next/link";
import type { Seeker } from "@/lib/types";

export default function SeekerCard({ seeker, name }: { seeker: Seeker; name: string }) {
  const isLab = !!seeker.lab_specialty;
  return (
    <Link
      href={`/seekers/${seeker.id}`}
      className={`block rounded-[3px] border border-line bg-white p-4 text-center transition hover:border-teal ${
        isLab ? "border-t-[3px] border-t-gold" : ""
      }`}
    >
      <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-teal-tint text-[17px] font-extrabold text-teal">
        {name[0]}
      </div>
      <h4 className="text-[14px] font-bold">{name}</h4>
      <div className="mb-2 text-[12px] text-ink-soft">
        {seeker.desired_job} · 경력 {seeker.career_years}년
      </div>
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
