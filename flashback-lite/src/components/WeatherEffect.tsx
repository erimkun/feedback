"use client";

import SnowEffect from "@/components/SnowEffect";
import RainEffect from "@/components/RainEffect";
import SunEffect from "@/components/SunEffect";
import { WeatherType } from "@/lib/weather";

export default function WeatherEffect({ type }: { type: WeatherType }) {
    if (type === 'rain') return <RainEffect />;
    if (type === 'sun') return <SunEffect />;
    return <SnowEffect />;
}
