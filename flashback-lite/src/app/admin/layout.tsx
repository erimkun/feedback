import React from "react";
import { logout } from "@/app/actions/auth";
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const handleLogout = async () => {
        "use server";
        await logout();
        redirect('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900">
            {/* Sidebar - could be just a top header for simplicity since it's a small panel */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow min-h-[56px] md:h-16 flex items-center justify-between px-4 md:px-6 py-2 md:py-0">
                    <div className="flex items-center gap-2 md:gap-4">
                        <h1 className="text-base md:text-xl font-bold text-gray-800">Feedback Admin</h1>
                    </div>

                    <form action={handleLogout}>
                        <button
                            type="submit"
                            className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium px-2 md:px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition"
                        >
                            Çıkış
                        </button>
                    </form>
                </header>
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
