"use client";

import { format } from "date-fns";
import { useTransition } from "react";
import { deleteFeedback } from "@/app/actions/admin";

interface FeedbackRowProps {
    item: {
        id: string;
        targetName: string;
        rating: number | null;
        comment: string | null;
        createdAt: Date;
    };
}

export default function FeedbackRow({ item }: FeedbackRowProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("Bu geri bildirimi silmek istediğinize emin misiniz?")) {
            startTransition(async () => {
                await deleteFeedback(item.id);
            });
        }
    };

    return (
        <tr className={`hover:bg-gray-50 transition ${isPending ? "opacity-50" : ""}`}>
            <td className="px-6 py-4 font-medium text-gray-900">{item.targetName}</td>
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
                {format(new Date(item.createdAt), "dd MMM yyyy HH:mm")}
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                >
                    {isPending ? "Siliniyor..." : "Sil"}
                </button>
            </td>
        </tr>
    );
}
