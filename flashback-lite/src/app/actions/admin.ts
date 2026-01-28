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

export async function getOfficeList() {
    const offices = await prisma.feedback.findMany({
        where: { office: { not: null } },
        select: { office: true },
        distinct: ['office'],
    });
    return offices.map(o => o.office).filter(Boolean) as string[];
}

export interface AdvancedStats {
    total: number;
    used: number;
    averageRating: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    officeStats: { office: string; count: number; avgRating: number; positiveCount: number }[];
    timeSeriesData: { date: string; count: number; avgRating: number; positiveCount: number; negativeCount: number }[];
}

export async function getAdvancedStats(
    startDate?: string,
    endDate?: string,
    office?: string
): Promise<AdvancedStats> {
    const whereClause: Record<string, unknown> = { isUsed: true };
    
    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate + "T23:59:59.999Z"),
        };
    }
    
    if (office && office !== "all") {
        whereClause.office = office;
    }

    // Get all feedback matching criteria
    const feedback = await prisma.feedback.findMany({
        where: whereClause,
        select: {
            id: true,
            rating: true,
            office: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const total = feedback.length;
    const withRating = feedback.filter(f => f.rating !== null);
    const used = withRating.length;
    
    const averageRating = used > 0
        ? withRating.reduce((acc, curr) => acc + (curr.rating || 0), 0) / used
        : 0;

    // Positive (4-5), Neutral (3), Negative (1-2)
    const positiveCount = withRating.filter(f => (f.rating || 0) >= 4).length;
    const neutralCount = withRating.filter(f => f.rating === 3).length;
    const negativeCount = withRating.filter(f => (f.rating || 0) <= 2).length;

    // Office stats
    const officeMap = new Map<string, { count: number; totalRating: number; positiveCount: number }>();
    withRating.forEach(f => {
        const off = f.office || "Belirtilmemiş";
        const current = officeMap.get(off) || { count: 0, totalRating: 0, positiveCount: 0 };
        current.count++;
        current.totalRating += f.rating || 0;
        if ((f.rating || 0) >= 4) current.positiveCount++;
        officeMap.set(off, current);
    });

    const officeStats = Array.from(officeMap.entries()).map(([office, data]) => ({
        office,
        count: data.count,
        avgRating: data.count > 0 ? data.totalRating / data.count : 0,
        positiveCount: data.positiveCount,
    })).sort((a, b) => b.count - a.count);

    // Time series - group by day
    const dateMap = new Map<string, { count: number; totalRating: number; positiveCount: number; negativeCount: number }>();
    withRating.forEach(f => {
        const dateStr = f.createdAt.toISOString().split("T")[0];
        const current = dateMap.get(dateStr) || { count: 0, totalRating: 0, positiveCount: 0, negativeCount: 0 };
        current.count++;
        current.totalRating += f.rating || 0;
        if ((f.rating || 0) >= 4) current.positiveCount++;
        if ((f.rating || 0) <= 2) current.negativeCount++;
        dateMap.set(dateStr, current);
    });

    const timeSeriesData = Array.from(dateMap.entries()).map(([date, data]) => ({
        date,
        count: data.count,
        avgRating: data.count > 0 ? data.totalRating / data.count : 0,
        positiveCount: data.positiveCount,
        negativeCount: data.negativeCount,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
        total,
        used,
        averageRating,
        positiveCount,
        negativeCount,
        neutralCount,
        officeStats,
        timeSeriesData,
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

export interface BulkContactItem {
    id: string;
    name: string;
    phone: string;
    office: string;
    isValid: boolean;
    error?: string;
}

export interface BulkSendResult {
    id: string;
    name: string;
    success: boolean;
    error?: string;
    link?: string;
}

export async function createBulkFeedbackLinks(contacts: BulkContactItem[]): Promise<{
    success: boolean;
    results: BulkSendResult[];
    totalSuccess: number;
    totalFailed: number;
}> {
    const results: BulkSendResult[] = [];
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const contact of contacts) {
        if (!contact.isValid) {
            results.push({
                id: contact.id,
                name: contact.name,
                success: false,
                error: contact.error || "Geçersiz veri",
            });
            totalFailed++;
            continue;
        }

        try {
            const id = nanoid(10);
            await prisma.feedback.create({
                data: {
                    id,
                    targetName: contact.name,
                    office: contact.office || null,
                },
            });

            const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/feedback/${id}`;
            const smsResult = await sendSMS(contact.phone, link, contact.name, contact.office);

            if (smsResult.success) {
                results.push({
                    id: contact.id,
                    name: contact.name,
                    success: true,
                    link,
                });
                totalSuccess++;
            } else {
                results.push({
                    id: contact.id,
                    name: contact.name,
                    success: false,
                    error: smsResult.error || "SMS gönderilemedi",
                    link,
                });
                totalFailed++;
            }
        } catch (error) {
            console.error("Bulk create error for", contact.name, error);
            results.push({
                id: contact.id,
                name: contact.name,
                success: false,
                error: "Link oluşturulurken hata oluştu",
            });
            totalFailed++;
        }
    }

    revalidatePath("/admin");
    return {
        success: totalFailed === 0,
        results,
        totalSuccess,
        totalFailed,
    };
}
