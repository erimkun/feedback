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
          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
            <div className="w-full max-w-lg flex flex-col items-center justify-center gap-8">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <i className="ph-fill ph-info text-7xl text-gray-400"></i>
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
      </>
    );
  }

  // Valid feedback - render the form
  return <FeedbackForm feedbackId={feedback.id} targetName={feedback.targetName} />;
}
