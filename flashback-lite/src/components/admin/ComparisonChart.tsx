"use client";

import { useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getComparisonStats, getOfficeList } from "@/app/actions/admin";

type ComparisonPeriod = "lastWeek" | "lastMonth" | "lastQuarter" | "custom";

interface ComparisonResult {
    period1: {
        label: string;
        avgRating: number;
        npsScore: number;
        positiveRate: number;
        total: number;
    };
    period2: {
        label: string;
        avgRating: number;
        npsScore: number;
        positiveRate: number;
        total: number;
    };
    changes: {
        avgRatingChange: number;
        npsChange: number;
        positiveRateChange: number;
        volumeChange: number;
    };
}

export default function ComparisonChart() {
    const [loading, setLoading] = useState(false);
    const [comparisonType, setComparisonType] = useState<ComparisonPeriod>("lastMonth");
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const [office, setOffice] = useState("all");
    const [offices, setOffices] = useState<string[]>([]);

    const loadOffices = async () => {
        const officeList = await getOfficeList();
        setOffices(officeList);
    };

    const getPeriodDates = (type: ComparisonPeriod) => {
        const today = new Date();
        
        switch (type) {
            case "lastWeek": {
                // This week vs last week
                const thisWeekEnd = today;
                const thisWeekStart = subDays(today, 6);
                const lastWeekEnd = subDays(today, 7);
                const lastWeekStart = subDays(today, 13);
                return {
                    period1: { start: lastWeekStart, end: lastWeekEnd, label: "Geçen Hafta" },
                    period2: { start: thisWeekStart, end: thisWeekEnd, label: "Bu Hafta" },
                };
            }
            case "lastMonth": {
                // This month vs last month
                const thisMonthStart = startOfMonth(today);
                const thisMonthEnd = today;
                const lastMonth = subMonths(today, 1);
                const lastMonthStart = startOfMonth(lastMonth);
                const lastMonthEnd = endOfMonth(lastMonth);
                return {
                    period1: { start: lastMonthStart, end: lastMonthEnd, label: format(lastMonth, "MMMM yyyy", { locale: tr }) },
                    period2: { start: thisMonthStart, end: thisMonthEnd, label: format(today, "MMMM yyyy", { locale: tr }) },
                };
            }
            case "lastQuarter": {
                // This 90 days vs previous 90 days
                const period2End = today;
                const period2Start = subDays(today, 89);
                const period1End = subDays(today, 90);
                const period1Start = subDays(today, 179);
                return {
                    period1: { start: period1Start, end: period1End, label: "Önceki 90 Gün" },
                    period2: { start: period2Start, end: period2End, label: "Son 90 Gün" },
                };
            }
            default:
                return null;
        }
    };

    const handleCompare = async () => {
        setLoading(true);
        try {
            await loadOffices();
            const periods = getPeriodDates(comparisonType);
            if (!periods) return;

            const data = await getComparisonStats(
                format(periods.period1.start, "yyyy-MM-dd"),
                format(periods.period1.end, "yyyy-MM-dd"),
                format(periods.period2.start, "yyyy-MM-dd"),
                format(periods.period2.end, "yyyy-MM-dd"),
                office
            );

            const p1PositiveRate = data.period1.used > 0 
                ? (data.period1.positiveCount / data.period1.used) * 100 : 0;
            const p2PositiveRate = data.period2.used > 0 
                ? (data.period2.positiveCount / data.period2.used) * 100 : 0;

            setResult({
                period1: {
                    label: periods.period1.label,
                    avgRating: data.period1.averageRating,
                    npsScore: data.period1.npsScore,
                    positiveRate: p1PositiveRate,
                    total: data.period1.used,
                },
                period2: {
                    label: periods.period2.label,
                    avgRating: data.period2.averageRating,
                    npsScore: data.period2.npsScore,
                    positiveRate: p2PositiveRate,
                    total: data.period2.used,
                },
                changes: data.comparison,
            });
        } catch (error) {
            console.error("Comparison error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getChangeColor = (value: number) => {
        if (value > 0) return "text-green-600";
        if (value < 0) return "text-red-600";
        return "text-gray-600";
    };

    const getChangeIcon = (value: number) => {
        if (value > 0) return "↑";
        if (value < 0) return "↓";
        return "→";
    };

    const chartData = result ? [
        { name: "Ort. Puan", [result.period1.label]: result.period1.avgRating, [result.period2.label]: result.period2.avgRating },
        { name: "Olumlu %", [result.period1.label]: result.period1.positiveRate, [result.period2.label]: result.period2.positiveRate },
    ] : [];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Dönem Karşılaştırması
            </h3>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select
                    value={comparisonType}
                    onChange={(e) => setComparisonType(e.target.value as ComparisonPeriod)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                    <option value="lastWeek">Haftalık Karşılaştırma</option>
                    <option value="lastMonth">Aylık Karşılaştırma</option>
                    <option value="lastQuarter">Çeyreklik Karşılaştırma</option>
                </select>

                <select
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tüm Ofisler</option>
                    {offices.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>

                <button
                    onClick={handleCompare}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
                >
                    {loading ? "Karşılaştırılıyor..." : "Karşılaştır"}
                </button>
            </div>

            {result && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-500 mb-1">Ort. Puan Değişimi</div>
                            <div className={`text-2xl font-bold ${getChangeColor(result.changes.avgRatingChange)}`}>
                                {getChangeIcon(result.changes.avgRatingChange)} {result.changes.avgRatingChange > 0 ? "+" : ""}{result.changes.avgRatingChange.toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-500 mb-1">NPS Değişimi</div>
                            <div className={`text-2xl font-bold ${getChangeColor(result.changes.npsChange)}`}>
                                {getChangeIcon(result.changes.npsChange)} {result.changes.npsChange > 0 ? "+" : ""}{result.changes.npsChange}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-500 mb-1">Olumlu % Değişimi</div>
                            <div className={`text-2xl font-bold ${getChangeColor(result.changes.positiveRateChange)}`}>
                                {getChangeIcon(result.changes.positiveRateChange)} {result.changes.positiveRateChange > 0 ? "+" : ""}{result.changes.positiveRateChange.toFixed(1)}%
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-500 mb-1">Hacim Değişimi</div>
                            <div className={`text-2xl font-bold ${getChangeColor(result.changes.volumeChange)}`}>
                                {getChangeIcon(result.changes.volumeChange)} {result.changes.volumeChange > 0 ? "+" : ""}{result.changes.volumeChange}
                            </div>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Metrik</th>
                                    <th className="px-4 py-2 text-center">{result.period1.label}</th>
                                    <th className="px-4 py-2 text-center">{result.period2.label}</th>
                                    <th className="px-4 py-2 text-center">Değişim</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="px-4 py-3 font-medium">Toplam Feedback</td>
                                    <td className="px-4 py-3 text-center">{result.period1.total}</td>
                                    <td className="px-4 py-3 text-center">{result.period2.total}</td>
                                    <td className={`px-4 py-3 text-center font-medium ${getChangeColor(result.changes.volumeChange)}`}>
                                        {result.changes.volumeChange > 0 ? "+" : ""}{result.changes.volumeChange}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Ortalama Puan</td>
                                    <td className="px-4 py-3 text-center">{result.period1.avgRating.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center">{result.period2.avgRating.toFixed(2)}</td>
                                    <td className={`px-4 py-3 text-center font-medium ${getChangeColor(result.changes.avgRatingChange)}`}>
                                        {result.changes.avgRatingChange > 0 ? "+" : ""}{result.changes.avgRatingChange.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">NPS Skoru</td>
                                    <td className="px-4 py-3 text-center">{result.period1.npsScore}</td>
                                    <td className="px-4 py-3 text-center">{result.period2.npsScore}</td>
                                    <td className={`px-4 py-3 text-center font-medium ${getChangeColor(result.changes.npsChange)}`}>
                                        {result.changes.npsChange > 0 ? "+" : ""}{result.changes.npsChange}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Olumlu Oran</td>
                                    <td className="px-4 py-3 text-center">{result.period1.positiveRate.toFixed(1)}%</td>
                                    <td className="px-4 py-3 text-center">{result.period2.positiveRate.toFixed(1)}%</td>
                                    <td className={`px-4 py-3 text-center font-medium ${getChangeColor(result.changes.positiveRateChange)}`}>
                                        {result.changes.positiveRateChange > 0 ? "+" : ""}{result.changes.positiveRateChange.toFixed(1)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bar Chart */}
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={result.period1.label} fill="#94a3b8" />
                            <Bar dataKey={result.period2.label} fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </>
            )}

            {!result && !loading && (
                <div className="text-center text-gray-500 py-8">
                    Karşılaştırma yapmak için yukarıdan dönem seçin ve &quot;Karşılaştır&quot; butonuna tıklayın.
                </div>
            )}
        </div>
    );
}
