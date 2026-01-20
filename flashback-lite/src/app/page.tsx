export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* TopAppBar */}
      <div className="flex items-center bg-[#f6f6f8] dark:bg-[#101622] p-4 pb-2 justify-center sticky top-0 z-10">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          Flashback Lite
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 text-center">
        <div className="mb-8">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#135bec]/10 border-2 border-[#135bec]/30">
            <span 
              className="material-symbols-outlined text-[#135bec] text-6xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
            >
              feedback
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight">
            Flashback Lite
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed">
            Basit ve hızlı geri bildirim toplama uygulaması.
          </p>
        </div>

        <div className="mt-8 p-6 bg-slate-100 dark:bg-[#192233] rounded-xl w-full">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-relaxed">
            Yeni bir feedback linki oluşturmak için terminalde:
          </p>
          <code className="mt-3 block text-sm text-[#135bec] bg-slate-200 dark:bg-[#101622] p-3 rounded-lg">
            npm run create-link &quot;İsim&quot;
          </code>
        </div>
      </div>

      {/* Safe area spacing */}
      <div className="h-8 bg-[#f6f6f8] dark:bg-[#101622]"></div>
    </div>
  );
}
