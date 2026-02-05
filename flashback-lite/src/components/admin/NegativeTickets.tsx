"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getNegativeFeedbacks, getOfficeList } from "@/app/actions/admin";

interface NegativeFeedback {
    id: string;
    target_name: string;
    phone: string | null;
    rating: number | null;
    comment: string | null;
    office: string | null;
    created_at: string;
}

interface NegativeTicketsProps {
    onClose?: () => void;
}

export default function NegativeTickets({ onClose }: NegativeTicketsProps) {
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState<NegativeFeedback[]>([]);
    const [offices, setOffices] = useState<string[]>([]);
    const [selectedOffice, setSelectedOffice] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [officeList, negativeFb] = await Promise.all([
                getOfficeList(),
                getNegativeFeedbacks(undefined, undefined, selectedOffice),
            ]);
            setOffices(officeList);
            setFeedbacks(negativeFb);
        } catch (error) {
            console.error("Failed to load negative feedbacks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedOffice]);

    const getRatingEmoji = (rating: number | null) => {
        if (rating === 1) return "😢";
        if (rating === 2) return "😕";
        return "😐";
    };

    const getRatingLabel = (rating: number | null) => {
        if (rating === 1) return "Çok Kötü";
        if (rating === 2) return "Kötü";
        return "Bilinmiyor";
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    Olumsuz Geri Bildirimler
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                        {feedbacks.length}
                    </span>
                </h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <select
                    value={selectedOffice}
                    onChange={(e) => setSelectedOffice(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tüm Ofisler</option>
                    {offices.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                    🔄 Yenile
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-gray-600 font-medium">Harika! Olumsuz geri bildirim yok.</div>
                    <div className="text-gray-400 text-sm">Tüm kullanıcılar memnun görünüyor.</div>
                </div>
            ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {feedbacks.map((fb) => (
                        <div
                            key={fb.id}
                            className="border border-red-100 bg-red-50 rounded-lg overflow-hidden transition hover:border-red-200"
                        >
                            {/* Header */}
                            <button
                                onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)}
                                className="w-full p-4 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{getRatingEmoji(fb.rating)}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{fb.target_name}</div>
                                        {fb.phone && (
                                            <div className="text-sm text-gray-600 font-mono mb-0.5">{fb.phone}</div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{fb.office || "Ofis belirtilmemiş"}</span>
                                            <span>•</span>
                                            <span>{format(new Date(fb.created_at), "dd MMM yyyy HH:mm", { locale: tr })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        fb.rating === 1 ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                                    }`}>
                                        ★ {fb.rating} - {getRatingLabel(fb.rating)}
                                    </div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className={`w-5 h-5 transition ${expandedId === fb.id ? "rotate-180" : ""}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {expandedId === fb.id && (
                                <div className="px-4 pb-4 border-t border-red-100">
                                    <div className="mt-3">
                                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Yorum</div>
                                        <div className="bg-white rounded-lg p-3 text-gray-700">
                                            {fb.comment || <span className="text-gray-400 italic">Yorum yapılmamış</span>}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex gap-2">
                                        {fb.phone ? (
                                            <a 
                                                href={`tel:${fb.phone}`}
                                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                                </svg>
                                                Ara ({fb.phone})
                                            </a>
                                        ) : (
                                            <button disabled className="flex-1 px-3 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                                Numara Yok
                                            </button>
                                        )}
                                        <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            Çözüldü
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {feedbacks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Toplam olumsuz geri bildirim:</span>
                        <span className="font-bold text-red-600">{feedbacks.length}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">1 yıldız:</span>
                        <span className="font-bold text-red-600">{feedbacks.filter(f => f.rating === 1).length}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">2 yıldız:</span>
                        <span className="font-bold text-orange-600">{feedbacks.filter(f => f.rating === 2).length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
