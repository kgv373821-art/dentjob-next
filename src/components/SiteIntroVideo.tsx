export default function SiteIntroVideo() {
  return (
    <div className="overflow-hidden rounded-[3px] border border-line bg-white">
      <div className="px-3.5 pb-2.5 pt-3 text-center">
        <span className="mb-1.5 inline-block rounded-full border border-teal/40 bg-teal/10 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-teal">
          30초 소개 영상
        </span>
        <p className="text-[13px] font-extrabold tracking-tight text-ink">덴트잡2804는 이렇게 다릅니다</p>
      </div>
      <div className="px-3.5 pb-3.5">
        <video
          controls
          playsInline
          preload="metadata"
          poster="/dentjob-demo-poster.jpg"
          className="mx-auto aspect-[9/16] w-full max-w-[200px] rounded-md border border-line/60 bg-black object-cover shadow"
        >
          <source src="/dentjob-demo.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
