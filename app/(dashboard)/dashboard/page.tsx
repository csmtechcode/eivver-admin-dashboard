import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsGrid from "@/components/dashboard/stats-grid";
import RevenueChart from "@/components/dashboard/revenue-chart";
import BookingChart from "@/components/dashboard/booking-chart";
import LatestBookings from "@/components/dashboard/latest-bookings";
import LatestPayments from "@/components/dashboard/latest-payments";
import QuickActions from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
    return (
        <div className="space-y-6 p-6">
            <DashboardHeader />

            <StatsGrid />

            <div className="grid gap-6 lg:grid-cols-2">
                <RevenueChart />
                <BookingChart />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <LatestBookings />
                <LatestPayments />
            </div>

            <QuickActions />
        </div>
    );
}