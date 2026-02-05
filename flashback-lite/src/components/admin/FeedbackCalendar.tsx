"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";
import { tr } from "date-fns/locale";
import { getCalendarData } from "@/app/actions/admin";

interface CalendarFeedback {
    id: string;
    target_name: string;
    rating: number | null;
    office: string | null;
    created_at: string;
}

interface DayData {
    day: number;
    count: number;
    avgRating: number;
    feedbacks: CalendarFeedback[];
}

export default function FeedbackCalendar() {
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState<DayData[]>([]);
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getCalendarData(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1
            );
            setCalendarData(data);
        } catch (error) {
            console.error("Failed to load calendar data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        setSelectedDay(null);
    }, [currentDate]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = getDay(monthStart);
    // Adjust for Monday start (Turkish calendar starts on Monday)
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const getDayData = (day: number): DayData | undefined => {
        return calendarData.find(d => d.day === day);
    };

    const getRatingColor = (rating: number | undefined) => {
        if (!rating) return "bg-gray-100";
        if (rating >= 4) return "bg-green-100 hover:bg-green-200";
        if (rating >= 3) return "bg-yellow-100 hover:bg-yellow-200";
        return "bg-red-100 hover:bg-red-200";
    };

    const getRatingBadge = (rating: number | null) => {
        if (!rating) return null;
        const colors = {
            1: "bg-red-500",
            2: "bg-orange-500",
            3: "bg-yellow-500",
            4: "bg-lime-500",
            5: "bg-green-500",
        };
        return colors[rating as keyof typeof colors] || "bg-gray-500";
    };

    const previousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                Takvim Görünümü
            </h3>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h4 className="text-lg font-semibold text-gray-900">
                    {format(currentDate, "MMMM yyyy", { locale: tr })}
                </h4>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before month start */}
                        {Array.from({ length: adjustedStartDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded-lg" />
                        ))}

                        {/* Days of month */}
                        {daysInMonth.map((date) => {
                            const day = date.getDate();
                            const dayData = getDayData(day);
                            const hasData = !!dayData;
                            const today = isToday(date);

                            return (
                                <button
                                    key={day}
                                    onClick={() => hasData && setSelectedDay(dayData)}
                                    disabled={!hasData}
                                    className={`
                                        aspect-square rounded-lg p-1 text-sm transition relative
                                        ${hasData ? getRatingColor(dayData.avgRating) + " cursor-pointer" : "bg-gray-50"}
                                        ${today ? "ring-2 ring-blue-500" : ""}
                                        ${selectedDay?.day === day ? "ring-2 ring-gray-900" : ""}
                                    `}
                                >
                                    <div className={`font-medium ${today ? "text-blue-600" : "text-gray-900"}`}>
                                        {day}
                                    </div>
                                    {hasData && (
                                        <div className="text-xs text-gray-600">
                                            {dayData.count} fb
                                        </div>
                                    )}
                                    {hasData && (
                                        <div className="absolute bottom-1 right-1 text-[10px] font-bold text-gray-700">
                                            ★{dayData.avgRating.toFixed(1)}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-100 rounded"></div>
                            <span>4-5 puan</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                            <span>3 puan</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-100 rounded"></div>
                            <span>1-2 puan</span>
                        </div>
                    </div>

                    {/* Selected Day Details */}
                    {selectedDay && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="font-semibold text-gray-900">
                                    {selectedDay.day} {format(currentDate, "MMMM", { locale: tr })} - {selectedDay.count} Geri Bildirim
                                </h5>
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {selectedDay.feedbacks.map((fb) => (
                                    <div key={fb.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                                        <div>
                                            <div className="font-medium text-gray-900">{fb.target_name}</div>
                                            <div className="text-xs text-gray-500">{fb.office || "Ofis belirtilmemiş"}</div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-white text-xs font-bold ${getRatingBadge(fb.rating)}`}>
                                            ★ {fb.rating}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
