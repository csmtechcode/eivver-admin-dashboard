export interface PlatformSettings {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    currency: string;
    serviceFeePercent: number;
    maintenanceMode: boolean;
}

export interface DashboardMetrics {
    totalUsers: number;
    totalCustomers: number;
    totalFixers: number;
    verifiedFixers: number;
    onlineFixers: number;
    completedBookings: number;
    revenue: number;
    commissionEarned: number;
    activeBookings: number;
    failedPayments: number;
    range: { from: string | null; to: string | null };
}

export interface BookingStats {
    totalBookings: number;
    pendingBookings: number;
    acceptedBookings: number;
    inProgressBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    todayBookings: number;
    activeBookings: number;
    statusBreakdown: Record<string, number>;
}

export interface UserStats {
    totalUsers: number;
    customers: number;
    fixers: number;
    admins: number;
    verified: number;
    suspended: number;
    banned: number;
    newToday: number;
    newThisMonth: number;
}

export interface FixerDashboardStats {
    totalFixers: number;
    pendingFixers: number;
    onlineFixers: number;
    offlineFixers: number;
    busyFixers: number;
    verifiedFixers: number;
}

export interface RevenuePoint {
    period: string;
    grossRevenue: number;
    commissionEarned: number;
    fixerEarnings: number;
    settlementCount: number;
}

export interface RevenueReport {
    groupBy: "day" | "week" | "month";
    totals: {
        grossRevenue: number;
        commissionEarned: number;
        fixerEarnings: number;
        settlementCount: number;
    };
    series: RevenuePoint[];
}