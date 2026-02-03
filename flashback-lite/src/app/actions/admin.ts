"use server";

import { prisma } from "@/lib/prisma";
import { sendSMS, isValidPhoneNumber } from "@/lib/sms";
import { v4 as uuidv4 } from "uuid";
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
    npsScore: number;
    npsPromoters: number;
    npsPassives: number;
    npsDetractors: number;
    officeStats: { office: string; count: number; avgRating: number; positiveCount: number; npsScore: number }[];
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

    // NPS Score calculation
    // Promoters (5), Passives (3-4), Detractors (1-2)
    // NPS = % Promoters - % Detractors
    const npsPromoters = withRating.filter(f => f.rating === 5).length;
    const npsPassives = withRating.filter(f => f.rating === 3 || f.rating === 4).length;
    const npsDetractors = withRating.filter(f => (f.rating || 0) <= 2).length;
    const npsScore = used > 0 
        ? Math.round(((npsPromoters / used) - (npsDetractors / used)) * 100)
        : 0;

    // Office stats
    const officeMap = new Map<string, { count: number; totalRating: number; positiveCount: number; promoters: number; detractors: number }>();
    withRating.forEach(f => {
        const off = f.office || "Belirtilmemiş";
        const current = officeMap.get(off) || { count: 0, totalRating: 0, positiveCount: 0, promoters: 0, detractors: 0 };
        current.count++;
        current.totalRating += f.rating || 0;
        if ((f.rating || 0) >= 4) current.positiveCount++;
        if (f.rating === 5) current.promoters++;
        if ((f.rating || 0) <= 2) current.detractors++;
        officeMap.set(off, current);
    });

    const officeStats = Array.from(officeMap.entries()).map(([office, data]) => ({
        office,
        count: data.count,
        avgRating: data.count > 0 ? data.totalRating / data.count : 0,
        positiveCount: data.positiveCount,
        npsScore: data.count > 0 ? Math.round(((data.promoters / data.count) - (data.detractors / data.count)) * 100) : 0,
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
        npsScore,
        npsPromoters,
        npsPassives,
        npsDetractors,
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

// Get negative feedbacks (rating 1-2) for ticket system
export async function getNegativeFeedbacks(
    startDate?: string,
    endDate?: string,
    office?: string
) {
    const whereClause: Record<string, unknown> = { 
        isUsed: true,
        rating: { lte: 2 }
    };
    
    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate + "T23:59:59.999Z"),
        };
    }
    
    if (office && office !== "all") {
        whereClause.office = office;
    }

    const feedback = await prisma.feedback.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
    });
    
    return feedback.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
    }));
}

// Get comparison data between two periods
export async function getComparisonStats(
    period1Start: string,
    period1End: string,
    period2Start: string,
    period2End: string,
    office?: string
): Promise<{
    period1: AdvancedStats;
    period2: AdvancedStats;
    comparison: {
        avgRatingChange: number;
        npsChange: number;
        positiveRateChange: number;
        volumeChange: number;
    };
}> {
    const period1Stats = await getAdvancedStats(period1Start, period1End, office);
    const period2Stats = await getAdvancedStats(period2Start, period2End, office);

    const period1PositiveRate = period1Stats.used > 0 ? (period1Stats.positiveCount / period1Stats.used) * 100 : 0;
    const period2PositiveRate = period2Stats.used > 0 ? (period2Stats.positiveCount / period2Stats.used) * 100 : 0;

    return {
        period1: period1Stats,
        period2: period2Stats,
        comparison: {
            avgRatingChange: period2Stats.averageRating - period1Stats.averageRating,
            npsChange: period2Stats.npsScore - period1Stats.npsScore,
            positiveRateChange: period2PositiveRate - period1PositiveRate,
            volumeChange: period2Stats.used - period1Stats.used,
        },
    };
}

// Get monthly targets and progress
export interface MonthlyTarget {
    month: string;
    targetNps: number;
    targetAvgRating: number;
    targetPositiveRate: number;
    actualNps: number;
    actualAvgRating: number;
    actualPositiveRate: number;
    totalFeedbacks: number;
}

export async function getMonthlyProgress(year: number, month: number): Promise<MonthlyTarget> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const stats = await getAdvancedStats(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
    );
    
    const positiveRate = stats.used > 0 ? (stats.positiveCount / stats.used) * 100 : 0;
    
    // Default targets (can be made configurable later)
    const targets = {
        nps: 50,
        avgRating: 4.0,
        positiveRate: 75,
    };
    
    return {
        month: `${year}-${String(month).padStart(2, '0')}`,
        targetNps: targets.nps,
        targetAvgRating: targets.avgRating,
        targetPositiveRate: targets.positiveRate,
        actualNps: stats.npsScore,
        actualAvgRating: stats.averageRating,
        actualPositiveRate: positiveRate,
        totalFeedbacks: stats.used,
    };
}

// Get calendar data for feedback visualization
export async function getCalendarData(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const feedback = await prisma.feedback.findMany({
        where: {
            isUsed: true,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            id: true,
            targetName: true,
            rating: true,
            office: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });
    
    // Group by day
    const dayMap = new Map<number, { count: number; avgRating: number; feedbacks: typeof feedback }>();
    
    feedback.forEach(f => {
        const day = f.createdAt.getDate();
        const current = dayMap.get(day) || { count: 0, avgRating: 0, feedbacks: [] };
        current.feedbacks.push(f);
        current.count = current.feedbacks.length;
        current.avgRating = current.feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / current.count;
        dayMap.set(day, current);
    });
    
    return Array.from(dayMap.entries()).map(([day, data]) => ({
        day,
        count: data.count,
        avgRating: data.avgRating,
        feedbacks: data.feedbacks.map(f => ({
            ...f,
            createdAt: f.createdAt.toISOString(),
        })),
    }));
}

export async function createFeedbackLink(targetName: string, phoneNumber?: string, office?: string) {
    if (!targetName) return { error: "İsim gerekli" };

    // Validate phone number if provided
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        return { error: "Geçersiz telefon numarası formatı" };
    }

    try {
        const id = uuidv4();
        await prisma.feedback.create({
            data: {
                id,
                targetName,
                phone: phoneNumber || null,
                office: office || null,
            },
        });

        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, "");
        const link = `${baseUrl}/anket/${id}`;

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
        return { error: `Link oluşturulurken bir hata oluştu: ${(error as Error).message}` };
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

        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, "");
        const link = `${baseUrl}/anket/${feedbackId}`;
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
            const id = uuidv4();
            await prisma.feedback.create({
                data: {
                    id,
                    targetName: contact.name,
                    phone: contact.phone || null,
                    office: contact.office || null,
                },
            });
            
            const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, "");
            const link = `${baseUrl}/feedback/${id}`;
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
