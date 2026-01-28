"use server";

import { prisma } from "@/lib/prisma";
import { sendSMS, isValidPhoneNumber } from "@/lib/sms";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function getFeedbackStats() {
    const total = await prisma.feedback.count();
    const used = await prisma.feedback.count({ where: { isUsed: true } });

    const ratings = await prisma.feedback.findMany({
        where: { isUsed: true, rating: { not: null } },
        select: { rating: true },
    });

    const averageRating =
        ratings.length > 0
            ? ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length
            : 0;

    return {
        total,
        used,
        averageRating: averageRating.toFixed(1),
    };
}

export async function getRecentFeedback() {
    const feedback = await prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    });
    
    // Convert Date to ISO string to avoid hydration mismatch
    return feedback.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
    }));
}

export async function createFeedbackLink(targetName: string, phoneNumber?: string, office?: string) {
    if (!targetName) return { error: "İsim gerekli" };

    // Validate phone number if provided
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        return { error: "Geçersiz telefon numarası formatı" };
    }

    try {
        const id = nanoid(10);
        await prisma.feedback.create({
            data: {
                id,
                targetName,
                office: office || null,
            },
        });

        const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/feedback/${id}`;

        // Send SMS if phone number is provided
        let smsResult = null;
        if (phoneNumber) {
            smsResult = await sendSMS(phoneNumber, link, targetName, office);
        }

        revalidatePath("/admin");
        return { 
            success: true, 
            link,
            smsSent: smsResult?.success || false,
            smsError: smsResult?.error
        };
    } catch (error) {
        console.error("Link creation error:", error);
        return { error: "Link oluşturulurken bir hata oluştu" };
    }
}

export async function deleteFeedback(id: string) {
    try {
        await prisma.feedback.delete({
            where: { id },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, error: "Silme işlemi sırasında hata oluştu" };
    }
}

export async function sendSMSToFeedback(feedbackId: string, phoneNumber: string) {
    if (!feedbackId) return { success: false, error: "Feedback ID gerekli" };
    if (!phoneNumber) return { success: false, error: "Telefon numarası gerekli" };

    // Validate phone number
    if (!isValidPhoneNumber(phoneNumber)) {
        return { success: false, error: "Geçersiz telefon numarası formatı" };
    }

    try {
        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId },
            select: {
                id: true,
                targetName: true,
                office: true,
            },
        });

        if (!feedback) {
            return { success: false, error: "Geri bildirim bulunamadı" };
        }

        const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/feedback/${feedbackId}`;
        const smsResult = await sendSMS(phoneNumber, link, feedback.targetName, feedback.office ?? undefined);

        return {
            success: smsResult.success,
            error: smsResult.error,
        };
    } catch (error) {
        console.error("SMS send error:", error);
        return { success: false, error: "SMS gönderilirken bir hata oluştu" };
    }
}
