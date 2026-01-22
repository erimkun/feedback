"use client";

import { useEffect, useState } from "react";

interface Snowflake {
    id: number;
    left: string;
    animationDuration: string;
    opacity: number;
    size: string;
}

export default function SnowEffect() {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

    useEffect(() => {
        // Generate snowflakes only on client side to avoid hydration mismatch
        const flakes = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 2}s`, // 2-5 seconds
            opacity: Math.random(),
            size: `${Math.random() * 4 + 2}px`, // 2-6px
        }));
        setSnowflakes(flakes);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-[-10px] bg-white rounded-full animate-snowfall"
                    style={{
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        animationDuration: flake.animationDuration,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}
        </div>
    );
}
