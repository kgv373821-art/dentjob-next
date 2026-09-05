export default function HeroVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/hero-video-poster.jpg"
      className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
    >
      <source src="/hero-video.mp4" type="video/mp4" />
    </video>
  );
}
