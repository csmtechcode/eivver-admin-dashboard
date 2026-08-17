"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
} from "recharts";
import { useEffect, useState } from "react";

import { fetchDashboardBookingStats } from "@/services/dashboard";

const order: Array<{
    key: string;
    label: string;
    color: string;
}> = [
    { key: "pending", label: "Pending", color: "#eab308" },
    { key: "accepted", label: "Accepted", color: "#3b82f6" },
    { key: "in_progress", label: "In progress", color: "#6366f1" },
    { key: "completed", label: "Completed", color: "#22c55e" },
    { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

export default function BookingChart() {
    const [total, setTotal] = useState<number | null>(null);
    const [series, setSeries] = useState<
        Array<{ label: string; count: number }>
    >([]);

    useEffect(() => {
        let cancelled = false;

        fetchDashboardBookingStats()
            .then((stats) => {
                if (cancelled) return;
                setTotal(stats.totalBookings);

                setSeries(
                    order
                        .map((item) => ({
                            label: item.label,
                            count: stats.statusBreakdown?.[item.key] ?? 0,
                        }))
                        .filter((item) => item.count > 0)
                );
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
            <div className="mb-6">
                <p className="text-sm text-gray-500 dark:text-muted-foreground">
                    Booking Trends
                </p>

                <h2 className="mt-1 text-3xl font-bold">
                    {total?.toLocaleString() ?? "-"}
                </h2>

                <p className="text-sm text-sky-600">
                    Total bookings by status
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis dataKey="label" />

                        <Tooltip />

                        <Bar
                            dataKey="count"
                            name="Bookings"
                            radius={[8, 8, 0, 0]}
                            fill="#3b82f6"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}