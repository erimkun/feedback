export type WeatherType = 'sun' | 'rain' | 'snow';

export async function getWeather(): Promise<WeatherType> {
    try {
        // Üsküdar Coordinates: 41.0264° N, 29.0156° E
        const res = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=41.0264&longitude=29.0156&current=weather_code",
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();
        const code = data.current.weather_code;

        // Direct mapping of WMO codes
        // 0, 1, 2, 3: Clear/Cloudy -> Sun/Butterflies
        // 51-67, 80-82: Drizzle/Rain -> Rain
        // 71-77, 85-86: Snow -> Snow
        // Others (Thunderstorm etc) -> Rain as fallback

        if (code >= 71 && code <= 77) return 'snow';
        if (code >= 85 && code <= 86) return 'snow';

        if (code >= 51 && code <= 67) return 'rain';
        if (code >= 80 && code <= 82) return 'rain';
        if (code >= 95) return 'rain'; // Thunderstorm

        return 'sun';
    } catch (error) {
        console.error("Weather error:", error);
        return 'sun'; // Default to sun/nice weather
    }
}
