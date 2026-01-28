"use client";

import { useState } from "react";
import CreateLinkForm from "@/components/admin/CreateLinkForm";
import BulkUpload from "@/components/admin/BulkUpload";
import StatsDashboard from "@/components/admin/StatsDashboard";
import FeedbackRow from "@/components/admin/FeedbackRow";
import FeedbackCard from "@/components/admin/FeedbackCard";

type Tab = "links" | "stats";

interface AdminTabsProps {
    recentFeedback: {
        id: string;
        targetName: string;
        rating: number | null;
        comment: string | null;
        createdAt: string;
    }[];
}

export default function AdminTabs({ recentFeedback }: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState<Tab>("links");

    return (
        <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 md:px-0">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
                <button
                    onClick={() => setActiveTab("links")}
                    className={`flex-1 px-4 py-3 rounded-md font-medium text-sm transition ${
                        activeTab === "links"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                        </svg>
                        Link Yönetimi
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("stats")}
                    className={`flex-1 px-4 py-3 rounded-md font-medium text-sm transition ${
                        activeTab === "stats"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                        İstatistikler
                    </span>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "links" && (
                <div className="space-y-6 md:space-y-8">
                    {/* Create Link Section */}
                    <CreateLinkForm />

                    {/* Bulk Upload Section */}
                    <BulkUpload />

                    {/* Recent Feedback Section - Desktop Table */}
                    <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Son Gelen Geri Bildirimler</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-gray-700">İsim</th>
                                        <th className="px-6 py-3 font-medium text-gray-700">Puan</th>
                                        <th className="px-6 py-3 font-medium text-gray-700">Yorum</th>
                                        <th className="px-6 py-3 font-medium text-gray-700">Tarih</th>
                                        <th className="px-6 py-3 font-medium text-gray-700 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentFeedback.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                Henüz geri bildirim yok.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentFeedback.map((item) => (
                                            <FeedbackRow key={item.id} item={item} />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Feedback Section - Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Son Gelen Geri Bildirimler</h3>
                        {recentFeedback.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                                Henüz geri bildirim yok.
                            </div>
                        ) : (
                            recentFeedback.map((item) => (
                                <FeedbackCard key={item.id} item={item} />
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === "stats" && (
                <StatsDashboard />
            )}
        </div>
    );
}
