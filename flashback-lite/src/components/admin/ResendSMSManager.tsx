"use client";

import { useState, useEffect, useCallback } from "react";
import { getNonRespondents, getNonRespondentsCount, resendBulkSMS, BulkSendResult } from "@/app/actions/admin";
import { useToast } from "@/components/admin/Toast";

interface NonRespondent {
    id: string;
    target_name: string;
    phone: string | null;
    office: string | null;
    created_at: Date | string; // Handle both Date object and ISO string
}

export default function ResendSMSManager() {
    const { showToast, showConfirm } = useToast();
    const [stats, setStats] = useState<{ count: number; loading: boolean }>({ count: 0, loading: true });
    const [customMessage, setCustomMessage] = useState("");
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState<BulkSendResult[]>([]);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

    // Selection state
    const [showSelection, setShowSelection] = useState(false);
    const [users, setUsers] = useState<NonRespondent[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const count = await getNonRespondentsCount();
            setStats({ count, loading: false });
        } catch (error) {
            console.error("Failed to load stats:", error);
            setStats({ count: 0, loading: false });
        }
    };

    const handleLoadUsers = async () => {
        setLoadingUsers(true);
        try {
            // Load all non-respondents
            const data = await getNonRespondents();
            setUsers(data);
            setShowSelection(true);
        } catch (error) {
            console.error("Failed to load users:", error);
            showToast("Kullanıcı listesi yüklenemedi.", "error");
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === users.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(users.map(u => u.id)));
        }
    };

    const processSend = useCallback(async (targetIds: string[], limit?: number) => {
        setProcessing(true);
        setResults([]);

        try {
            // If we didn't populate targetIds from selection (quick mode), fetch them first
            if (targetIds.length === 0) {
                const targets = await getNonRespondents(limit);
                if (targets.length === 0) {
                    showToast("Gönderilecek kimse bulunamadı.", "warning");
                    setProcessing(false);
                    return;
                }
                targetIds = targets.map(t => t.id);
            }

            setProgress({ current: 0, total: targetIds.length });

            // Batch processing
            const batchSize = 50;
            const total = targetIds.length;
            const allResults: BulkSendResult[] = [];

            for (let i = 0; i < total; i += batchSize) {
                const batchIds = targetIds.slice(i, i + batchSize);

                const response = await resendBulkSMS(batchIds, customMessage || undefined);
                allResults.push(...response.results);

                setProgress({ current: Math.min(i + batchSize, total), total });
            }

            setResults(allResults);
            const successCount = allResults.filter(r => r.success).length;
            showToast(`${successCount} SMS başarıyla gönderildi.`, "success");
            await loadStats(); // Refresh count
            if (showSelection) {
                // Refresh list to remove sent ones
                await handleLoadUsers();
                setSelectedIds(new Set());
            }

        } catch (error) {
            console.error("Bulk send error:", error);
            showToast("Bir hata oluştu.", "error");
        } finally {
            setProcessing(false);
            setProgress(null);
        }
    }, [customMessage, showSelection, showToast]);

    const handleSend = (limit?: number) => {
        let targetIds: string[] = [];

        // If manual selection mode is active and we have selected items, use them
        // BUT ONLY if we are clicking the "Send Selected" button (limit is undefined in that case)
        if (showSelection && !limit) {
            if (selectedIds.size === 0) {
                showToast("Lütfen en az bir kişi seçin.", "warning");
                return;
            }
            targetIds = Array.from(selectedIds);

            showConfirm(`Seçili ${targetIds.length} kişiye SMS gönderilecek. Devam etmek istiyor musunuz?`, () => {
                processSend(targetIds, limit);
            });
        } else {
            // Quick send mode (blindly send to top N or All)
            const message = limit 
                ? `${limit} kişiye SMS gönderilecek. Devam etmek istiyor musunuz?`
                : `TÜM ${stats.count} kişiye SMS gönderilecek. Devam etmek istiyor musunuz?`;
            
            showConfirm(message, () => {
                processSend([], limit);
            });
        }
    };

    const formatDate = (date: Date | string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('tr-TR');
    };

    if (showSelection) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Kişi Seçerek Gönder</h3>
                    <button
                        onClick={() => setShowSelection(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Hızlı Gönderime Dön
                    </button>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Özel Mesaj (İsteğe bağlı)
                    </label>
                    <div className="relative">
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Sayın {name}, anketimizi doldurmanız rica olunur... {link}"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 border min-h-[80px]"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                            {'{name}'}, {'{office}'}, {'{link}'}
                        </div>
                    </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b sticky top-0">
                                <tr>
                                    <th className="p-3 w-10 bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={users.length > 0 && selectedIds.size === users.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="p-3 font-medium text-gray-700 bg-gray-50">İsim</th>
                                    <th className="p-3 font-medium text-gray-700 bg-gray-50">Telefon</th>
                                    <th className="p-3 font-medium text-gray-700 bg-gray-50">Ofis</th>
                                    <th className="p-3 font-medium text-gray-700 bg-gray-50">Tarih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(user.id)}
                                                onChange={() => toggleSelection(user.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-3">{user.target_name}</td>
                                        <td className="p-3 text-gray-500">{user.phone ? user.phone.slice(0, 4) + '***' + user.phone.slice(-2) : '-'}</td>
                                        <td className="p-3 text-gray-500">{user.office || '-'}</td>
                                        <td className="p-3 text-gray-500">
                                            {formatDate(user.created_at)}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            Cevap bekleyen kayıt bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{selectedIds.size}</span> kişi seçildi
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={processing || selectedIds.size === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center gap-2"
                    >
                        {processing ? "Gönderiliyor..." : "Seçilenlere Gönder"}
                    </button>
                </div>

                {processing && progress && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Gönderiliyor...</span>
                            <span>{progress.current} / {progress.total}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Toplu SMS Gönderimi (Cevap Vermeyenler)</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Anketi henüz cevaplamamış kişilere hatırlatma SMS'i gönderin.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center justify-between md:justify-start md:gap-4">
                    <span className="text-blue-800 font-medium">Toplam Cevap Bekleyen:</span>
                    {stats.loading ? (
                        <span className="animate-pulse bg-blue-200 h-6 w-12 rounded"></span>
                    ) : (
                        <span className="text-2xl font-bold text-blue-700">{stats.count}</span>
                    )}
                </div>

                <button
                    onClick={handleLoadUsers}
                    disabled={loadingUsers}
                    className="text-sm px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 transition shadow-sm font-medium"
                >
                    {loadingUsers ? "Yükleniyor..." : "Listeyi Gör ve Seç"}
                </button>
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Özel Mesaj (İsteğe bağlı)
                </label>
                <div className="relative">
                    <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Sayın {name}, anketimizi doldurmanız rica olunur... {link}"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 border min-h-[100px]"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        Kullanılabilir: {'{name}'}, {'{office}'}, {'{link}'}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
                <button
                    onClick={() => handleSend(5)}
                    disabled={processing || stats.count === 0}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 font-medium text-sm transition"
                >
                    5 Kişiye Gönder (Test)
                </button>
                <button
                    onClick={() => handleSend(50)}
                    disabled={processing || stats.count === 0}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 disabled:opacity-50 font-medium text-sm transition border border-indigo-100"
                >
                    50 Kişiye Gönder
                </button>
                <button
                    onClick={() => handleSend()}
                    disabled={processing || stats.count === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition ml-auto"
                >
                    Hepsine Gönder ({stats.count})
                </button>
            </div>

            {processing && progress && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Gönderiliyor...</span>
                        <span>{progress.current} / {progress.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {results.length > 0 && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Son İşlem Sonucu</h4>
                    <div className="max-h-60 overflow-y-auto border rounded-md bg-gray-50 text-xs">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b sticky top-0">
                                <tr>
                                    <th className="p-2 font-medium text-gray-600">İsim</th>
                                    <th className="p-2 font-medium text-gray-600">Durum</th>
                                    <th className="p-2 font-medium text-gray-600">Detay</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {results.map((res, idx) => (
                                    <tr key={idx} className={res.success ? "bg-green-50/50" : "bg-red-50/50"}>
                                        <td className="p-2 text-gray-700">{res.name}</td>
                                        <td className="p-2">
                                            {res.success ? (
                                                <span className="text-green-600 font-medium">Başarılı</span>
                                            ) : (
                                                <span className="text-red-600 font-medium">Hata</span>
                                            )}
                                        </td>
                                        <td className="p-2 text-gray-500">{res.success ? "İletildi" : res.error}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
