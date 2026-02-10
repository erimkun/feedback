"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { getComments, getOfficeList } from "@/app/actions/admin";

interface CommentItem {
    id: string;
    target_name: string;
    phone: string | null;
    rating: number | null;
    comment: string | null;
    office: string | null;
    created_at: string;
}

interface Pagination {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export default function CommentsList() {
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [offices, setOffices] = useState<string[]>([]);

    // Filters
    const [page, setPage] = useState(1);
    const [selectedOffice, setSelectedOffice] = useState("all");
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState("30d");

    const loadData = async () => {
        setLoading(true);
        try {
            // Calculate date range
            let startDate = "";
            let endDate = format(new Date(), "yyyy-MM-dd");

            if (dateRange === "7d") startDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
            else if (dateRange === "30d") startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
            else if (dateRange === "90d") startDate = format(subDays(new Date(), 90), "yyyy-MM-dd");
            // "all" leaves startDate empty

            const [officeList, data] = await Promise.all([
                getOfficeList(),
                getComments(page, 10, selectedOffice, search, startDate || undefined, endDate || undefined)
            ]);

            setOffices(officeList);
            setComments(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Failed to load comments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, selectedOffice, dateRange]); // Search is manual trigger usually, or debounced. Let's make it manual for now with button, or effect if we debounce.

    // Debounce search or use a button? Let's use a button for explicit search as requested "filtrelemelerin de olduğu".
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1
        loadData();
    };

    const getRatingBadge = (rating: number | null) => {
        if (!rating) return <span className="text-gray-400">-</span>;
        const colors = {
            1: "bg-red-100 text-red-700",
            2: "bg-orange-100 text-orange-700",
            3: "bg-yellow-100 text-yellow-700",
            4: "bg-blue-100 text-blue-700",
            5: "bg-green-100 text-green-700",
        };
        const colorClass = colors[rating as keyof typeof colors] || "bg-gray-100 text-gray-700";
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
                {rating}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Arama</label>
                        <input
                            type="text"
                            placeholder="İsim veya yorum ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ofis</label>
                        <select
                            value={selectedOffice}
                            onChange={(e) => { setSelectedOffice(e.target.value); setPage(1); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-[150px]"
                        >
                            <option value="all">Tüm Ofisler</option>
                            {offices.map((o) => (
                                <option key={o} value={o}>{o}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tarih</label>
                        <select
                            value={dateRange}
                            onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-[150px]"
                        >
                            <option value="7d">Son 7 Gün</option>
                            <option value="30d">Son 30 Gün</option>
                            <option value="90d">Son 90 Gün</option>
                            <option value="all">Tüm Zamanlar</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                        Filtrele
                    </button>

                    <button
                        type="button"
                        onClick={() => { setSearch(""); setSelectedOffice("all"); setDateRange("30d"); setPage(1); loadData(); }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                        Sıfırla
                    </button>
                </form>
            </div>

            {/* Comments List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-2">💬</div>
                        <div className="text-gray-600 font-medium">Yorum bulunamadı.</div>
                        <div className="text-gray-400 text-sm">Filtreleri değiştirmeyi deneyin.</div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {comments.map((comment) => (
                            <div key={comment.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900">{comment.target_name}</span>
                                            {getRatingBadge(comment.rating)}
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{format(new Date(comment.created_at), "dd MMM yyyy HH:mm", { locale: tr })}</span>
                                        </div>
                                        <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                            {comment.comment}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                                                </svg>
                                                {comment.office || "Ofis Yok"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                                </svg>
                                                {comment.phone || "Telefon Yok"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Toplam <span className="font-medium">{pagination.total}</span> yorumdan <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> - <span className="font-medium">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> arası gösteriliyor
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        Önceki
                                    </button>
                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === i + 1
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        Sonraki
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
