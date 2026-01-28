"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getMonthlyProgress, MonthlyTarget } from "@/app/actions/admin";

export default function TargetProgress() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MonthlyTarget | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() + 1 };
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const progress = await getMonthlyProgress(selectedMonth.year, selectedMonth.month);
            setData(progress);
        } catch (error) {
            console.error("Failed to load progress:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const getProgressColor = (actual: number, target: number, higherIsBetter = true) => {
        const ratio = actual / target;
        if (higherIsBetter) {
            if (ratio >= 1) return "bg-green-500";
            if (ratio >= 0.8) return "bg-yellow-500";
            return "bg-red-500";
        } else {
            if (ratio <= 1) return "bg-green-500";
            if (ratio <= 1.2) return "bg-yellow-500";
            return "bg-red-500";
        }
    };

    const getProgressWidth = (actual: number, target: number) => {
        const ratio = (actual / target) * 100;
        return Math.min(ratio, 100);
    };

    const months = [
        { value: 1, label: "Ocak" },
        { value: 2, label: "Şubat" },
        { value: 3, label: "Mart" },
        { value: 4, label: "Nisan" },
        { value: 5, label: "Mayıs" },
        { value: 6, label: "Haziran" },
        { value: 7, label: "Temmuz" },
        { value: 8, label: "Ağustos" },
        { value: 9, label: "Eylül" },
        { value: 10, label: "Ekim" },
        { value: 11, label: "Kasım" },
        { value: 12, label: "Aralık" },
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
                Aylık Hedef Takibi
            </h3>

            {/* Month/Year Selector */}
            <div className="flex gap-3 mb-6">
                <select
                    value={selectedMonth.month}
                    onChange={(e) => setSelectedMonth(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                    {months.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
                <select
                    value={selectedMonth.year}
                    onChange={(e) => setSelectedMonth(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-500 mb-1">
                            {format(new Date(selectedMonth.year, selectedMonth.month - 1), "MMMM yyyy", { locale: tr })}
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{data.totalFeedbacks}</div>
                        <div className="text-sm text-gray-500">Toplam Geri Bildirim</div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4">
                        {/* NPS Target */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">NPS Skoru</span>
                                <span className="text-gray-500">
                                    <span className="font-bold text-gray-900">{data.actualNps}</span> / {data.targetNps}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(data.actualNps + 100, data.targetNps + 100)}`}
                                    style={{ width: `${getProgressWidth(data.actualNps + 100, data.targetNps + 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Hedef: {data.targetNps}</span>
                                <span className={data.actualNps >= data.targetNps ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                    {data.actualNps >= data.targetNps ? "✓ Hedefe ulaşıldı" : `${data.targetNps - data.actualNps} puan kaldı`}
                                </span>
                            </div>
                        </div>

                        {/* Avg Rating Target */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">Ortalama Puan</span>
                                <span className="text-gray-500">
                                    <span className="font-bold text-gray-900">{data.actualAvgRating.toFixed(2)}</span> / {data.targetAvgRating.toFixed(1)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(data.actualAvgRating, data.targetAvgRating)}`}
                                    style={{ width: `${getProgressWidth(data.actualAvgRating, data.targetAvgRating)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Hedef: {data.targetAvgRating.toFixed(1)}</span>
                                <span className={data.actualAvgRating >= data.targetAvgRating ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                    {data.actualAvgRating >= data.targetAvgRating ? "✓ Hedefe ulaşıldı" : `${(data.targetAvgRating - data.actualAvgRating).toFixed(2)} puan kaldı`}
                                </span>
                            </div>
                        </div>

                        {/* Positive Rate Target */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">Olumlu Oran</span>
                                <span className="text-gray-500">
                                    <span className="font-bold text-gray-900">{data.actualPositiveRate.toFixed(1)}%</span> / {data.targetPositiveRate}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(data.actualPositiveRate, data.targetPositiveRate)}`}
                                    style={{ width: `${getProgressWidth(data.actualPositiveRate, data.targetPositiveRate)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Hedef: %{data.targetPositiveRate}</span>
                                <span className={data.actualPositiveRate >= data.targetPositiveRate ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                    {data.actualPositiveRate >= data.targetPositiveRate ? "✓ Hedefe ulaşıldı" : `%${(data.targetPositiveRate - data.actualPositiveRate).toFixed(1)} kaldı`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Overall Status */}
                    <div className={`rounded-lg p-4 text-center ${
                        data.actualNps >= data.targetNps && data.actualAvgRating >= data.targetAvgRating && data.actualPositiveRate >= data.targetPositiveRate
                            ? "bg-green-50 border border-green-200"
                            : "bg-yellow-50 border border-yellow-200"
                    }`}>
                        <div className="text-2xl mb-1">
                            {data.actualNps >= data.targetNps && data.actualAvgRating >= data.targetAvgRating && data.actualPositiveRate >= data.targetPositiveRate
                                ? "🎉"
                                : "📊"}
                        </div>
                        <div className="font-medium">
                            {data.actualNps >= data.targetNps && data.actualAvgRating >= data.targetAvgRating && data.actualPositiveRate >= data.targetPositiveRate
                                ? "Tüm hedeflere ulaşıldı!"
                                : "Hedeflere ulaşmak için çalışmaya devam!"}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-8">
                    Veri yüklenemedi
                </div>
            )}
        </div>
    );
}
