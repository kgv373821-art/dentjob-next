import { extendJobPost } from "@/lib/actions/jobs";

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export default function ExpiryCell({ jobId, expiresAt }: { jobId: string; expiresAt: string | null }) {
  if (!expiresAt) return <span className="text-ink-soft">-</span>;

  const daysLeft = daysUntil(expiresAt);
  const label = daysLeft < 0 ? "만료됨" : daysLeft === 0 ? "오늘 만료" : `D-${daysLeft}`;
  const color = daysLeft < 0 ? "text-ink-soft" : daysLeft <= 7 ? "text-coral" : "text-teal";

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={`font-mono font-bold ${color}`}>{label}</span>
      <form action={extendJobPost.bind(null, jobId)} className="inline">
        <button className="rounded-sm border border-line px-1.5 py-0.5 text-[10.5px] font-bold text-ink-soft hover:border-teal hover:text-teal">
          연장
        </button>
      </form>
    </span>
  );
}
