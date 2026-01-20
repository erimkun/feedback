"use server";

import { prisma } from "@/lib/prisma";

export async function submitFeedback(
  id: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if feedback exists and is not used
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return { success: false, error: "Bu feedback linki bulunamadı." };
    }

    if (feedback.isUsed) {
      return { success: false, error: "Bu link daha önce kullanılmış." };
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Geçersiz puan." };
    }

    // Update feedback
    await prisma.feedback.update({
      where: { id },
      data: {
        rating,
        comment: comment || null,
        isUsed: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Feedback submission error:", error);
    return { success: false, error: "Bir hata oluştu." };
  }
}
