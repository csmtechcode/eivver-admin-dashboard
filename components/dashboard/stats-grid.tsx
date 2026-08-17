"use client";

import { CalendarCheck, DollarSign, Users, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/utils";
import { fetchDashboardSummary } from "@/services/dashboard";
import StatCard from "./stat-card";

interface DashboardStats {
    totalUsers: number;
    revenue: number;
    totalBookings: number;
    totalFixers: number;
}

export default function StatsGrid() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchDashboardSummary()
            .then((data) => {
                if (cancelled) return;
                setStats({
                    totalUsers: data.totalUsers,
                    revenue: data.revenue,
                    totalBookings: data.completedBookings,
                    totalFixers: data.totalFixers,
                });
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, []);

    const items = [
        {
            title: "Total Users",
            value: stats ? stats.totalUsers.toLocaleString() : "-",
            change: stats ? "Customers & fixers combined" : undefined,
            icon: <Users className="h-5 w-5 text-primary" />,
        },
        {
            title: "Revenue",
            value: stats ? formatCurrency(stats.revenue) : "-",
            change: stats ? "Gross platform revenue" : undefined,
            icon: <DollarSign className="h-5 w-5 text-primary" />,
        },
        {
            title: "Completed Bookings",
            value: stats ? stats.totalBookings.toLocaleString() : "-",
            change: stats ? "Finished jobs" : undefined,
            icon: <CalendarCheck className="h-5 w-5 text-primary" />,
        },
        {
            title: "Total Fixers",
            value: stats ? stats.totalFixers.toLocaleString() : "-",
            change: stats ? "Registered professionals" : undefined,
            icon: <Wrench className="h-5 w-5 text-primary" />,
        },
    ];

    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <StatCard
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    change={item.change}
                    icon={item.icon}
                />
            ))}
        </div>
    );
}