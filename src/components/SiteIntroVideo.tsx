export default function SiteIntroVideo() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-9">
      <div
        className="grid items-center gap-6 rounded px-6 py-8 sm:grid-cols-[1fr_260px] sm:px-10"
        style={{ background: "linear-gradient(135deg, rgba(11,61,58,0.06), rgba(212,175,55,0.08))" }}
      >
        <div className="text-center sm:text-left">
          <span className="mb-3 inline-block rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-[11.5px] font-bold tracking-wide text-teal">
            30초 소개 영상
          </span>
          <h2 className="mb-2 text-[20px] font-extrabold tracking-tight text-ink sm:text-[22px]">
            덴트잡2804는 이렇게 다릅니다
          </h2>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            서울·경기 치과와 치과기공소만을 위한 채용 플랫폼, 짧은 영상으로 먼저 확인해보세요.
          </p>
        </div>
        <div className="mx-auto w-full max-w-[220px]">
          <video
            controls
            playsInline
            poster="/dentjob-demo-poster.jpg"
            className="aspect-[9/16] w-full rounded-lg border border-line/60 bg-black object-cover shadow-lg"
          >
            <source src="/dentjob-demo.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
