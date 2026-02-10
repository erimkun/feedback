"use client";

interface NpsGaugeProps {
    score: number;
    promoters: number;
    passives: number;
    detractors: number;
    total: number;
}

export default function NpsGauge({ score, promoters, passives, detractors, total }: NpsGaugeProps) {
    // NPS ranges from -100 to 100
    // Color coding: <0 = red, 0-30 = yellow, 30-70 = light green, >70 = green
    const getColor = (nps: number) => {
        if (nps < 0) return "#ef4444";
        if (nps < 30) return "#f59e0b";
        if (nps < 70) return "#84cc16";
        return "#22c55e";
    };

    const getLabel = (nps: number) => {
        if (nps < 0) return "Kritik";
        if (nps < 30) return "İyileştirme Gerekli";
        if (nps < 70) return "İyi";
        return "Mükemmel";
    };

    // Calculate percentages
    const promoterPct = total > 0 ? Math.round((promoters / total) * 100) : 0;
    const passivePct = total > 0 ? Math.round((passives / total) * 100) : 0;
    const detractorPct = total > 0 ? Math.round((detractors / total) * 100) : 0;

    // Gauge angle calculation (180 degrees for semicircle)
    // -100 = -90deg, 0 = 0deg, 100 = 90deg
    const angle = (score / 100) * 90;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative group">
            {/* Info Tooltip */}
            <div className="absolute top-6 right-6">
                <div className="relative group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <div className="absolute right-0 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 top-6">
                        <strong className="block mb-1 text-yellow-400">NPS Nedir?</strong>
                        Net Tavsiye Skoru (NPS), müşteri memnuniyetini ölçen bir metriktir.
                        Hesaplama: (Destekleyenler % - Kötüleyenler %)
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                Net Tavsiye Skoru (NPS)
            </h3>

            <div className="flex flex-col items-center">
                {/* Gauge */}
                <div className="relative w-48 h-24 mb-4">
                    {/* Background arc */}
                    <svg className="w-full h-full" viewBox="0 0 200 100">
                        {/* Background gradient arc */}
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="33%" stopColor="#f59e0b" />
                                <stop offset="66%" stopColor="#84cc16" />
                                <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M 10 90 A 80 80 0 0 1 190 90"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="16"
                            strokeLinecap="round"
                        />
                        {/* Needle */}
                        <line
                            x1="100"
                            y1="90"
                            x2="100"
                            y2="20"
                            stroke="#1f2937"
                            strokeWidth="3"
                            strokeLinecap="round"
                            transform={`rotate(${angle}, 100, 90)`}
                        />
                        {/* Center circle */}
                        <circle cx="100" cy="90" r="8" fill="#1f2937" />
                    </svg>

                    {/* Labels */}
                    <div className="absolute bottom-0 left-0 text-xs text-gray-500">-100</div>
                    <div className="absolute bottom-0 right-0 text-xs text-gray-500">+100</div>
                </div>

                {/* Score display */}
                <div className="text-center mb-4">
                    <div className="text-5xl font-bold" style={{ color: getColor(score) }}>
                        {score > 0 ? `+${score}` : score}
                    </div>
                    <div className="text-sm font-medium mt-1" style={{ color: getColor(score) }}>
                        {getLabel(score)}
                    </div>
                </div>

                {/* Breakdown */}
                <div className="w-full grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{promoterPct}%</div>
                        <div className="text-xs text-green-700">Destekleyenler (5)</div>
                        <div className="text-xs text-gray-500">{promoters} kişi</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-yellow-600">{passivePct}%</div>
                        <div className="text-xs text-yellow-700">Pasifler (3-4)</div>
                        <div className="text-xs text-gray-500">{passives} kişi</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-red-600">{detractorPct}%</div>
                        <div className="text-xs text-red-700">Kötüleyenler (1-2)</div>
                        <div className="text-xs text-gray-500">{detractors} kişi</div>
                    </div>
                </div>

                {/* Formula explanation */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                    NPS = % Destekleyenler - % Kötüleyenler = {promoterPct}% - {detractorPct}% = <strong>{score}</strong>
                </div>
            </div>
        </div>
    );
}
