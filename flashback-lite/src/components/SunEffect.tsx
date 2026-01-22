"use client";

import { useEffect, useState } from "react";

interface Butterfly {
    id: number;
    left: string;
    top: string;
    animationDuration: string;
    scale: number;
    delay: string;
}

export default function SunEffect() {
    const [butterflies, setButterflies] = useState<Butterfly[]>([]);

    useEffect(() => {
        // Fewer elements, gentle movement
        const items = Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${10 + Math.random() * 10}s`, // Slow: 10-20s
            scale: 0.5 + Math.random() * 0.5,
            delay: `${Math.random() * 5}s`
        }));
        setButterflies(items);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Sun Element */}
            <div className="absolute top-10 right-10 pointer-events-auto">
                {/* Glow Behind */}
                <div className="absolute inset-0 bg-yellow-400/30 blur-[40px] rounded-full animate-pulse-slow"></div>

                {/* Sun Emoji */}
                <div className="relative text-[100px] leading-none select-none animate-spin-slow" style={{ animationDuration: '60s' }}>
                    ☀️
                </div>
            </div>

            {butterflies.map((b) => (
                <div
                    key={b.id}
                    className="absolute animate-butterfly"
                    style={{
                        left: b.left,
                        top: b.top,
                        transform: `scale(${b.scale})`,
                        animationDuration: b.animationDuration,
                        animationDelay: b.delay,
                    }}
                >
                    {/* CSS Butterfly Shape */}
                    <div className="relative w-4 h-4">
                        <div className="absolute left-0 top-0 w-2 h-3 bg-white/60 rounded-full rotate-[30deg] animate-wing-left"></div>
                        <div className="absolute right-0 top-0 w-2 h-3 bg-white/60 rounded-full rotate-[-30deg] animate-wing-right"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
