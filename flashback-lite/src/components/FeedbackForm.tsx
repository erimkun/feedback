"use client";

import { useState } from "react";
import { submitFeedback } from "@/app/actions";
import WeatherEffect from "@/components/WeatherEffect";
import { WeatherType } from "@/lib/weather";

interface FeedbackFormProps {
  feedbackId: string;
  targetName: string;
  weather: WeatherType;
}

const ratingIcons = [
  { value: 1, icon: "sentiment_very_dissatisfied" },
  { value: 2, icon: "sentiment_dissatisfied" },
  { value: 3, icon: "sentiment_neutral" },
  { value: 4, icon: "sentiment_satisfied" },
  { value: 5, icon: "sentiment_very_satisfied" },
];

export default function FeedbackForm({ feedbackId, targetName, weather }: FeedbackFormProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedRating) return;

    setIsSubmitting(true);
    setError(null);

    const result = await submitFeedback(feedbackId, selectedRating, comment);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || "Bir hata oluştu.");
    }

    setIsSubmitting(false);
  };

  // Success / Thank you screen
  if (isSubmitted) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#101622]">
        <WeatherEffect type={weather} />
        
        {/* TopAppBar */}
        <div className="flex items-center bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-sm p-4 pb-2 justify-between sticky top-0 z-10">
          <div className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start opacity-0">
            <span className="material-symbols-outlined cursor-default text-2xl">close</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Geri Bildirim
          </h2>
          <div className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-end opacity-0">
            <span className="material-symbols-outlined cursor-pointer text-2xl">close</span>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 text-center relative z-10">
          <div className="mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-[#22c55e]/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#22c55e]/10 border-2 border-[#22c55e]/30 glow-effect">
                <span 
                  className="material-symbols-outlined text-[#22c55e] text-6xl"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
                >
                  check_circle
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight">
              Geri Bildiriminiz İçin Teşekkürler!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed">
              Düşünceleriniz gelişimimize ışık tutuyor.
            </p>
          </div>
        </div>

        {/* Safe area spacing */}
        <div className="h-8 bg-[#f6f6f8] dark:bg-[#101622]"></div>
      </div>
    );
  }

  // Feedback Form
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#101622]">
      <WeatherEffect type={weather} />
      
      {/* TopAppBar Component */}
      <div className="flex items-center bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-sm p-4 pb-2 justify-between sticky top-0 z-10">
        <div className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined cursor-pointer text-2xl">close</span>
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Puanlama Ekranı
        </h2>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4 relative z-10">
        {/* HeadlineText Component */}
        <div className="pt-8 pb-6">
          <h2 className="text-slate-900 dark:text-white tracking-light text-[28px] font-bold leading-tight text-center">
            Deneyiminizi nasıl değerlendirirsiniz?
          </h2>
        </div>

        {/* ActionsBar Component (Expressive Icons) */}
        <div className="py-6">
          <div className="gap-2 grid grid-cols-5">
            {ratingIcons.map(({ value, icon }) => (
              <div
                key={value}
                onClick={() => setSelectedRating(value)}
                className={`flex flex-col items-center gap-3 py-2.5 text-center group cursor-pointer ${
                  selectedRating === value ? "rating-selected" : ""
                }`}
              >
                <div
                  className={`rounded-full p-4 transition-colors ${
                    selectedRating === value
                      ? "bg-[#135bec]/20"
                      : "bg-slate-200 dark:bg-[#232f48] group-hover:bg-[#135bec]/20"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-3xl ${
                      selectedRating === value
                        ? "text-[#135bec]"
                        : "text-slate-700 dark:text-white"
                    }`}
                    style={
                      selectedRating === value
                        ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                        : undefined
                    }
                  >
                    {icon}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TextField Component */}
        <div className="py-6">
          <label className="flex flex-col w-full">
            <p className="text-slate-700 dark:text-white text-base font-medium leading-normal pb-2">
              Yorumunuz (Opsiyonel)
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex w-full resize-none overflow-hidden rounded-xl text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-slate-300 dark:border-[#324467] bg-white dark:bg-[#192233] placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] min-h-36 p-4 text-base font-normal leading-normal"
              placeholder="Geri bildiriminizi buraya yazın..."
            />
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="py-2 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* SingleButton Component (Sticky at bottom) */}
      <div className="mt-auto px-4 py-8 max-w-md mx-auto w-full relative z-10">
        <button
          onClick={handleSubmit}
          disabled={!selectedRating || isSubmitting}
          className={`flex w-full items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-[#135bec] text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg shadow-[#135bec]/20 transition-opacity ${
            !selectedRating || isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : "opacity-100 cursor-pointer hover:bg-[#135bec]/90 active:scale-[0.98]"
          }`}
        >
          <span className="truncate">{isSubmitting ? "Gönderiliyor..." : "Gönder"}</span>
        </button>
      </div>

      {/* Safe area spacing for mobile */}
      <div className="h-6 bg-[#f6f6f8] dark:bg-[#101622]"></div>
    </div>
  );
}
