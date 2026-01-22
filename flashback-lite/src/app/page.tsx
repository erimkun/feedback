import Image from "next/image";
import WeatherEffect from "@/components/WeatherEffect";
import ParticlesCanvas from "@/components/ParticlesCanvas";
import { getWeather, WeatherType } from "@/lib/weather";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ weather?: string }>;
}) {
  const { weather: weatherParam } = await searchParams;
  let weather: WeatherType = "sun";

  if (weatherParam === "rain" || weatherParam === "snow" || weatherParam === "sun") {
    weather = weatherParam as WeatherType;
  } else {
    weather = await getWeather();
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#d63417] via-[#e84c3d] to-[#c0392b]">
      <WeatherEffect type={weather} />
      <ParticlesCanvas />

      {/* Ambient Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-white/20 to-white/5 blur-[120px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Centered Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex h-80 w-80 items-center justify-center">
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-white/30 blur-[60px] rounded-full animate-pulse"></div>

          <Image
            src="/logo.png"
            alt="Üsküdar Yenileniyor"
            width={200}
            height={200}
            className="object-contain drop-shadow-2xl"
            style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
            priority
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 p-8 text-center w-full z-10">
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
          © 2026 Üsküdar Belediyesi Kentsel Dönüşüm Müdürlüğü
        </p>
      </footer>
    </div>
  );
}
