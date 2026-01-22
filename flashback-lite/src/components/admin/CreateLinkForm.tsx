"use client";

import { useState, useTransition } from "react";
import { createFeedbackLink } from "@/app/actions/admin";

export default function CreateLinkForm() {
    const [isPending, startTransition] = useTransition();
    const [createdLink, setCreatedLink] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        const targetName = formData.get("targetName") as string;

        startTransition(async () => {
            const result = await createFeedbackLink(targetName);
            if (result.error) {
                setError(result.error);
                setCreatedLink(null);
            } else if (result.link) {
                setCreatedLink(result.link);
                setError(null);
            }
        });
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">Yeni Link Oluştur</h3>
            <form action={handleSubmit} className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-end">
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
