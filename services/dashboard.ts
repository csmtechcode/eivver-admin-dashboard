import api from "./api";
import type { BookingStats, DashboardMetrics, UserStats } from "@/types/dashboard";
import type { Paginated } from "@/types/api";
import type { Booking } from "@/types/booking";
import type { Payment } from "@/types/payment";

export const fetchDashboardSummary = async (
    from?: string,
    to?: string
): Promise<DashboardMetrics> => {
    const data = await api.get<{ metrics: DashboardMetrics }>("/admin/dashboard/summary", {
        params: { from, to },
    });

    return data.metrics;
};

export const fetchDashboardUserStats = async (): Promise<UserStats> => {
    const data = await api.get<{ stats: UserStats }>("/admin/dashboard/users");

    return data.stats;
};

export const fetchDashboardBookingStats = async (): Promise<BookingStats> => {
    const data = await api.get<{ stats: BookingStats }>("/admin/dashboard/bookings");

    return data.stats;
};

export const fetchDashboardLatestBookings = async (): Promise<Booking[]> => {
    const data = await api.get<Paginated<Booking>>("/admin/bookings", {
        params: { page: 1, limit: 5 },
    });

    return data.items;
};

export const fetchDashboardLatestPayments = async (): Promise<Payment[]> => {
    const data = await api.get<Paginated<Payment>>("/admin/financial/payments", {
        params: { page: 1, limit: 5 },
    });

    return data.items;
};
