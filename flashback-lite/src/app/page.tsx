import Image from "next/image";
import WeatherEffect from "@/components/WeatherEffect";
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#f6f6f8] dark:bg-[#101622]">
      <WeatherEffect type={weather} />

      {/* Ambient Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#135bec]/10 to-purple-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Centered Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex h-80 w-80 items-center justify-center">
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-[#135bec]/20 blur-[60px] rounded-full animate-pulse"></div>

          <Image
            src="/uskkenttaswhite.png"
            alt="Flashback"
            width={400}
            height={400}
            className="object-contain animate-breathe drop-shadow-2xl"
            style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
