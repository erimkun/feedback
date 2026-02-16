"use client";

import { useState } from "react";
import { submitFeedback } from "@/app/actions";
import Script from "next/script";
import { SmileySad, SmileyMeh, SmileyBlank, Smiley, CheckCircle } from "@phosphor-icons/react";

interface FeedbackFormProps {
  feedbackId: string;
  target_name: string;
}

// Rating renkleri (1: kırmızı -> 5: yeşil)
const ratingColors: Record<number, string> = {
  1: "#E42617", // Üsküdar Kırmızı
  2: "#FF6600", // Vivid Orange
  3: "#FFCC00", // Golden Yellow
  4: "#99CC33", // Olive/Lime
  5: "#339900", // Grass Green
};

// Phosphor React icons
const ratingIcons = [
  { value: 1, Icon: SmileySad, isSvg: false },
  { value: 2, Icon: SmileyMeh, isSvg: false },
  { value: 3, Icon: SmileyBlank, isSvg: false },
  { value: 4, Icon: Smiley, isSvg: false },
  { value: 5, Icon: null, isSvg: true, svgPath: "/smiley-in-love-svgrepo-com.svg" },
];

export default function FeedbackForm({ feedbackId, target_name }: FeedbackFormProps) {
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
        <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="beforeInteractive" />
        <div className="bg-white h-[100dvh] overflow-hidden flex flex-col font-['Manrope',sans-serif] fixed inset-0">
          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-lg mx-auto w-full">
            <div className="w-full max-w-lg flex flex-col items-center justify-center gap-6">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <CheckCircle size={64} weight="fill" className="text-green-500" />
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-extrabold text-gray-900">Teşekkür Ederiz!</h2>
                <p className="text-gray-500 text-lg">Geri bildiriminiz başarıyla iletildi.</p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="p-4 pb-6 text-center safe-area-bottom">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              © 2026 Üsküdar Yenileniyor
            </p>
          </footer>
        </div>
      </>
    );
  }

  // Feedback Form
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="beforeInteractive" />
      <style jsx global>{`
        .rating-icon {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .rating-item:hover .rating-icon,
        .rating-item.selected .rating-icon {
          transform: scale(1.15);
        }
        .rating-item:hover .rating-svg,
        .rating-item.selected .rating-svg {
          transform: scale(1.15);
        }
        .rating-item:hover p,
        .rating-item.selected p {
          font-weight: 700;
        }
        textarea:focus {
          outline: none;
          border-color: #E42617;
          box-shadow: 0 0 0 3px rgba(228, 38, 23, 0.1);
        }
        html, body {
          overflow-x: hidden;
          max-width: 100vw;
          height: 100%;
          -webkit-overflow-scrolling: touch;
        }
        @supports (padding: env(safe-area-inset-bottom)) {
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      <div className="bg-white h-[100dvh] overflow-hidden flex flex-col font-['Manrope',sans-serif] fixed inset-0">
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-lg mx-auto w-full">
          <div className="w-full max-w-lg flex flex-col items-center">
            {/* Logo Section */}
            <div className="w-full text-center mb-3">
              <div className="bg-[#E42617] p-4 rounded-xl inline-block mb-3 shadow-lg shadow-[#E42617]/20">
                <img src="/logo.png" alt="Logo" className="h-24 object-contain" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">
                Merhaba <span className="text-black">{target_name}</span>
              </h1>
            </div>

            {/* Card */}
            <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#2e687a]/5 p-5 flex flex-col gap-4 border border-gray-100">
              {/* Question */}
              <div className="text-center">
                <h3 className="text-gray-900 text-base font-extrabold leading-relaxed">
                  Üsküdar Yenileniyor kapsamında Kentaş tarafından sunulan hizmet deneyiminizi nasıl değerlendirirsiniz?
                </h3>
                <p className="text-gray-500 text-xs mt-2">
                  Görüşleriniz Üsküdar'ımızın geleceğini şekillendiriyor.
                </p>
              </div>

              {/* Rating Icons */}
              <div className="flex justify-between items-center px-1">
                {ratingIcons.map(({ value, Icon, isSvg, svgPath }) => (
                  <button
                    key={value}
                    type="button"
                    data-value={value}
                    onClick={() => setSelectedRating(value)}
                    className={`rating-item flex flex-col items-center gap-1 group outline-none ${selectedRating === value ? "selected" : ""
                      }`}
                  >
                    <div
                      className={`rounded-full w-12 h-12 flex items-center justify-center transition-all ${selectedRating === value
                        ? "bg-[#E42617]/10"
                        : "bg-[#f7f7f8] group-hover:bg-[#E42617]/10"
                        }`}
                    >
                      {isSvg ? (
                        <img
                          src={svgPath}
                          alt="Rating 5"
                          className="w-6 h-6 transition-all rating-svg"
                          style={{
                            filter: selectedRating === value
                              ? "invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(95%) contrast(101%)"
                              : "invert(69%) sepia(11%) saturate(233%) hue-rotate(179deg) brightness(93%) contrast(88%)",
                            opacity: 1,
                          }}
                        />
                      ) : Icon ? (
                        <Icon
                          size={30}
                          weight="fill"
                          className="rating-icon transition-colors"
                          style={{
                            color:
                              selectedRating === value
                                ? ratingColors[value]
                                : "#9ca3af",
                          }}
                        />
                      ) : null}
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
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 text-base text-gray-900 placeholder:text-gray-400 focus:ring-0 transition-all resize-none box-border"
                  placeholder="Görüşlerinizi buraya yazabilirsiniz..."
                  rows={2}
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
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedRating || isSubmitting}
                  className={`w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#E42617] text-white text-sm font-extrabold shadow-lg shadow-[#E42617]/20 active:scale-[0.98] transition-all ${!selectedRating || isSubmitting
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
        <footer className="p-4 pb-6 text-center safe-area-bottom">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            © 2026 Üsküdar Yenileniyor
          </p>
        </footer>
      </div>
    </>
  );
}
