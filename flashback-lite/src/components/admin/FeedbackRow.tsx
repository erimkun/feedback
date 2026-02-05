"use client";

import { format } from "date-fns";
import { useTransition, useState, useEffect } from "react";
import { deleteFeedback, sendSMSToFeedback } from "@/app/actions/admin";

interface FeedbackRowProps {
    item: {
        id: string;
        target_name: string;
        phone?: string | null;
        rating: number | null;
        comment: string | null;
        created_at: string;
    };
}

export default function FeedbackRow({ item }: FeedbackRowProps) {
    const [isPending, startTransition] = useTransition();
    const [formattedDate, setFormattedDate] = useState("");
    const [showSmsModal, setShowSmsModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [smsStatus, setSmsStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });
    const [repeatSmsStatus, setRepeatSmsStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });
    const handleRepeatSms = async () => {
        if (!item.phone) return;
        setRepeatSmsStatus({ type: 'loading' });
        const result = await sendSMSToFeedback(item.id, item.phone);
        if (result.success) {
            setRepeatSmsStatus({ type: 'success', message: 'SMS tekrar gönderildi!' });
            setTimeout(() => setRepeatSmsStatus({ type: 'idle' }), 1500);
        } else {
            setRepeatSmsStatus({ type: 'error', message: result.error || 'SMS gönderilemedi' });
        }
    };

    useEffect(() => {
        setFormattedDate(format(new Date(item.created_at), "dd MMM yyyy HH:mm"));
    }, [item.created_at]);

    const handleDelete = () => {
        if (confirm("Bu geri bildirimi silmek istediğinize emin misiniz?")) {
            startTransition(async () => {
                await deleteFeedback(item.id);
            });
        }
    };

    const handleSendSms = async () => {
        if (!phoneNumber.trim()) {
            setSmsStatus({ type: 'error', message: 'Telefon numarası gerekli' });
            return;
        }

        setSmsStatus({ type: 'loading' });
        
        const result = await sendSMSToFeedback(item.id, phoneNumber);
        
        if (result.success) {
            setSmsStatus({ type: 'success', message: 'SMS başarıyla gönderildi!' });
            setTimeout(() => {
                setShowSmsModal(false);
                setPhoneNumber("");
                setSmsStatus({ type: 'idle' });
            }, 1500);
        } else {
            setSmsStatus({ type: 'error', message: result.error || 'SMS gönderilemedi' });
        }
    };

    const closeSmsModal = () => {
        setShowSmsModal(false);
        setPhoneNumber("");
        setSmsStatus({ type: 'idle' });
    };

    return (
        <>
            <tr className={`hover:bg-gray-50 transition ${isPending ? "opacity-50" : ""}`}>
            <td className="px-6 py-4 font-medium text-gray-900">{item.target_name}</td>
            <td className="px-6 py-4">
                {item.rating ? (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(item.rating || 0) >= 4
                            ? "bg-green-100 text-green-800"
                            : (item.rating || 0) >= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                    >
                        {item.rating} / 5
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Bekliyor
                    </span>
                )}
            </td>
            <td className="px-6 py-4 max-w-md truncate" title={item.comment || ""}>
                {item.comment || "-"}
            </td>
            <td className="px-6 py-4 text-gray-500">
                {formattedDate}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => setShowSmsModal(true)}
                        className="text-blue-600 hover:text-blue-900 transition"
                        title="SMS Gönder"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                    </button>
                    {item.phone && (
                        <button
                            onClick={handleRepeatSms}
                            className="text-green-600 hover:text-green-900 transition text-sm font-medium border border-green-200 rounded px-2 py-1"
                            disabled={repeatSmsStatus.type === 'loading'}
                            title="Tekrar SMS Gönder"
                        >
                            {repeatSmsStatus.type === 'loading' ? 'Tekrar Gönderiliyor...' : 'Tekrar SMS Gönder'}
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                    >
                        {isPending ? "Siliniyor..." : "Sil"}
                    </button>
                </div>
                {repeatSmsStatus.type === 'error' && (
                    <div className="text-xs text-red-600 mt-1">{repeatSmsStatus.message}</div>
                )}
                {repeatSmsStatus.type === 'success' && (
                    <div className="text-xs text-green-600 mt-1">{repeatSmsStatus.message}</div>
                )}
            </td>
        </tr>

            {/* SMS Modal */}
            {showSmsModal && (
                <tr>
                    <td colSpan={5} className="p-0">
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeSmsModal}>
                            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">SMS Gönder</h3>
                                    <button onClick={closeSmsModal} className="text-gray-400 hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4">
                                    <strong>{item.target_name}</strong> için feedback linkini SMS olarak gönderin.
                                </p>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telefon Numarası
                                    </label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="05XX XXX XX XX"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        disabled={smsStatus.type === 'loading'}
                                    />
                                </div>

                                {smsStatus.type === 'error' && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        {smsStatus.message}
                                    </div>
                                )}

                                {smsStatus.type === 'success' && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                                        {smsStatus.message}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeSmsModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                        disabled={smsStatus.type === 'loading'}
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleSendSms}
                                        disabled={smsStatus.type === 'loading' || smsStatus.type === 'success'}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {smsStatus.type === 'loading' ? 'Gönderiliyor...' : 'Gönder'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
