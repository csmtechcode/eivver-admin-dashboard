import api from "./api";
import type { Paginated } from "@/types/api";
import type { Booking, BookingStatus } from "@/types/booking";

export interface ListBookingsParams {
    page?: number;
    limit?: number;
    status?: BookingStatus;
    customerId?: string;
    fixerId?: string;
    isEmergency?: boolean;
    from?: string;
    to?: string;
}

export const fetchBookings = async (
    params: ListBookingsParams = {}
): Promise<Paginated<Booking>> => {
    return api.get<Paginated<Booking>>("/admin/bookings", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            status: params.status || undefined,
            customerId: params.customerId || undefined,
            fixerId: params.fixerId || undefined,
            isEmergency: params.isEmergency,
            from: params.from || undefined,
            to: params.to || undefined,
        },
    });
};

export const fetchBookingById = async (id: string): Promise<Booking> => {
    const data = await api.get<{ booking: Booking }>(`/admin/bookings/${id}`);

    return data.booking;
};

export const fetchBookingStats = async (from?: string, to?: string): Promise<{
    totalBookings: number;
    pendingBookings: number;
    acceptedBookings: number;
    inProgressBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    todayBookings: number;
    activeBookings: number;
    statusBreakdown: Record<string, number>;
}> => {
    const data = await api.get<{
        stats: {
            totalBookings: number;
            pendingBookings: number;
            acceptedBookings: number;
            inProgressBookings: number;
            completedBookings: number;
            cancelledBookings: number;
            todayBookings: number;
            activeBookings: number;
            statusBreakdown: Record<string, number>;
        };
    }>("/admin/bookings/stats", { params: { from, to } });

    return data.stats;
};

export const forceCancelBooking = async (id: string, reason: string): Promise<Booking> => {
    return api.patch<Booking>(`/admin/bookings/${id}/cancel`, { reason });
};

export const reassignBookingFixer = async (
    id: string,
    newFixerId: string,
    reason: string
): Promise<Booking> => {
    return api.patch<Booking>(`/admin/bookings/${id}/reassign`, {
        newFixerId,
        reason,
    });
};
