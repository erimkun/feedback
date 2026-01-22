"use client";

import { format } from "date-fns";
import { useTransition } from "react";
import { deleteFeedback } from "@/app/actions/admin";

interface FeedbackCardProps {
    item: {
        id: string;
        targetName: string;
        rating: number | null;
        comment: string | null;
        createdAt: string;
    };
}

export default function FeedbackCard({ item }: FeedbackCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("Bu geri bildirimi silmek istediğinize emin misiniz?")) {
            startTransition(async () => {
                await deleteFeedback(item.id);
            });
        }
    };

    const formattedDate = format(new Date(item.createdAt), "dd MMM yyyy HH:mm");

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${isPending ? "opacity-50" : ""}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-medium text-gray-900">{item.targetName}</h4>
                    <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                </div>
                {item.rating ? (
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            (item.rating || 0) >= 4
                                ? "bg-green-100 text-green-800"
                                : (item.rating || 0) >= 3
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                        }`}
                    >
                        {item.rating} / 5
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Bekliyor
                    </span>
                )}
            </div>

            {item.comment && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.comment}</p>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                >
                    {isPending ? "Siliniyor..." : "Sil"}
                </button>
            </div>
        </div>
    );
}
