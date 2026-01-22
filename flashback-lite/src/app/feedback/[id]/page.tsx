import { prisma } from "@/lib/prisma";
import FeedbackForm from "@/components/FeedbackForm";
import { notFound } from "next/navigation";
import Script from "next/script";

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { id } = await params;

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
      <>
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="beforeInteractive" />
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
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <i className="ph-fill ph-info text-6xl text-gray-400"></i>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900">Bu Link Kullanılmış</h2>
                <p className="text-gray-500 text-lg">Bu geri bildirim linki daha önce kullanılmış. Her link sadece bir kez kullanılabilir.</p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="p-8 text-center mt-auto">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              © 2024 Üsküdar Belediyesi Kentsel Dönüşüm Müdürlüğü
            </p>
          </footer>
        </div>
      </>
    );
  }

  // Valid feedback - render the form
  return <FeedbackForm feedbackId={feedback.id} targetName={feedback.targetName} />;
}
