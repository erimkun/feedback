"use client";

import { useState, useTransition } from "react";
import { createFeedbackLink } from "@/app/actions/admin";

export default function CreateLinkForm() {
    const [isPending, startTransition] = useTransition();
    const [createdLink, setCreatedLink] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [smsStatus, setSmsStatus] = useState<{ sent: boolean; error?: string } | null>(null);
    const [sendSms, setSendSms] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        const targetName = formData.get("targetName") as string;
        const phoneNumber = sendSms ? (formData.get("phoneNumber") as string) : undefined;

        startTransition(async () => {
            const result = await createFeedbackLink(targetName, phoneNumber);
            if (result.error) {
                setError(result.error);
                setCreatedLink(null);
                setSmsStatus(null);
            } else if (result.link) {
                setCreatedLink(result.link);
                setError(null);
                if (phoneNumber) {
                    setSmsStatus({
                        sent: result.smsSent || false,
                        error: result.smsError
                    });
                } else {
                    setSmsStatus(null);
                }
            }
        });
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">Yeni Link Oluştur</h3>
            <form action={handleSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hedef Kişi/Konu
                        </label>
                        <input
                            type="text"
                            name="targetName"
                            placeholder="Örn: Ahmet Yılmaz"
                            required
                            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-black text-white px-4 py-2.5 md:py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50 md:h-[42px] w-full md:w-auto"
                    >
                        {isPending ? "..." : "Oluştur"}
                    </button>
                </div>

                {/* SMS Toggle */}
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sendSms}
                            onChange={(e) => setSendSms(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">SMS ile gönder</span>
                </div>

                {/* Phone Number Input */}
                {sendSms && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefon Numarası
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="05XX XXX XX XX"
                            required={sendSms}
                            className="w-full md:w-64 px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Türk telefon numarası formatında girin
                        </p>
                    </div>
                )}
            </form>

            {createdLink && (
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800 mb-2 font-medium">Link Oluşturuldu:</p>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                        <input
                            readOnly
                            className="flex-1 text-xs md:text-sm bg-white px-2 py-2 md:py-1 border rounded text-gray-600 font-mono"
                            value={createdLink}
                        />
                        <button
                            onClick={() => navigator.clipboard.writeText(createdLink)}
                            className="text-sm md:text-xs bg-green-100 text-green-700 px-3 py-2 md:py-1 rounded hover:bg-green-200 w-full md:w-auto"
                        >
                            Kopyala
                        </button>
                    </div>
                    
                    {/* SMS Status */}
                    {smsStatus && (
                        <div className={`mt-2 text-sm ${smsStatus.sent ? 'text-green-700' : 'text-amber-600'}`}>
                            {smsStatus.sent ? (
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    SMS başarıyla gönderildi
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    SMS gönderilemedi: {smsStatus.error}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 text-sm text-red-600">
                    {error}
                </div>
            )}
        </div>
    );
}
