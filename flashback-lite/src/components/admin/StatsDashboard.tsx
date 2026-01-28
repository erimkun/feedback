"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { getAdvancedStats, getOfficeList, AdvancedStats } from "@/app/actions/admin";

type TimeRange = "7d" | "30d" | "thisMonth" | "lastMonth" | "90d" | "all";

const COLORS = {
    positive: "#22c55e",
    neutral: "#f59e0b",
    negative: "#ef4444",
    primary: "#3b82f6",
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function StatsDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AdvancedStats | null>(null);
    const [offices, setOffices] = useState<string[]>([]);
    const [selectedOffice, setSelectedOffice] = useState<string>("all");
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    const getDateRange = (range: TimeRange): { start: string; end: string } => {
        const today = new Date();
        const end = format(today, "yyyy-MM-dd");

        switch (range) {
            case "7d":
                return { start: format(subDays(today, 7), "yyyy-MM-dd"), end };
            case "30d":
                return { start: format(subDays(today, 30), "yyyy-MM-dd"), end };
            case "thisMonth":
                return { start: format(startOfMonth(today), "yyyy-MM-dd"), end };
            case "lastMonth":
                const lastMonth = subMonths(today, 1);
                return {
                    start: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
                    end: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
                };
            case "90d":
                return { start: format(subDays(today, 90), "yyyy-MM-dd"), end };
            case "all":
                return { start: "", end: "" };
            default:
                return { start: format(subDays(today, 30), "yyyy-MM-dd"), end };
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const officeList = await getOfficeList();
            setOffices(officeList);

            const { start, end } = getDateRange(timeRange);
            const data = await getAdvancedStats(start || undefined, end || undefined, selectedOffice);
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [timeRange, selectedOffice]);

    const pieData = stats
        ? [
              { name: "Olumlu (4-5)", value: stats.positiveCount },
              { name: "Nötr (3)", value: stats.neutralCount },
              { name: "Olumsuz (1-2)", value: stats.negativeCount },
          ]
        : [];

    const formatDateLabel = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd MMM", { locale: tr });
        } catch {
            return dateStr;
        }
    };

    if (loading && !stats) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Zaman Aralığı</label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="7d">Son 7 Gün</option>
                            <option value="30d">Son 30 Gün</option>
                            <option value="thisMonth">Bu Ay</option>
                            <option value="lastMonth">Geçen Ay</option>
                            <option value="90d">Son 90 Gün</option>
                            <option value="all">Tüm Zamanlar</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ofis</label>
                        <select
                            value={selectedOffice}
                            onChange={(e) => setSelectedOffice(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="all">Tüm Ofisler</option>
                            {offices.map((office) => (
                                <option key={office} value={office}>
                                    {office}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
                    >
                        {loading ? "Yükleniyor..." : "Yenile"}
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Toplam</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Tamamlanan</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.used || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Ort. Puan</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.averageRating.toFixed(1) || "0.0"}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Olumlu</h3>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats?.positiveCount || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Nötr</h3>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.neutralCount || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Olumsuz</h3>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats?.negativeCount || 0}</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time Series Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Zaman İçinde Değişim</h3>
                    {stats?.timeSeriesData && stats.timeSeriesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={formatDateLabel}
                                    fontSize={12}
                                />
                                <YAxis fontSize={12} />
                                <Tooltip 
                                    labelFormatter={(label) => format(new Date(label), "dd MMMM yyyy", { locale: tr })}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="positiveCount"
                                    name="Olumlu"
                                    stroke={COLORS.positive}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="negativeCount"
                                    name="Olumsuz"
                                    stroke={COLORS.negative}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Bu dönem için veri bulunamadı
                        </div>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Puan Dağılımı</h3>
                    {stats && (stats.positiveCount + stats.neutralCount + stats.negativeCount) > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Bu dönem için veri bulunamadı
                        </div>
                    )}
                </div>
            </div>

            {/* Average Rating Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ortalama Puan Trendi</h3>
                {stats?.timeSeriesData && stats.timeSeriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={stats.timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDateLabel}
                                fontSize={12}
                            />
                            <YAxis domain={[0, 5]} fontSize={12} />
                            <Tooltip 
                                labelFormatter={(label) => format(new Date(label), "dd MMMM yyyy", { locale: tr })}
                                formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="avgRating"
                                name="Ort. Puan"
                                stroke={COLORS.primary}
                                strokeWidth={3}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                        Bu dönem için veri bulunamadı
                    </div>
                )}
            </div>

            {/* Office Stats */}
            {stats?.officeStats && stats.officeStats.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ofis Bazlı İstatistikler</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.officeStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" fontSize={12} />
                                <YAxis dataKey="office" type="category" fontSize={12} width={100} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" name="Toplam Değerlendirme" fill={COLORS.primary} />
                                <Bar dataKey="positiveCount" name="Olumlu" fill={COLORS.positive} />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Ofis</th>
                                        <th className="px-4 py-2 text-center font-medium text-gray-700">Değerlendirme</th>
                                        <th className="px-4 py-2 text-center font-medium text-gray-700">Ort. Puan</th>
                                        <th className="px-4 py-2 text-center font-medium text-gray-700">Olumlu %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.officeStats.map((office) => (
                                        <tr key={office.office}>
                                            <td className="px-4 py-2 font-medium text-gray-900">{office.office}</td>
                                            <td className="px-4 py-2 text-center text-gray-600">{office.count}</td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`font-medium ${
                                                    office.avgRating >= 4 ? "text-green-600" :
                                                    office.avgRating >= 3 ? "text-yellow-600" : "text-red-600"
                                                }`}>
                                                    {office.avgRating.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`font-medium ${
                                                    (office.positiveCount / office.count * 100) >= 70 ? "text-green-600" :
                                                    (office.positiveCount / office.count * 100) >= 50 ? "text-yellow-600" : "text-red-600"
                                                }`}>
                                                    {((office.positiveCount / office.count) * 100).toFixed(0)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
