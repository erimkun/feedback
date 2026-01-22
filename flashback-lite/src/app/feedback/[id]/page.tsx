import { prisma } from "@/lib/prisma";
import FeedbackForm from "@/components/FeedbackForm";
import { notFound } from "next/navigation";
import WeatherEffect from "@/components/WeatherEffect";
import { getWeather } from "@/lib/weather";

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { id } = await params;
  const weather = await getWeather();

  const feedback = await prisma.feedback.findUnique({
    where: { id },
  });

  // If not found, show 404
  if (!feedback) {
    notFound();
  }

  // If already used, show info message
  if (feedback.isUsed) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#101622]">
        <WeatherEffect type={weather} />
        
        {/* TopAppBar */}
        <div className="flex items-center bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-sm p-4 pb-2 justify-between sticky top-0 z-10">
          <div className="flex size-12"></div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Geri Bildirim
          </h2>
          <div className="flex size-12"></div>
        </div>

        {/* Info Message */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 text-center relative z-10">
          <div className="mb-8">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 dark:bg-[#232f48]">
              <span 
                className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-6xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
              >
                info
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-slate-900 dark:text-white tracking-tight text-[28px] font-bold leading-tight">
              Bu Link Kullanılmış
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed">
              Bu geri bildirim linki daha önce kullanılmış. Her link sadece bir kez kullanılabilir.
            </p>
          </div>
        </div>

        {/* Safe area spacing */}
        <div className="h-8 bg-[#f6f6f8] dark:bg-[#101622]"></div>
      </div>
    );
  }

  // Valid feedback - render the form with weather
  return <FeedbackForm feedbackId={feedback.id} targetName={feedback.targetName} weather={weather} />;
}
