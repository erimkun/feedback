export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* TopAppBar */}
      <div className="flex items-center bg-[#f6f6f8] dark:bg-[#101622] p-4 pb-2 justify-between sticky top-0 z-10">
        <div className="flex size-12"></div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Geri Bildirim
        </h2>
        <div className="flex size-12"></div>
      </div>

      {/* Error Message */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 text-center">
        <div className="mb-8">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <span 
              className="material-symbols-outlined text-red-500 text-6xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
            >
              error
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-slate-900 dark:text-white tracking-tight text-[28px] font-bold leading-tight">
            Link Bulunamadı
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed">
            Bu geri bildirim linki geçersiz veya süresi dolmuş olabilir.
          </p>
        </div>
      </div>

      {/* Safe area spacing */}
      <div className="h-8 bg-[#f6f6f8] dark:bg-[#101622]"></div>
    </div>
  );
}
