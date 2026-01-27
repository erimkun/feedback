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
  1: "#E42617", // Üsküdar Kırmızı
  2: "#FF6600", // Vivid Orange
  3: "#FFCC00", // Golden Yellow
  4: "#99CC33", // Olive/Lime
  5: "#339900", // Grass Green
};

// Phosphor icon isimleri
const ratingIcons = [
  { value: 1, icon: "ph-smiley-angry" },
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
            <div className="flex items-center p-6 justify-center max-w-lg mx-auto w-full">
              <h2 className="text-[#E42617] text-xl font-extrabold leading-tight tracking-tight text-center">
                Üsküdar Yenileniyor
              </h2>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
            <div className="w-full max-w-lg flex flex-col items-center justify-center gap-8">
              <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <i className="ph-fill ph-check-circle text-7xl text-green-500"></i>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold text-gray-900">Teşekkür Ederiz!</h2>
                <p className="text-gray-500 text-xl">Geri bildiriminiz başarıyla iletildi.</p>
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
        .rating-item[data-value="1"]:hover .ph-fill {
          color: #E42617 !important;
        }
        textarea:focus {
          outline: none;
          border-color: #E42617;
          box-shadow: 0 0 0 3px rgba(228, 38, 23, 0.1);
        }
        html, body {
          overflow-x: hidden;
          max-width: 100vw;
        }
      `}</style>
      
      <div className="bg-white min-h-dvh overflow-hidden flex flex-col font-['Manrope',sans-serif]">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md">
          <div className="flex items-center p-6 justify-center max-w-lg mx-auto w-full">
            <h2 className="text-[#E42617] text-xl font-extrabold leading-tight tracking-tight text-center">
              Üsküdar Yenileniyor
            </h2>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
          <div className="w-full max-w-lg flex flex-col items-center">
            {/* Logo Section */}
            <div className="w-full text-center mb-4">
              <div className="bg-[#E42617] p-3 rounded-xl inline-block mb-4 shadow-lg shadow-[#E42617]/20">
                <img src="/logo.png" alt="Logo" className="h-12 object-contain" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Merhaba <span className="text-black">{targetName}</span>
              </h1>
            </div>

            {/* Card */}
            <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#2e687a]/5 p-6 flex flex-col gap-6 border border-gray-100">
              {/* Question */}
              <div className="text-center">
                <h3 className="text-gray-900 text-lg font-extrabold leading-relaxed">
                  Bugünkü Kentsel Dönüşüm planlama süreci deneyiminizi nasıl değerlendirirsiniz?
                </h3>
                <p className="text-gray-500 text-sm mt-3">
                  Görüşleriniz mahallemizin geleceğini şekillendiriyor.
                </p>
              </div>

              {/* Rating Icons */}
              <div className="flex justify-between items-center px-2">
                {ratingIcons.map(({ value, icon }) => (
                  <button
                    key={value}
                    type="button"
                    data-value={value}
                    onClick={() => setSelectedRating(value)}
                    className={`rating-item flex flex-col items-center gap-2 group outline-none ${
                      selectedRating === value ? "selected" : ""
                    }`}
                  >
                    <div
                      className={`rounded-full w-14 h-14 flex items-center justify-center transition-all ${
                        selectedRating === value
                          ? "bg-[#E42617]/10"
                          : "bg-[#f7f7f8] group-hover:bg-[#E42617]/10"
                      }`}
                    >
                      <i
                        className={`ph-fill ${icon} text-4xl transition-colors`}
                        style={{
                          color:
                            selectedRating === value
                              ? ratingColors[value]
                              : "#9ca3af",
                        }}
                      ></i>
                    </div>
                    <p
                      className="text-xs font-bold transition-colors"
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
              <div className="w-full flex flex-col gap-3">
                <label className="text-gray-700 text-sm font-bold" htmlFor="comment">
                  Eklemek istediğiniz bir not var mı?
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 text-base text-gray-900 placeholder:text-gray-400 focus:ring-0 transition-all resize-none box-border"
                  placeholder="Görüşlerinizi buraya yazabilirsiniz..."
                  rows={3}
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center">
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedRating || isSubmitting}
                  className={`w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-6 bg-[#E42617] text-white text-base font-extrabold shadow-lg shadow-[#E42617]/20 active:scale-[0.98] transition-all ${
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
