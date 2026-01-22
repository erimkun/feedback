"use client";

import { useState, useEffect } from "react";
import { submitFeedback } from "@/app/actions";
import Script from "next/script";

interface FeedbackFormProps {
  feedbackId: string;
  targetName: string;
}

// Rating renkleri (1: kırmızı -> 5: yeşil)
const ratingColors: Record<number, string> = {
  1: "#FF0033", // Rich Red
  2: "#FF6600", // Vivid Orange
  3: "#FFCC00", // Golden Yellow
  4: "#99CC33", // Olive/Lime
  5: "#339900", // Grass Green
};

// Phosphor icon isimleri
const ratingIcons = [
  { value: 1, icon: "ph-smiley-x-eyes" },
  { value: 2, icon: "ph-smiley-sad" },
  { value: 3, icon: "ph-smiley-meh" },
  { value: 4, icon: "ph-smiley" },
  { value: 5, icon: "ph-smiley-wink" },
];

export default function FeedbackForm({ feedbackId, targetName }: FeedbackFormProps) {
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
      // Confetti efekti
      fireConfetti();
    } else {
      setError(result.error || "Bir hata oluştu.");
    }

    setIsSubmitting(false);
  };

  const fireConfetti = () => {
    if (typeof window !== "undefined" && (window as any).confetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        (window as any).confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        (window as any).confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  };

  // Success / Thank you screen
  if (isSubmitted) {
    return (
      <>
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="beforeInteractive" />
        <div className="bg-white min-h-dvh overflow-hidden flex flex-col font-['Manrope',sans-serif]">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md">
            <div className="flex items-center p-4 justify-between max-w-md mx-auto w-full">
              <div className="text-[#2e687a] flex size-10 shrink-0 items-center justify-start cursor-pointer">
                <i className="ph-bold ph-x text-2xl"></i>
              </div>
              <h2 className="text-[#d63417] text-base font-extrabold leading-tight tracking-tight flex-1 text-center">
                Üsküdar Yenileniyor
              </h2>
              <div className="size-10 flex items-center justify-end">
                <i className="ph-bold ph-info text-2xl text-[#2e687a]/40"></i>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
            <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <i className="ph-fill ph-check-circle text-6xl text-green-500"></i>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900">Teşekkür Ederiz!</h2>
                <p className="text-gray-500 text-lg">Geri bildiriminiz başarıyla iletildi.</p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="p-8 text-center mt-auto">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              © 2026 Üsküdar Belediyesi Kentsel Dönüşüm Müdürlüğü
            </p>
          </footer>
        </div>
      </>
    );
  }

  // Feedback Form
  return (
    <>
      <Script src="https://unpkg.com/@phosphor-icons/web" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="beforeInteractive" />
      <style jsx global>{`
        .ph-fill {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .rating-item:hover .ph-fill,
        .rating-item.selected .ph-fill {
          transform: scale(1.15);
        }
        .rating-item:hover p,
        .rating-item.selected p {
          font-weight: 700;
        }
        textarea:focus {
          outline: none;
          border-color: #d63417;
          box-shadow: 0 0 0 3px rgba(214, 52, 23, 0.1);
        }
      `}</style>
      
      <div className="bg-white min-h-dvh overflow-hidden flex flex-col font-['Manrope',sans-serif]">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md">
          <div className="flex items-center p-4 justify-between max-w-md mx-auto w-full">
            <div className="text-[#2e687a] flex size-10 shrink-0 items-center justify-start cursor-pointer">
              <i className="ph-bold ph-x text-2xl"></i>
            </div>
            <h2 className="text-[#d63417] text-base font-extrabold leading-tight tracking-tight flex-1 text-center">
              Üsküdar Yenileniyor
            </h2>
            <div className="size-10 flex items-center justify-end">
              <i className="ph-bold ph-info text-2xl text-[#2e687a]/40"></i>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Logo Section */}
            <div className="w-full text-center mb-2">
              <div className="bg-[#d63417] p-2 rounded-xl inline-block mb-3 shadow-lg shadow-[#d63417]/20">
                <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">
                Merhaba <span className="text-black">{targetName}</span>
              </h1>
            </div>

            {/* Card */}
            <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#2e687a]/5 p-5 flex flex-col gap-4 border border-gray-100">
              {/* Question */}
              <div className="text-center">
                <h3 className="text-gray-900 text-base font-extrabold leading-tight">
                  Bugünkü Kentsel Dönüşüm planlama süreci deneyiminizi nasıl değerlendirirsiniz?
                </h3>
                <p className="text-gray-500 text-xs mt-2">
                  Görüşleriniz mahallemizin geleceğini şekillendiriyor.
                </p>
              </div>

              {/* Rating Icons */}
              <div className="flex justify-between items-center px-1">
                {ratingIcons.map(({ value, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedRating(value)}
                    className={`rating-item flex flex-col items-center gap-1 group outline-none ${
                      selectedRating === value ? "selected" : ""
                    }`}
                  >
                    <div
                      className={`rounded-full w-12 h-12 flex items-center justify-center transition-all ${
                        selectedRating === value
                          ? "bg-[#d63417]/10"
                          : "bg-[#f7f7f8] group-hover:bg-[#d63417]/10"
                      }`}
                    >
                      <i
                        className={`ph-fill ${icon} text-3xl transition-colors`}
                        style={{
                          color:
                            selectedRating === value
                              ? ratingColors[value]
                              : "#9ca3af",
                        }}
                      ></i>
                    </div>
                    <p
                      className="text-[10px] font-bold transition-colors"
                      style={{
                        color:
                          selectedRating === value
                            ? ratingColors[value]
                            : "#9ca3af",
                      }}
                    >
                      {value}
                    </p>
                  </button>
                ))}
              </div>

              {/* Comment Field */}
              <div className="w-full flex flex-col gap-2">
                <label className="text-gray-700 text-xs font-bold" htmlFor="comment">
                  Eklemek istediğiniz bir not var mı?
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-0 transition-all resize-none"
                  placeholder="Görüşlerinizi buraya yazabilirsiniz..."
                  rows={2}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center">
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedRating || isSubmitting}
                  className={`w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#d63417] text-white text-sm font-extrabold shadow-lg shadow-[#d63417]/20 active:scale-[0.98] transition-all ${
                    !selectedRating || isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span>{isSubmitting ? "Gönderiliyor..." : "Geri Bildirim Gönder"}</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-8 text-center mt-auto">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            © 2026 Üsküdar Belediyesi Kentsel Dönüşüm Müdürlüğü
          </p>
        </footer>
      </div>
    </>
  );
}
