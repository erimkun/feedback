"use client";

import { useEffect, useState } from "react";

interface Raindrop {
    id: number;
    left: string;
    animationDuration: string;
    opacity: number;
    delay: string;
}

export default function RainEffect() {
    const [drops, setDrops] = useState<Raindrop[]>([]);

    useEffect(() => {
        const newDrops = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`, // Fast: 0.5-1s
            opacity: 0.3 + Math.random() * 0.3,
            delay: `${Math.random() * 2}s`
        }));
        setDrops(newDrops);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {drops.map((drop) => (
                <div
                    key={drop.id}
                    className="absolute top-[-20px] bg-blue-300 w-[1px] h-5 rounded-full animate-rain"
                    style={{
                        left: drop.left,
                        opacity: drop.opacity,
                        animationDuration: drop.animationDuration,
                        animationDelay: drop.delay,
                    }}
                />
            ))}
        </div>
    );
}
