function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold">
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewList({
  reviews,
}: {
  reviews: { id: string; rating: number; content: string; created_at: string; author_name?: string }[];
}) {
  if (reviews.length === 0) {
    return <p className="py-8 text-center text-[13px] text-ink-soft">아직 등록된 리뷰가 없습니다.</p>;
  }
  return (
    <div className="space-y-2.5">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-sm border border-line bg-white p-3.5">
          <div className="mb-1 flex items-center justify-between">
            <Stars rating={r.rating} />
            <span className="text-[11.5px] text-ink-soft">{new Date(r.created_at).toLocaleDateString("ko-KR")}</span>
          </div>
          <p className="text-[13.5px] leading-relaxed">{r.content}</p>
          {r.author_name && <p className="mt-1 text-[11.5px] text-ink-soft">— {r.author_name}</p>}
        </div>
      ))}
    </div>
  );
}
