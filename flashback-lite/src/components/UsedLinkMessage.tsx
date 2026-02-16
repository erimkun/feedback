"use client";

import { Info } from "@phosphor-icons/react";

export default function UsedLinkMessage() {
    return (
        <div className="bg-white h-[100dvh] overflow-hidden flex flex-col font-['Manrope',sans-serif] fixed inset-0">
            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
                <div className="w-full max-w-lg flex flex-col items-center justify-center gap-8">
                    <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                        <Info size={70} weight="fill" className="text-gray-400" />
                    </div>
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-extrabold text-gray-900">Bu Link Kullanılmış</h2>
                        <p className="text-gray-500 text-xl">Bu geri bildirim linki daha önce kullanılmış. Her link sadece bir kez kullanılabilir.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 text-center mt-auto">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    © 2026 Üsküdar Yenileniyor
                </p>
            </footer>
        </div>
    );
}
